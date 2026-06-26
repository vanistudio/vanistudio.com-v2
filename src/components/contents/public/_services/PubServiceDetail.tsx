"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import type { Service, ServiceType, ServicePackage } from "@/server/db/schemas/service.schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MdxRenderer } from "@/components/vanixjnk/mdx-builder";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PubServiceDetailProps {
  service: Service & { serviceType: ServiceType | null };
  packages: ServicePackage[];
}

const getServiceTypeMeta = (typeObj: ServiceType | null) => {
  if (!typeObj) {
    return {
      label: "Khác",
      icon: "solar:menu-dots-square-line-duotone",
      color: "text-zinc-500",
      bg: "bg-zinc-500/10",
      border: "border-zinc-500/20",
    };
  }
  return {
    label: typeObj.name,
    icon: typeObj.icon || "solar:menu-dots-square-line-duotone",
    color: typeObj.color || "text-zinc-500",
    bg: typeObj.bg || "bg-zinc-500/10",
    border: typeObj.border || "border-zinc-500/20",
  };
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

export default function PubServiceDetail({ service, packages }: PubServiceDetailProps) {
  const meta = getServiceTypeMeta(service.serviceType);

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerSocial, setCustomerSocial] = useState("");
  const [requirements, setRequirements] = useState("");
  const [specifications, setSpecifications] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [selectedFileNames, setSelectedFileNames] = useState<Record<string, string>>({});

  const mutation = trpc.administrator.services.createRequest.useMutation();

  const handleOpenOrder = (packageId: string | null = null) => {
    setSelectedPackageId(packageId);
    
    const initialSpecs: Record<string, any> = {};
    service.fieldsConfig.forEach((field) => {
      if (field.type === "checkbox") {
        initialSpecs[field.key] = false;
      } else {
        initialSpecs[field.key] = "";
      }
    });
    setSpecifications(initialSpecs);
    setFormErrors({});
    setIsOrderDialogOpen(true);
  };

  const handleSpecChange = (key: string, value: any) => {
    setSpecifications((prev) => ({
      ...prev,
      [key]: value,
    }));
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const descText = `[Tệp cục bộ: ${file.name} | ${Math.round(file.size / 1024)} KB]`;
      setSelectedFileNames((prev) => ({ ...prev, [key]: file.name }));
      handleSpecChange(key, descText);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!customerName.trim()) errors.customerName = "Họ tên không được để trống";
    if (!customerEmail.trim()) {
      errors.customerEmail = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(customerEmail)) {
      errors.customerEmail = "Email không hợp lệ";
    }
    if (!customerPhone.trim()) errors.customerPhone = "Số điện thoại không được để trống";
    if (!customerSocial.trim()) errors.customerSocial = "Kênh liên hệ không được để trống";

    service.fieldsConfig.forEach((field) => {
      const val = specifications[field.key];
      if (field.required) {
        if (field.type === "checkbox" && !val) {
          errors[field.key] = `Vui lòng chọn: ${field.label}`;
        } else if (field.type !== "checkbox" && (!val || (typeof val === "string" && !val.trim()))) {
          errors[field.key] = `${field.label} không được để trống`;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    try {
      await mutation.mutateAsync({
        serviceId: service.id,
        packageId: selectedPackageId || null,
        customerName,
        customerEmail,
        customerPhone,
        customerSocial,
        requirements,
        specifications,
      });

      toast.success("Gửi yêu cầu đặt dịch vụ thành công! Chúng tôi sẽ liên hệ lại sớm nhất.");
      setIsOrderDialogOpen(false);
      
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setCustomerSocial("");
      setRequirements("");
      setSpecifications({});
      setSelectedFileNames({});
    } catch (error: any) {
      toast.error(error.message || "Đặt dịch vụ thất bại. Vui lòng thử lại!");
    }
  };

  const selectedPkg = packages.find((pkg) => pkg.id === selectedPackageId);

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[100px] pb-6 px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3">
              <Icon icon={meta.icon} className="text-3xl" />
            </div>
            
            <div className="flex flex-col items-center gap-1.5 max-w-xl">
              <div className="flex items-center gap-2 text-xs text-muted-foreground select-none">
                <Link href="/" className="hover:text-vanixjnk transition-colors flex items-center gap-1">
                  <Icon icon="solar:home-2-line-duotone" className="size-4" />
                  Trang chủ
                </Link>
                <Icon icon="solar:alt-arrow-right-line-duotone" className="size-3" />
                <Link href="/services" className="hover:text-vanixjnk transition-colors">
                  Dịch vụ
                </Link>
                <Icon icon="solar:alt-arrow-right-line-duotone" className="size-3" />
                <span className="text-foreground font-semibold truncate max-w-[200px]">{service.name}</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-foreground">{service.name}</h1>
              
              {service.description && (
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 mt-1 select-none">
                <Badge className={cn("px-2.5 py-0.5 text-[10px] font-bold border", meta.bg, meta.color, meta.border)}>
                  <Icon icon={meta.icon} className="mr-1 size-3 shrink-0" />
                  {meta.label}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon icon="solar:calendar-line-duotone" className="size-4" />
                  <span>Cập nhật: {new Date(service.updatedAt).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative w-full border-t border-b border-dashed border-primary/20 overflow-hidden text-primary/20"
        style={{ height: "36px" }}
      >
        <div
          className="absolute inset-y-0 left-[-100vw] w-[300vw]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)",
          }}
        />
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            
            <div className="lg:col-span-8 flex flex-col gap-6 order-2 lg:order-1">
              
              {service.gallery && service.gallery.length > 0 && (
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                  <div className="aspect-video w-full rounded-xl border border-border bg-background overflow-hidden relative group">
                    <img
                      src={service.gallery[activeGalleryIndex]}
                      alt={`${service.name} gallery image`}
                      className="size-full object-cover transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                      <span className="text-xs font-semibold text-white/80 select-none">
                        Hình ảnh {activeGalleryIndex + 1} / {service.gallery.length}
                      </span>
                    </div>
                  </div>
                  {service.gallery.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {service.gallery.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveGalleryIndex(idx)}
                          className={cn(
                            "aspect-video rounded-lg overflow-hidden border transition-all duration-200 cursor-pointer relative",
                            activeGalleryIndex === idx
                              ? "border-vanixjnk ring-2 ring-vanixjnk/20 scale-95"
                              : "border-border hover:border-muted-foreground/60"
                          )}
                        >
                          <img src={imgUrl} alt="gallery thumbnail" className="size-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              <Card className="p-5 bg-card/30 border-border">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:document-text-line-duotone" className="text-base text-vanixjnk" />
                  <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Mô tả chi tiết</h3>
                </div>
                <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base leading-relaxed">
                  <MdxRenderer content={service.content} scope={{ service }} />
                </div>
              </Card>

              {service.features && service.features.length > 0 && (
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-border/50">
                    <Icon icon="solar:bookmark-double-line-duotone" className="text-base text-vanixjnk" />
                    <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Đặc quyền & Tính năng đi kèm</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {service.features.map((feat, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg bg-muted/15 border border-border/55 flex items-start gap-3">
                        <div className="size-8 rounded-lg text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <Icon icon={feat.icon || "solar:check-circle-line-duotone"} className="size-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-foreground">{feat.name}</h4>
                          {feat.description && (
                            <p className="text-[11px] text-muted-foreground leading-normal">
                              {feat.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6 order-1 lg:order-2">
              
              <Card className={cn("bg-card/30 border-border flex flex-col gap-4 overflow-hidden", service.thumbnail ? "p-0!" : "p-5")}>
                {service.thumbnail ? (
                  <>
                    <div className="relative aspect-video w-full overflow-hidden border-b border-border select-none">
                      <img 
                        src={service.thumbnail} 
                        alt="Thumbnail dịch vụ" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-4">
                        <div className="flex items-center gap-2 text-white">
                          <Icon icon="solar:info-circle-line-duotone" className="text-base text-vanixjnk" />
                          <h3 className="font-bold text-xs uppercase tracking-wider">Tổng quan dịch vụ</h3>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 pt-0 flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-muted/15 border border-border/55">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Thời gian thực hiện</span>
                          <span className="font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                            <Icon icon="solar:clock-circle-line-duotone" className="text-vanixjnk text-sm" />
                            {service.deliveryTime ? `~ ${service.deliveryTime} ngày` : "Thỏa thuận"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-muted/15 border border-border/55">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Giá khởi điểm từ</span>
                          <span className="font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                            <Icon icon="solar:tag-price-line-duotone" className="text-vanixjnk text-sm" />
                            <span className={cn(service.priceType === "contact" ? "text-amber-500" : "text-vanixjnk font-black")}>
                              {service.priceType === "contact" ? "Thỏa thuận" : formatPrice(service.basePrice)}
                            </span>
                          </span>
                        </div>
                      </div>

                      {service.technologies && service.technologies.length > 0 && (
                        <div className="space-y-2.5 border-t border-border/40 pt-3">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Công nghệ & Công cụ</span>
                          <div className="flex flex-wrap gap-1.5">
                            {service.technologies.map((tech, idx) => {
                              const cleanTech = tech.replace("devicon:", "").replace("-wordmark", "").replace("-original", "");
                              return (
                                <Badge key={idx} variant="secondary" className="px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1 select-none border border-border bg-background/50 hover:bg-background/80">
                                  <Icon icon={tech.includes(":") ? tech : `logos:${tech}`} className="size-3 shrink-0" />
                                  <span className="capitalize">{cleanTech}</span>
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      <div className="border-t border-border/40 pt-4">
                        <Button
                          variant="vanixjnk"
                          size="sm"
                          onClick={() => handleOpenOrder(null)}
                          className="w-full font-bold text-xs gap-2 py-5"
                        >
                          <Icon icon="solar:hand-stars-line-duotone" className="size-4" />
                          <span>Đăng ký tư vấn ngay</span>
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 pb-2.5 border-b border-border/50">
                      <Icon icon="solar:info-circle-line-duotone" className="text-base text-vanixjnk" />
                      <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Tổng quan dịch vụ</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-muted/15 border border-border/55">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Thời gian thực hiện</span>
                        <span className="font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                          <Icon icon="solar:clock-circle-line-duotone" className="text-vanixjnk text-sm" />
                          {service.deliveryTime ? `~ ${service.deliveryTime} ngày` : "Thỏa thuận"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-muted/15 border border-border/55">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Giá khởi điểm từ</span>
                        <span className="font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                          <Icon icon="solar:tag-price-line-duotone" className="text-vanixjnk text-sm" />
                          <span className={cn(service.priceType === "contact" ? "text-amber-500" : "text-vanixjnk font-black")}>
                            {service.priceType === "contact" ? "Thỏa thuận" : formatPrice(service.basePrice)}
                          </span>
                        </span>
                      </div>
                    </div>

                    {service.technologies && service.technologies.length > 0 && (
                      <div className="space-y-2.5 border-t border-border/40 pt-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Công nghệ & Công cụ</span>
                        <div className="flex flex-wrap gap-1.5">
                          {service.technologies.map((tech, idx) => {
                            const cleanTech = tech.replace("devicon:", "").replace("-wordmark", "").replace("-original", "");
                            return (
                              <Badge key={idx} variant="secondary" className="px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1 select-none border border-border bg-background/50 hover:bg-background/80">
                                <Icon icon={tech.includes(":") ? tech : `logos:${tech}`} className="size-3 shrink-0" />
                                <span className="capitalize">{cleanTech}</span>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t border-border/40 pt-4">
                      <Button
                        variant="vanixjnk"
                        size="sm"
                        onClick={() => handleOpenOrder(null)}
                        className="w-full font-bold text-xs gap-2 py-5"
                      >
                        <Icon icon="solar:hand-stars-line-duotone" className="size-4" />
                        <span>Đăng ký tư vấn ngay</span>
                      </Button>
                    </div>
                  </>
                )}
              </Card>

              {packages && packages.length > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-1 select-none">
                    <Icon icon="solar:tag-price-line-duotone" className="text-base text-vanixjnk" />
                    <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Lựa chọn gói dịch vụ</h3>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    {packages.map((pkg) => (
                      <Card
                        key={pkg.id}
                        className="p-5 bg-card/30 border-border hover:border-vanixjnk/40 transition-all duration-300 flex flex-col gap-4"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <h4 className="text-sm font-extrabold text-foreground">{pkg.name}</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">{pkg.description}</p>
                          </div>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-foreground">{formatPrice(pkg.price)}</span>
                          <span className="text-[10px] text-muted-foreground">/ dự án</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Icon icon="solar:clock-circle-line-duotone" className="size-4 text-vanixjnk" />
                          <span>Thời gian hoàn thành: <strong>{pkg.deliveryTime} ngày</strong></span>
                        </div>

                        {pkg.featuresIncluded && Object.keys(pkg.featuresIncluded).length > 0 && (
                          <ul className="space-y-2 border-t border-border/40 pt-3.5">
                            {Object.entries(pkg.featuresIncluded).map(([key, val], fIdx) => (
                              <li key={fIdx} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <Icon
                                  icon={
                                    typeof val === "boolean" && !val
                                      ? "solar:close-circle-line-duotone"
                                      : "solar:verified-check-line-duotone"
                                  }
                                  className={cn("size-4 shrink-0 mt-0.5", typeof val === "boolean" && !val ? "text-rose-500" : "text-emerald-500")}
                                />
                                <span className="line-clamp-2">
                                  {key}: <strong>{typeof val === "boolean" ? (val ? "Có" : "Không") : String(val)}</strong>
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenOrder(pkg.id)}
                            className="w-full text-xs font-bold hover:bg-vanixjnk hover:text-white hover:border-vanixjnk transition-colors"
                          >
                            Chọn gói này
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-[550px] w-[95vw] max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="size-8 rounded-full bg-vanixjnk/10 text-vanixjnk flex items-center justify-center shrink-0">
                <Icon icon="solar:mailbox-line-duotone" className="size-5" />
              </div>
              Gửi yêu cầu đặt dịch vụ
            </DialogTitle>
            <DialogDescription className="text-left mt-1 text-[13px]">
              Vui lòng cung cấp thông tin liên hệ và điền bản khảo sát nhanh dưới đây.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4 px-1">
            
            <div className="flex items-center justify-between p-3.5 rounded-xl border bg-card text-card-foreground shadow-sm gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block uppercase text-[9px] font-bold tracking-wider">Dịch vụ đã chọn</span>
                <span className="font-bold text-foreground">{service.name}</span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block uppercase text-[9px] font-bold tracking-wider">Phiên bản / Gói</span>
                <span className="font-bold text-vanixjnk">{selectedPkg ? selectedPkg.name : "Liên hệ tư vấn"}</span>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1 select-none">
                <span className="size-1.5 rounded-full bg-vanixjnk shrink-0" />
                Thông tin người đặt dịch vụ
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Họ và Tên <span className="text-red-500">*</span></label>
                  <Input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (formErrors.customerName) setFormErrors((prev) => ({ ...prev, customerName: "" }));
                    }}
                    className={cn("h-9 text-xs", formErrors.customerName && "border-destructive")}
                  />
                  {formErrors.customerName && <p className="text-[10px] text-destructive font-medium">{formErrors.customerName}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Địa chỉ Email <span className="text-red-500">*</span></label>
                  <Input
                    type="email"
                    placeholder="nguyenvana@gmail.com"
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (formErrors.customerEmail) setFormErrors((prev) => ({ ...prev, customerEmail: "" }));
                    }}
                    className={cn("h-9 text-xs", formErrors.customerEmail && "border-destructive")}
                  />
                  {formErrors.customerEmail && <p className="text-[10px] text-destructive font-medium">{formErrors.customerEmail}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Số điện thoại <span className="text-red-500">*</span></label>
                  <Input
                    type="text"
                    placeholder="0912345678"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (formErrors.customerPhone) setFormErrors((prev) => ({ ...prev, customerPhone: "" }));
                    }}
                    className={cn("h-9 text-xs", formErrors.customerPhone && "border-destructive")}
                  />
                  {formErrors.customerPhone && <p className="text-[10px] text-destructive font-medium">{formErrors.customerPhone}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Liên hệ chính <span className="text-red-500">*</span></label>
                  <Input
                    type="text"
                    placeholder="Zalo / Link Facebook / Telegram..."
                    value={customerSocial}
                    onChange={(e) => {
                      setCustomerSocial(e.target.value);
                      if (formErrors.customerSocial) setFormErrors((prev) => ({ ...prev, customerSocial: "" }));
                    }}
                    className={cn("h-9 text-xs", formErrors.customerSocial && "border-destructive")}
                  />
                  {formErrors.customerSocial && <p className="text-[10px] text-destructive font-medium">{formErrors.customerSocial}</p>}
                </div>
              </div>
            </div>

            {service.fieldsConfig && service.fieldsConfig.length > 0 && (
              <div className="space-y-4 pt-3 border-t">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1 select-none">
                  <span className="size-1.5 rounded-full bg-indigo-500 shrink-0" />
                  Khảo sát nhu cầu đặc thù
                </h4>
                <div className="space-y-4">
                  {service.fieldsConfig.map((field) => {
                    const fieldVal = specifications[field.key];
                    const hasErr = !!formErrors[field.key];

                    return (
                      <div key={field.key} className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                          <span>{field.label}</span>
                          {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {field.type === "text" && (
                          <Input
                            type="text"
                            placeholder={field.placeholder || "Điền thông tin..."}
                            value={fieldVal || ""}
                            onChange={(e) => handleSpecChange(field.key, e.target.value)}
                            className={cn("h-9 text-xs", hasErr && "border-destructive")}
                          />
                        )}

                        {field.type === "number" && (
                          <Input
                            type="number"
                            placeholder={field.placeholder || "Điền số..."}
                            value={fieldVal !== undefined ? fieldVal : ""}
                            onChange={(e) => {
                              const val = e.target.value ? Number(e.target.value) : "";
                              handleSpecChange(field.key, val);
                            }}
                            className={cn("h-9 text-xs", hasErr && "border-destructive")}
                          />
                        )}

                        {field.type === "textarea" && (
                          <Textarea
                            placeholder={field.placeholder || "Mô tả chi tiết tại đây..."}
                            value={fieldVal || ""}
                            onChange={(e) => handleSpecChange(field.key, e.target.value)}
                            className={cn("text-xs min-h-[72px] resize-y", hasErr && "border-destructive")}
                          />
                        )}

                        {field.type === "select" && (
                          <Select
                            value={fieldVal || ""}
                            onValueChange={(val) => handleSpecChange(field.key, val)}
                          >
                            <SelectTrigger className={cn("w-full h-9 bg-background border-border text-xs justify-between", hasErr && "border-destructive")}>
                              <SelectValue placeholder={field.placeholder || "Chọn một giá trị..."} />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              {field.options?.map((opt, oIdx) => (
                                <SelectItem key={oIdx} value={opt} className="text-xs">
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {field.type === "checkbox" && (
                          <div className="flex items-center gap-2 pt-1">
                            <Checkbox
                              id={`check-${field.key}`}
                              checked={!!fieldVal}
                              onCheckedChange={(checked) => handleSpecChange(field.key, !!checked)}
                              className={hasErr ? "border-destructive" : ""}
                            />
                            <label htmlFor={`check-${field.key}`} className="text-xs text-muted-foreground select-none cursor-pointer leading-none">
                              {field.placeholder || "Đồng ý lựa chọn này"}
                            </label>
                          </div>
                        )}

                        {field.type === "file" && (
                          <div className="space-y-2">
                            <div className="flex flex-col gap-2 p-3 bg-muted/20 border border-dashed rounded-lg">
                              <span className="text-xs text-muted-foreground">
                                Do giới hạn bảo mật tệp tin, bạn có thể nhập link chia sẻ tài liệu (như Drive, Figma) hoặc đính kèm mô tả:
                              </span>
                              <Input
                                type="text"
                                placeholder="Dán link Drive, Figma, Dropbox hoặc ghi chú file tại đây..."
                                value={fieldVal || ""}
                                onChange={(e) => handleSpecChange(field.key, e.target.value)}
                                className="h-8 text-xs"
                              />
                              <div className="flex items-center justify-between gap-2 border-t pt-2 mt-1">
                                <span className="text-[10px] text-muted-foreground">
                                  Hoặc chọn tệp cục bộ (để ghi nhận tên file và gửi sau khi liên hệ):
                                </span>
                                <label className="cursor-pointer shrink-0">
                                  <span className="px-2.5 py-1 text-[10px] font-bold bg-background hover:bg-muted border rounded-md transition-colors inline-block select-none">
                                    Chọn tệp
                                  </span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(field.key, e)}
                                  />
                                </label>
                              </div>
                              {selectedFileNames[field.key] && (
                                <div className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-0.5">
                                  <Icon icon="solar:verified-check-line-duotone" />
                                  <span>Đã nhận thông số tệp: {selectedFileNames[field.key]}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {hasErr && <p className="text-[10px] text-destructive font-medium">{formErrors[field.key]}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="space-y-1.5 pt-3 border-t">
              <label className="text-xs font-semibold text-foreground">Ghi chú hoặc yêu cầu thêm (nếu có)</label>
              <Textarea
                placeholder="Bạn có ghi chú gì thêm cho đơn hàng hoặc dự án này không?..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="text-xs min-h-[80px]"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full mt-2">
              <Button
                variant="outline"
                className="flex-1 text-xs cursor-pointer"
                type="button"
                onClick={() => setIsOrderDialogOpen(false)}
                disabled={mutation.isPending}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="vanixjnk"
                className="flex-1 text-xs cursor-pointer"
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Icon icon="solar:restart-line-duotone" className="size-4 animate-spin mr-1.5" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="solar:paper-plane-line-duotone" className="size-4 mr-1.5" />
                    <span>Gửi yêu cầu dịch vụ</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}