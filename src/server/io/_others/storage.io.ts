import { db } from "@/server/db";
import { gallery, type GalleryItem } from "@/server/db/schemas/gallery.schema";
import { extensionsRepository } from "@/server/repositories/extensions.repository";
import fs from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import sharp from "sharp";

export interface UploadParams {
  base64: string;
  folder: string;
  fileNamePrefix: string;
  domain?: string;
}

interface ImageProcessingConfig {
  enabled: boolean;
  convertToWebp: boolean;
  convertFormats: string[];
  quality: number;
  maxWidth: number;
  maxHeight: number;
  stripMetadata: boolean;
  progressive: boolean;
  preserveOriginal: boolean;
}

export class StorageService {
  private static async getStorageConfig() {
    const ext = await extensionsRepository.getExtensionById("storage_config");
    return ext?.config || { siteActiveStorage: "local" };
  }

  private static getDataInfo(base64: string) {
    const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid base64 data string");
    }
    const mimeType = matches[1];
    const extension = mimeType.split("/")[1] === "jpeg" ? "jpg" : mimeType.split("/")[1];
    const buffer = Buffer.from(matches[2], "base64");
    return { extension, buffer, mimeType };
  }

  private static async processImage(
    buffer: Buffer,
    extension: string,
    imgConfig: ImageProcessingConfig
  ): Promise<{ buffer: Buffer; extension: string; mimeType: string }> {
    if (extension === "gif") {
      return { buffer, extension, mimeType: "gif" };
    }
    if (!imgConfig.enabled) {
      return { buffer, extension, mimeType: extension === "jpg" ? "jpeg" : extension };
    }
    let pipeline = sharp(buffer);
    if (imgConfig.stripMetadata) {
      pipeline = pipeline.rotate();
    }
    const maxW = imgConfig.maxWidth || undefined;
    const maxH = imgConfig.maxHeight || undefined;
    if (maxW || maxH) {
      pipeline = pipeline.resize(maxW || undefined, maxH || undefined, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }
    const quality = Math.max(1, Math.min(100, imgConfig.quality || 80));
    const shouldConvertToWebp = imgConfig.convertToWebp && (imgConfig.convertFormats || []).includes(extension);
    let outputExtension = extension;
    let outputMimeType = extension === "jpg" ? "jpeg" : extension;
    if (shouldConvertToWebp) {
      pipeline = pipeline.webp({
        quality,
        effort: 4,
      });
      outputExtension = "webp";
      outputMimeType = "webp";
    } else if (extension === "jpg" || extension === "jpeg") {
      pipeline = pipeline.jpeg({
        quality,
        progressive: imgConfig.progressive,
        mozjpeg: true,
      });
      outputMimeType = "jpeg";
    } else if (extension === "png") {
      pipeline = pipeline.png({
        quality,
        progressive: imgConfig.progressive,
        compressionLevel: Math.round((100 - quality) / 11),
      });
      outputMimeType = "png";
    } else if (extension === "webp") {
      pipeline = pipeline.webp({ quality });
      outputMimeType = "webp";
    } else if (extension === "tiff") {
      pipeline = pipeline.tiff({ quality });
      outputMimeType = "tiff";
    }
    if (imgConfig.stripMetadata) {
      pipeline = pipeline.withMetadata({});
    }
    const processedBuffer = await pipeline.toBuffer();
    return { buffer: processedBuffer, extension: outputExtension, mimeType: outputMimeType };
  }

  static async upload({ base64, folder, fileNamePrefix }: UploadParams): Promise<string> {
    if (!base64 || !base64.startsWith("data:")) {
      return base64;
    }
    const config = await this.getStorageConfig() as any;
    const activeStorage = config.siteActiveStorage || "local";
    const imgConfig: ImageProcessingConfig = config.siteImageProcessing || { enabled: false };
    const { extension: rawExtension, buffer: rawBuffer, mimeType: rawMimeType } = this.getDataInfo(base64);
    
    let buffer: any = rawBuffer;
    let extension = rawExtension;
    let mimeType = rawMimeType;

    if (rawMimeType.startsWith("image/") && rawExtension !== "svg") {
      try {
        const processed = await this.processImage(rawBuffer, rawExtension, imgConfig as ImageProcessingConfig);
        buffer = processed.buffer;
        extension = processed.extension;
        mimeType = `image/${processed.mimeType}`;
      } catch (err) {
        console.error("[StorageService] Error processing image:", err);
      }
    }

    const fileName = `${fileNamePrefix}-${Date.now()}.${extension}`;
    let url = "";
    switch (activeStorage) {
      case "cloudinary": {
        const processedBase64 = `data:${mimeType};base64,${buffer.toString("base64")}`;
        url = await this.uploadToCloudinary(processedBase64, folder, config.siteCloudinary);
        break;
      }
      case "r2":
        url = await this.uploadToR2(buffer, `${folder}/${fileName}`, mimeType.replace("image/", ""), config.siteR2);
        break;
      case "tigris":
        url = await this.uploadToTigris(buffer, `${folder}/${fileName}`, mimeType.replace("image/", ""), config.siteTigris);
        break;
      case "local":
      default:
        url = await this.uploadToLocal(buffer, folder, fileName);
        break;
    }

    if (imgConfig.enabled && imgConfig.preserveOriginal && extension !== rawExtension && rawMimeType.startsWith("image/") && rawExtension !== "svg") {
      const originalFileName = `${fileNamePrefix}-${Date.now()}-original.${rawExtension}`;
      try {
        switch (activeStorage) {
          case "r2":
            await this.uploadToR2(rawBuffer, `${folder}/originals/${originalFileName}`, rawMimeType.replace("image/", ""), config.siteR2);
            break;
          case "tigris":
            await this.uploadToTigris(rawBuffer, `${folder}/originals/${originalFileName}`, rawMimeType.replace("image/", ""), config.siteTigris);
            break;
          case "local":
          default:
            await this.uploadToLocal(rawBuffer, `${folder}/originals`, originalFileName);
            break;
        }
      } catch (err) {
        console.error("[StorageService] Error saving original file:", err);
      }
    }

    try {
      await db.insert(gallery).values({
        url: url,
        fileName: fileName,
        size: buffer.length,
        mediaType: mimeType,
        storageType: activeStorage,
      });
    } catch (err) {
      console.error("[StorageService] Error saving to db:", err);
    }

    return url;
  }

  static async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string
  ): Promise<GalleryItem> {
    const config = await this.getStorageConfig() as any;
    const activeStorage = config.siteActiveStorage || "local";
    const imgConfig: ImageProcessingConfig = config.siteImageProcessing || { enabled: false };

    const fileExtension = path.extname(originalName) || ".png";
    const baseName = path.basename(originalName, fileExtension).replace(/[^a-zA-Z0-9]/g, "-");
    const extension = fileExtension.replace(/^\./, "").toLowerCase();

    let finalBuffer: any = buffer;
    let finalExtension = extension;
    let finalMimeType = mimeType;

    if (mimeType.startsWith("image/") && extension !== "svg") {
      try {
        const processed = await this.processImage(buffer, extension, imgConfig);
        finalBuffer = processed.buffer;
        finalExtension = processed.extension;
        finalMimeType = `image/${processed.mimeType}`;
      } catch (err) {
        console.error("[StorageService] Error processing image:", err);
      }
    }

    const uniqueFileName = `${baseName}-${Date.now()}.${finalExtension}`;
    let url = "";

    switch (activeStorage) {
      case "cloudinary": {
        const base64Data = `data:${finalMimeType};base64,${finalBuffer.toString("base64")}`;
        url = await this.uploadToCloudinary(base64Data, folder, config.siteCloudinary);
        break;
      }
      case "r2":
        url = await this.uploadToR2(finalBuffer, `${folder}/${uniqueFileName}`, finalMimeType.replace("image/", ""), config.siteR2);
        break;
      case "tigris":
        url = await this.uploadToTigris(finalBuffer, `${folder}/${uniqueFileName}`, finalMimeType.replace("image/", ""), config.siteTigris);
        break;
      case "local":
      default:
        url = await this.uploadToLocal(finalBuffer, folder, uniqueFileName);
        break;
    }

    if (imgConfig.enabled && imgConfig.preserveOriginal && finalExtension !== extension && mimeType.startsWith("image/") && extension !== "svg") {
      const originalFileName = `${baseName}-${Date.now()}-original.${extension}`;
      try {
        switch (activeStorage) {
          case "r2":
            await this.uploadToR2(buffer, `${folder}/originals/${originalFileName}`, mimeType.replace("image/", ""), config.siteR2);
            break;
          case "tigris":
            await this.uploadToTigris(buffer, `${folder}/originals/${originalFileName}`, mimeType.replace("image/", ""), config.siteTigris);
            break;
          case "local":
          default:
            await this.uploadToLocal(buffer, `${folder}/originals`, originalFileName);
            break;
        }
      } catch (err) {
        console.error("[StorageService] Error saving original file:", err);
      }
    }

    let savedItem: GalleryItem | null = null;
    try {
      const [inserted] = await db.insert(gallery).values({
        url: url,
        fileName: originalName,
        size: finalBuffer.length,
        mediaType: finalMimeType,
        storageType: activeStorage,
      }).returning();
      savedItem = inserted;
    } catch (err) {
      console.error("[StorageService] Error saving to gallery db:", err);
    }

    if (!savedItem) {
      savedItem = {
        id: "",
        url: url,
        fileName: originalName,
        size: finalBuffer.length,
        mediaType: finalMimeType,
        storageType: activeStorage,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return savedItem;
  }

  static async list(folder?: string): Promise<{ url: string; id: string; size?: number; createdAt?: string }[]> {
    const config = await this.getStorageConfig() as any;
    const activeStorage = config.siteActiveStorage;

    switch (activeStorage) {
      case "cloudinary":
        return await this.listFromCloudinary(folder, config.siteCloudinary);
      case "r2":
        return await this.listFromR2(folder, config.siteR2);
      case "tigris":
        return await this.listFromTigris(folder, config.siteTigris);
      case "local":
      default:
        return await this.listFromLocal(folder);
    }
  }

  static async delete(id: string): Promise<boolean> {
    const config = await this.getStorageConfig() as any;
    const activeStorage = config.siteActiveStorage;

    switch (activeStorage) {
      case "cloudinary":
        return await this.deleteFromCloudinary(id, config.siteCloudinary);
      case "r2":
        return await this.deleteFromR2(id, config.siteR2);
      case "tigris":
        return await this.deleteFromTigris(id, config.siteTigris);
      case "local":
      default:
        return await this.deleteFromLocal(id);
    }
  }

  static async deletePhysical(url: string, storageType: string): Promise<boolean> {
    const config = await this.getStorageConfig() as any;

    try {
      if (storageType === "cloudinary") {
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
        if (match) {
          const publicId = match[1];
          return await this.deleteFromCloudinary(publicId, config.siteCloudinary);
        }
        return false;
      } else if (storageType === "r2") {
        const urlObj = new URL(url);
        const key = decodeURIComponent(urlObj.pathname.replace(/^\//, ''));
        return await this.deleteFromR2(key, config.siteR2);
      } else if (storageType === "tigris") {
        const urlObj = new URL(url);
        const key = decodeURIComponent(urlObj.pathname.replace(/^\//, ''));
        return await this.deleteFromTigris(key, config.siteTigris);
      } else {
        let key = url;
        if (url.startsWith("http")) {
           const urlObj = new URL(url);
           key = urlObj.pathname;
        }
        key = decodeURIComponent(key.replace(/^\//, ''));
        return await this.deleteFromLocal(key);
      }
    } catch (err) {
      console.error("[StorageService] deletePhysical Error:", err);
      return false;
    }
  }

  private static async uploadToLocal(buffer: Buffer, folder: string, fileName: string): Promise<string> {
    const safeFolder = folder.replace(/\.\./g, "").replace(/[^a-zA-Z0-9\-_\/]/g, "").replace(/\/+/g, "/");
    const publicDir = path.join(process.cwd(), "public");
    const destDir = path.join(publicDir, safeFolder);
    const destPath = path.join(destDir, fileName);

    if (!destDir.startsWith(publicDir)) {
      throw new Error("Invalid upload path");
    }

    await fs.mkdir(destDir, { recursive: true });
    await fs.writeFile(destPath, buffer);

    return `/${safeFolder}/${fileName}`;
  }

  private static async uploadToCloudinary(base64: string, folder: string, config: any): Promise<string> {
    if (!config || !config.siteCloudName || !config.siteApiKey || !config.siteApiSecret) {
      throw new Error("Cloudinary configuration is missing");
    }

    cloudinary.config({
      cloud_name: config.siteCloudName.trim(),
      api_key: config.siteApiKey.trim(),
      api_secret: config.siteApiSecret.trim(),
      secure: true,
    });

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(base64, { folder }, (error, result) => {
        if (error) {
          console.error("[StorageService] Cloudinary Upload Error:", error);
          reject(new Error("Cloudinary upload failed"));
        } else {
          resolve(result?.secure_url || "");
        }
      });
    });
  }

  private static async uploadToR2(buffer: Buffer, key: string, mimeType: string, config: any): Promise<string> {
    if (!config || !config.siteAccountId || !config.siteAccessKeyId || !config.siteSecretAccessKey || !config.siteBucketName) {
      throw new Error("R2 configuration is missing");
    }

    const cleanAccountId = config.siteAccountId.trim();
    const cleanAccessKeyId = config.siteAccessKeyId.trim();
    const cleanSecretAccessKey = config.siteSecretAccessKey.trim();
    const cleanBucketName = config.siteBucketName.trim();

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${cleanAccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: cleanAccessKeyId,
        secretAccessKey: cleanSecretAccessKey,
      },
    });

    await s3.send(
      new PutObjectCommand({
        Bucket: cleanBucketName,
        Key: key,
        Body: buffer,
        ContentType: `image/${mimeType}`,
      })
    );

    const publicUrl = config.sitePublicUrl?.trim()?.replace(/\/$/, "") || `https://${cleanBucketName}.${cleanAccountId}.r2.cloudflarestorage.com`;
    return `${publicUrl}/${key}`;
  }

  private static async uploadToTigris(buffer: Buffer, key: string, mimeType: string, config: any): Promise<string> {
    if (!config || !config.siteAccessKeyId || !config.siteSecretAccessKey || !config.siteBucketName) {
      throw new Error("Tigris configuration is missing");
    }

    const cleanAccessKeyId = config.siteAccessKeyId.trim();
    const cleanSecretAccessKey = config.siteSecretAccessKey.trim();
    const cleanBucketName = config.siteBucketName.trim();

    const s3 = new S3Client({
      region: "auto",
      endpoint: "https://fly.storage.tigris.dev",
      credentials: {
        accessKeyId: cleanAccessKeyId,
        secretAccessKey: cleanSecretAccessKey,
      },
    });

    await s3.send(
      new PutObjectCommand({
        Bucket: cleanBucketName,
        Key: key,
        Body: buffer,
        ContentType: `image/${mimeType}`,
      })
    );

    return `https://${cleanBucketName}.fly.storage.tigris.dev/${key}`;
  }

  private static async listFromLocal(folder?: string): Promise<{ url: string; id: string; size?: number; createdAt?: string }[]> {
    const publicDir = path.join(process.cwd(), "public");
    const targetDir = folder ? path.join(publicDir, folder) : publicDir;
    
    try {
      const files = await fs.readdir(targetDir, { withFileTypes: true });
      const images: { url: string; id: string; size?: number; createdAt?: string }[] = [];
      
      for (const file of files) {
        if (file.isFile()) {
          const ext = path.extname(file.name).toLowerCase();
          if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(ext)) {
            const relativePath = folder ? `/${folder}/${file.name}` : `/${file.name}`;
            const stats = await fs.stat(path.join(targetDir, file.name));
            images.push({
              url: relativePath.replace(/\/+/g, '/'),
              id: relativePath,
              size: stats.size,
              createdAt: stats.birthtime.toISOString(),
            });
          }
        }
      }
      return images.sort((a, b) => (new Date(b.createdAt || 0)).getTime() - (new Date(a.createdAt || 0)).getTime());
    } catch (error) {
      console.error("[StorageService] Local List Error:", error);
      return [];
    }
  }

  private static async deleteFromLocal(id: string): Promise<boolean> {
    const safePath = id.replace(/\.\./g, "").replace(/^\/+/, "");
    const absolutePath = path.join(process.cwd(), "public", safePath);
    try {
      await fs.unlink(absolutePath);
      return true;
    } catch (error) {
      console.error("[StorageService] Local Delete Error:", error);
      return false;
    }
  }

  private static async listFromCloudinary(folder: string | undefined, config: any): Promise<{ url: string; id: string; size?: number; createdAt?: string }[]> {
    if (!config || !config.siteCloudName || !config.siteApiKey || !config.siteApiSecret) {
      throw new Error("Cloudinary configuration is missing");
    }

    cloudinary.config({
      cloud_name: config.siteCloudName.trim(),
      api_key: config.siteApiKey.trim(),
      api_secret: config.siteApiSecret.trim(),
      secure: true,
    });

    return new Promise((resolve, reject) => {
      cloudinary.api.resources(
        { type: 'upload', prefix: folder ? `${folder}/` : undefined, max_results: 100 },
        (error, result) => {
          if (error) {
            console.error("[StorageService] Cloudinary List Error:", error);
            resolve([]);
          } else {
            const images = result.resources.map((res: any) => ({
              url: res.secure_url,
              id: res.public_id,
              size: res.bytes,
              createdAt: res.created_at,
            }));
            resolve(images);
          }
        }
      );
    });
  }

  private static async deleteFromCloudinary(id: string, config: any): Promise<boolean> {
    if (!config || !config.siteCloudName || !config.siteApiKey || !config.siteApiSecret) {
      throw new Error("Cloudinary configuration is missing");
    }

    cloudinary.config({
      cloud_name: config.siteCloudName.trim(),
      api_key: config.siteApiKey.trim(),
      api_secret: config.siteApiSecret.trim(),
      secure: true,
    });

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(id, (error, result) => {
        if (error) {
          console.error("[StorageService] Cloudinary Delete Error:", error);
          resolve(false);
        } else {
          resolve(result.result === "ok");
        }
      });
    });
  }

  private static async listFromR2(folder: string | undefined, config: any): Promise<{ url: string; id: string; size?: number; createdAt?: string }[]> {
    if (!config || !config.siteAccountId || !config.siteAccessKeyId || !config.siteSecretAccessKey || !config.siteBucketName) {
      throw new Error("R2 configuration is missing");
    }

    const cleanAccountId = config.siteAccountId.trim();
    const cleanAccessKeyId = config.siteAccessKeyId.trim();
    const cleanSecretAccessKey = config.siteSecretAccessKey.trim();
    const cleanBucketName = config.siteBucketName.trim();

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${cleanAccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: cleanAccessKeyId,
        secretAccessKey: cleanSecretAccessKey,
      },
    });

    try {
      const command = new ListObjectsV2Command({
        Bucket: cleanBucketName,
        Prefix: folder ? `${folder}/` : undefined,
      });

      const response = await s3.send(command);
      const publicUrl = config.sitePublicUrl?.trim()?.replace(/\/$/, "") || `https://${cleanBucketName}.${cleanAccountId}.r2.cloudflarestorage.com`;

      return (response.Contents || []).map(item => ({
        url: `${publicUrl}/${item.Key}`,
        id: item.Key as string,
        size: item.Size,
        createdAt: item.LastModified?.toISOString(),
      })).sort((a, b) => (new Date(b.createdAt || 0)).getTime() - (new Date(a.createdAt || 0)).getTime());
    } catch (error) {
      console.error("[StorageService] R2 List Error:", error);
      return [];
    }
  }

  private static async deleteFromR2(id: string, config: any): Promise<boolean> {
    if (!config || !config.siteAccountId || !config.siteAccessKeyId || !config.siteSecretAccessKey || !config.siteBucketName) {
      throw new Error("R2 configuration is missing");
    }

    const cleanAccountId = config.siteAccountId.trim();
    const cleanAccessKeyId = config.siteAccessKeyId.trim();
    const cleanSecretAccessKey = config.siteSecretAccessKey.trim();
    const cleanBucketName = config.siteBucketName.trim();

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${cleanAccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: cleanAccessKeyId,
        secretAccessKey: cleanSecretAccessKey,
      },
    });

    try {
      const command = new DeleteObjectCommand({
        Bucket: cleanBucketName,
        Key: id,
      });

      await s3.send(command);
      return true;
    } catch (error) {
      console.error("[StorageService] R2 Delete Error:", error);
      return false;
    }
  }

  private static async listFromTigris(folder: string | undefined, config: any): Promise<{ url: string; id: string; size?: number; createdAt?: string }[]> {
    if (!config || !config.siteAccessKeyId || !config.siteSecretAccessKey || !config.siteBucketName) {
      throw new Error("Tigris configuration is missing");
    }

    const cleanAccessKeyId = config.siteAccessKeyId.trim();
    const cleanSecretAccessKey = config.siteSecretAccessKey.trim();
    const cleanBucketName = config.siteBucketName.trim();

    const s3 = new S3Client({
      region: "auto",
      endpoint: "https://fly.storage.tigris.dev",
      credentials: {
        accessKeyId: cleanAccessKeyId,
        secretAccessKey: cleanSecretAccessKey,
      },
    });

    try {
      const command = new ListObjectsV2Command({
        Bucket: cleanBucketName,
        Prefix: folder ? `${folder}/` : undefined,
      });

      const response = await s3.send(command);
      return (response.Contents || []).map(item => ({
        url: `https://${cleanBucketName}.fly.storage.tigris.dev/${item.Key}`,
        id: item.Key as string,
        size: item.Size,
        createdAt: item.LastModified?.toISOString(),
      })).sort((a, b) => (new Date(b.createdAt || 0)).getTime() - (new Date(a.createdAt || 0)).getTime());
    } catch (error) {
      console.error("[StorageService] Tigris List Error:", error);
      return [];
    }
  }

  private static async deleteFromTigris(id: string, config: any): Promise<boolean> {
    if (!config || !config.siteAccessKeyId || !config.siteSecretAccessKey || !config.siteBucketName) {
      throw new Error("Tigris configuration is missing");
    }

    const cleanAccessKeyId = config.siteAccessKeyId.trim();
    const cleanSecretAccessKey = config.siteSecretAccessKey.trim();
    const cleanBucketName = config.siteBucketName.trim();

    const s3 = new S3Client({
      region: "auto",
      endpoint: "https://fly.storage.tigris.dev",
      credentials: {
        accessKeyId: cleanAccessKeyId,
        secretAccessKey: cleanSecretAccessKey,
      },
    });

    try {
      const command = new DeleteObjectCommand({
        Bucket: cleanBucketName,
        Key: id,
      });

      await s3.send(command);
      return true;
    } catch (error) {
      console.error("[StorageService] Tigris Delete Error:", error);
      return false;
    }
  }
}
