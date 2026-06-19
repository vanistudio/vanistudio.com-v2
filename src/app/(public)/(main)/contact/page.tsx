import { extensionsRepository } from "@/server/repositories/extensions.repository";
import PubContactForm from "@/components/contents/public/_contact/PubContactForm";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const ext = await extensionsRepository.getExtensionById("contact_page_customizer");
  const config = ext?.config as any;
  return {
    title: `${config?.uiConfig?.title || "Liên hệ"} | Vani Studio`,
    description: config?.uiConfig?.description || "Liên hệ với chúng tôi để nhận hỗ trợ và báo giá dịch vụ nhanh nhất.",
  };
}

export default async function ContactPage() {
  const ext = await extensionsRepository.getExtensionById("contact_page_customizer");
  return (
    <PubContactForm
      isEnabled={ext?.isEnabled ?? false}
      config={ext?.config as any}
    />
  );
}
