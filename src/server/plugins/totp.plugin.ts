import * as crypto from "crypto";

const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateSecret(length = 16): string {
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += base32chars[Math.floor(Math.random() * base32chars.length)];
  }
  return secret;
}

export function base32Decode(base32str: string): Buffer {
  let bits = 0;
  let value = 0;
  let index = 0;
  const paddingRemovedStr = base32str.replace(/=+$/, '');
  const output = Buffer.alloc(Math.ceil((paddingRemovedStr.length * 5) / 8));

  for (let i = 0; i < paddingRemovedStr.length; i++) {
    const char = paddingRemovedStr.charAt(i).toUpperCase();
    const val = base32chars.indexOf(char);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return output.subarray(0, index);
}

export function generateTOTP(secretBase32: string, window = 0): string {
  const secretBytes = base32Decode(secretBase32.replace(/\W+/g, '').toUpperCase());
  const buffer = Buffer.alloc(8);
  const timeInfo = Math.floor(Date.now() / 30000) + window;
  buffer.writeUInt32BE(Math.floor(timeInfo / 0x100000000), 0);
  buffer.writeUInt32BE(timeInfo % 0x100000000, 4);
  
  const hmac = crypto.createHmac('sha1', secretBytes);
  hmac.update(buffer);
  const hmacResult = hmac.digest();
  const offset = hmacResult[hmacResult.length - 1] & 0x0f;
  const code = ((hmacResult[offset] & 0x7f) << 24) |
               ((hmacResult[offset + 1] & 0xff) << 16) |
               ((hmacResult[offset + 2] & 0xff) << 8) |
               (hmacResult[offset + 3] & 0xff);
               
  const otp = code % 1000000;
  return otp.toString().padStart(6, '0');
}

export function verifyTOTP(token: string, secret: string, windowTolerance = 1): boolean {
  for (let i = -windowTolerance; i <= windowTolerance; i++) {
    if (generateTOTP(secret, i) === token) return true;
  }
  return false;
}

export function generateOtpAuthUri(accountName: string, issuer: string, secret: string): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}