"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import type { FormFieldConfig, Service, ServicePackage } from "@/server/db/schemas/service.schema";
import { GalleryDialog } from "@/components/vanixjnk/gallery-dialog";

export default function AdminServicesTab() {
  const [sheetActiveTab, setSheetActiveTab] = useState<"general" | "formConfig" | "features">("general");

  const { data: servicesData, isLoading: servicesLoading, refetch: refetchServices, isFetching: servicesFetching } =
    trpc.administrator.services.getAll.useQuery(undefined, { refetchOnWindowFocus: false });

  const { data: serviceTypesData } = trpc.administrator.services.getTypes.useQuery(undefined, { refetchOnWindowFocus: false });
  const serviceTypesList = serviceTypesData?.data || [];

  const deleteServiceMutation = trpc.administrator.services.delete.useMutation({
    onSuccess: () => {
      toast.success("Xóa dịch vụ thành công!");
      refetchServices();
    },
    onError: (err) => toast.error(err.message || "Xóa thất bại"),
  });

  const createServiceMutation = trpc.administrator.services.create.useMutation({
    onSuccess: () => {
      toast.success("Tạo dịch vụ mới thành công!");
      setServiceEditorOpen(false);
      refetchServices();
    },
    onError: (err) => toast.error(err.message || "Tạo thất bại"),
  });

  const updateServiceMutation = trpc.administrator.services.update.useMutation({
    onSuccess: () => {
      toast.success("Cập nhật dịch vụ thành công!");
      setServiceEditorOpen(false);
      refetchServices();
    },
    onError: (err) => toast.error(err.message || "Cập nhật thất bại"),
  });

  const servicesList = servicesData || [];
  const [servicesSearch, setServicesSearch] = useState("");
  const [servicesSorting, setServicesSorting] = useState<SortingState>([]);
  const [servicesPagination, setServicesPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");

  const [serviceEditorOpen, setServiceEditorOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  
  const [serviceForm, setServiceForm] = useState({
    name: "",
    slug: "",
    typeId: "",
    description: "",
    content: "",
    thumbnail: "",
    basePrice: 0,
    priceType: "starting_at" as "starting_at" | "fixed" | "contact",
    deliveryTime: null as number | null,
    status: "active" as "active" | "draft" | "disabled",
    technologies: [] as string[],
    features: [] as { name: string; description?: string | null; icon?: string | null }[],
    fieldsConfig: [] as FormFieldConfig[],
    metadata: {} as Record<string, any>,
  });
  const [techInput, setTechInput] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(false);
  
  const [packageManagerOpen, setPackageManagerOpen] = useState(false);
  const [packageService, setPackageService] = useState<Service | null>(null);
  const { data: servicePackages, refetch: refetchPackages, isLoading: packagesLoading } = 
    trpc.administrator.services.getPackages.useQuery(
      { serviceId: packageService?.id ?? "" }, 
      { enabled: !!packageService }
    );

  const [packageEditorOpen, setPackageEditorOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [packageForm, setPackageForm] = useState({
    name: "",
    description: "",
    price: 0,
    deliveryTime: 1,
    featuresIncluded: {} as Record<string, any>,
  });

  const createPackageMutation = trpc.administrator.services.createPackage.useMutation({
    onSuccess: () => {
      toast.success("Tạo gói dịch vụ thành công!");
      setPackageEditorOpen(false);
      refetchPackages();
    },
    onError: (err) => toast.error(err.message || "Tạo thất bại"),
  });

  const updatePackageMutation = trpc.administrator.services.updatePackage.useMutation({
    onSuccess: () => {
      toast.success("Cập nhật gói dịch vụ thành công!");
      setPackageEditorOpen(false);
      refetchPackages();
    },
    onError: (err) => toast.error(err.message || "Cập nhật thất bại"),
  });

  const deletePackageMutation = trpc.administrator.services.deletePackage.useMutation({
    onSuccess: () => {
      toast.success("Xóa gói dịch vụ thành công!");
      refetchPackages();
    },
    onError: (err) => toast.error(err.message || "Xóa thất bại"),
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const openServiceEditor = (service: any | null) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        name: service.name,
        slug: service.slug,
        typeId: service.typeId || "",
        description: service.description || "",
        content: service.content,
        thumbnail: service.thumbnail || "",
        basePrice: service.basePrice,
        priceType: service.priceType as any,
        deliveryTime: service.deliveryTime,
        status: service.status as any,
        technologies: service.technologies || [],
        features: service.features || [],
        fieldsConfig: service.fieldsConfig || [],
        metadata: service.metadata || {},
      });
      setTechInput(service.technologies ? service.technologies.join(", ") : "");
    } else {
      setEditingService(null);
      setServiceForm({
        name: "",
        slug: "",
        typeId: serviceTypesList[0]?.id || "",
        description: "",
        content: "",
        thumbnail: "",
        basePrice: 0,
        priceType: "starting_at",
        deliveryTime: null,
        status: "active",
        technologies: [],
        features: [],
        fieldsConfig: [],
        metadata: {},
      });
      setTechInput("");
    }
    setSheetActiveTab("general");
    setServiceEditorOpen(true);
  };

  const saveService = async () => {
    if (!serviceForm.name.trim()) return toast.error("Tên dịch vụ không được trống");
    if (!serviceForm.slug.trim()) return toast.error("Đường dẫn (slug) không được trống");
    if (!serviceForm.content.trim()) return toast.error("Nội dung giới thiệu không được trống");

    const processedTechs = techInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    const payload = {
      ...serviceForm,
      technologies: processedTechs,
    };

    if (editingService) {
      updateServiceMutation.mutate({
        id: editingService.id,
        data: payload,
      });
    } else {
      createServiceMutation.mutate(payload);
    }
  };

  const handleOpenPackageManager = (service: Service) => {
    setPackageService(service);
    setPackageManagerOpen(true);
  };

  const handleOpenPackageEditor = (pkg: ServicePackage | null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setPackageForm({
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        deliveryTime: pkg.deliveryTime,
        featuresIncluded: pkg.featuresIncluded || {},
      });
    } else {
      setEditingPackage(null);
      setPackageForm({
        name: "",
        description: "",
        price: 0,
        deliveryTime: 1,
        featuresIncluded: {},
      });
    }
    setPackageEditorOpen(true);
  };

  const savePackage = () => {
    if (!packageForm.name.trim()) return toast.error("Tên gói không được trống");
    if (!packageForm.description.trim()) return toast.error("Mô tả gói không được trống");
    if (!packageService) return;

    if (editingPackage) {
      updatePackageMutation.mutate({
        id: editingPackage.id,
        data: packageForm,
      });
    } else {
      createPackageMutation.mutate({
        ...packageForm,
        serviceId: packageService.id,
      });
    }
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (nameVal: string) => {
    setServiceForm((prev) => ({
      ...prev,
      name: nameVal,
      slug: slugify(nameVal),
    }));
  };

  const filteredServices = useMemo(() => {
    let result = [...servicesList];

    if (servicesSearch) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(servicesSearch.toLowerCase()) ||
          s.slug.toLowerCase().includes(servicesSearch.toLowerCase()) ||
          (s.description && s.description.toLowerCase().includes(servicesSearch.toLowerCase()))
      );
    }

    if (serviceTypeFilter !== "all") {
      result = result.filter((s) => s.type === serviceTypeFilter);
    }

    if (servicesSorting.length > 0) {
      const { id, desc } = servicesSorting[0];
      result.sort((a: any, b: any) => {
        const valA = a[id];
        const valB = b[id];
        if (valA === undefined || valB === undefined) return 0;
        if (typeof valA === "string" && typeof valB === "string") {
          return desc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        return desc ? valB - valA : valA - valB;
      });
    }

    return result;
  }, [servicesList, servicesSearch, serviceTypeFilter, servicesSorting]);

  const paginatedServices = useMemo(() => {
    const start = servicesPagination.pageIndex * servicesPagination.pageSize;
    const end = start + servicesPagination.pageSize;
    return filteredServices.slice(start, end);
  }, [filteredServices, servicesPagination]);

  const addDynamicField = () => {
    const newField: FormFieldConfig = {
      key: `field_${Date.now()}`,
      label: "Trường câu hỏi mới",
      type: "text",
      required: false,
      placeholder: "",
      options: [],
    };
    setServiceForm((prev) => ({
      ...prev,
      fieldsConfig: [...prev.fieldsConfig, newField],
    }));
  };

  const removeDynamicField = (index: number) => {
    setServiceForm((prev) => ({
      ...prev,
      fieldsConfig: prev.fieldsConfig.filter((_, i) => i !== index),
    }));
  };

  const updateDynamicField = (index: number, key: keyof FormFieldConfig, value: any) => {
    setServiceForm((prev) => {
      const updated = [...prev.fieldsConfig];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, fieldsConfig: updated };
    });
  };

  const addFeature = () => {
    setServiceForm((prev) => ({
      ...prev,
      features: [...prev.features, { name: "", description: "", icon: "solar:check-circle-line-duotone" }],
    }));
  };

  const removeFeature = (index: number) => {
    setServiceForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index: number, key: string, value: any) => {
    setServiceForm((prev) => {
      const updated = [...prev.features];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, features: updated };
    });
  };

  const serviceColumns = React.useMemo<ColumnDef<Service>[]>(() => [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-normal">
          {servicesPagination.pageIndex * servicesPagination.pageSize + row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: "thumbnail",
      meta: { title: "Thumbnail" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const thumb = row.getValue("thumbnail") as string;
        return (
          <div className="size-11 rounded-lg border border-border bg-muted/40 overflow-hidden flex items-center justify-center shadow-2xs">
            {thumb ? (
              <img src={thumb} alt={row.original.name} className="size-full object-cover" />
            ) : (
              <Icon icon="solar:code-line-duotone" className="size-5 text-muted-foreground" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      meta: { title: "Dịch vụ" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span
            className="text-[13px] font-semibold text-foreground hover:text-vanixjnk transition-colors cursor-pointer"
            onClick={() => openServiceEditor(row.original)}
          >
            {row.original.name}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            /{row.original.slug}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      meta: { title: "Loại" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const service = row.original as any;
        return (
          <Badge variant="secondary" className="font-semibold text-[11px] capitalize">
            {service.serviceType?.name || service.type || "Khác"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "basePrice",
      meta: { title: "Giá khởi điểm" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const price = row.getValue("basePrice") as number;
        const type = row.original.priceType;
        if (type === "contact") return <span className="text-xs font-semibold text-amber-500">Liên hệ</span>;
        
        const priceStr = price.toLocaleString("vi-VN") + " đ";
        return (
          <span className="text-xs font-mono font-semibold text-foreground">
            {type === "starting_at" ? `Từ ${priceStr}` : priceStr}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      meta: { title: "Trạng thái" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variants: Record<string, "success" | "outline" | "danger"> = {
          active: "success",
          draft: "outline",
          disabled: "danger",
        };
        const labels: Record<string, string> = {
          active: "Hoạt động",
          draft: "Bản nháp",
          disabled: "Tạm ngưng",
        };
        return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <Icon icon="solar:menu-dots-bold-duotone" className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-1 flex flex-col gap-0.5" align="end">
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2"
              onClick={() => openServiceEditor(row.original)}
            >
              <Icon icon="solar:pen-line-duotone" className="mr-2 size-3.5" />
              Chỉnh sửa
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2"
              onClick={() => handleOpenPackageManager(row.original)}
            >
              <Icon icon="solar:tag-price-line-duotone" className="mr-2 size-3.5" />
              Quản lý gói
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              onClick={() => {
                setServiceToDelete(row.original);
                setDeleteConfirmOpen(true);
              }}
            >
              <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-2 size-3.5" />
              Xóa dịch vụ
            </Button>
          </PopoverContent>
        </Popover>
      ),
    },
  ], [servicesPagination]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Danh mục dịch vụ</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Danh sách các gói dịch vụ, giá cả, thời gian bàn giao và cấu hình form khảo sát khách hàng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchServices()} disabled={servicesLoading || servicesFetching} className="gap-1.5 shrink-0">
            <Icon icon="solar:restart-line-duotone" className={cn("text-base", (servicesLoading || servicesFetching) && "animate-spin")} />
            <span>Làm mới</span>
          </Button>
          <Button variant="vanixjnk" size="sm" onClick={() => openServiceEditor(null)} className="gap-1.5 shrink-0">
            <Icon icon="solar:add-circle-line-duotone" className="text-base" />
            <span>Tạo dịch vụ mới</span>
          </Button>
        </div>
      </div>

      <DataTable
        columns={serviceColumns}
        data={paginatedServices}
        isLoading={servicesLoading}
        pageCount={Math.ceil(filteredServices.length / servicesPagination.pageSize)}
        totalRecords={filteredServices.length}
        pagination={servicesPagination}
        onPaginationChange={setServicesPagination}
        sorting={servicesSorting}
        onSortingChange={setServicesSorting}
        toolbarInput={
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Icon icon="solar:magnifer-line-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
              <Input
                placeholder="Tìm kiếm dịch vụ..."
                className="pl-9 h-9 text-sm w-full bg-background"
                value={servicesSearch}
                onChange={(e) => setServicesSearch(e.target.value)}
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-9 w-9 border-border bg-background hover:bg-muted/50 shrink-0",
                    serviceTypeFilter !== "all" && "text-vanixjnk border-vanixjnk/30 bg-vanixjnk/5 hover:bg-vanixjnk/10"
                  )}
                  title="Lọc phân loại"
                >
                  <Icon icon="solar:filter-line-duotone" className="size-4 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3 flex flex-col gap-2" align="end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Phân loại
                  </label>
                  <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                    <SelectTrigger size="sm" className="w-full justify-between bg-background border-border">
                      <SelectValue placeholder="Chọn phân loại" />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start">
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:globus-line-duotone" className="size-4 text-muted-foreground" />
                          <span>Tất cả các loại</span>
                        </div>
                      </SelectItem>
                      {serviceTypesList.map((type) => (
                        <SelectItem key={type.id} value={type.slug}>
                          <div className="flex items-center gap-2">
                            <Icon icon={type.icon || "solar:globus-line-duotone"} className={cn("size-4", type.color || "text-primary")} />
                            <span>{type.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        }
      />

      <Sheet open={serviceEditorOpen} onOpenChange={setServiceEditorOpen}>
        <SheetContent className="sm:max-w-[700px] w-full p-0 flex flex-col">
          <SheetHeader className="p-6">
            <div className="size-10 rounded-xl bg-vanixjnk/10 text-vanixjnk flex items-center justify-center shrink-0 mb-2">
              <Icon icon={editingService ? "solar:pen-new-square-line-duotone" : "solar:add-circle-line-duotone"} className="size-6 text-vanixjnk" />
            </div>
            <SheetTitle className="text-xl font-bold">
              {editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ kỹ thuật mới"}
            </SheetTitle>
            <SheetDescription>Nhập thông tin mô tả chi tiết, thiết lập các tùy chọn và form khảo sát tùy biến.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar bg-background">
            <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-4">
              {[
                { id: "general", title: "Thông tin chung", icon: "solar:info-circle-line-duotone" },
                { id: "formConfig", title: "Cấu hình Form Khảo sát", icon: "solar:settings-minimalistic-line-duotone" },
                { id: "features", title: "Đặc quyền/Tính năng", icon: "solar:star-line-duotone" }
              ].map((tab) => {
                const isActive = sheetActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSheetActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-vanixjnk/15 border-vanixjnk/25 text-vanixjnk shadow-sm"
                        : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <Icon
                      icon={tab.icon}
                      className={`size-4 ${
                        isActive ? "text-vanixjnk" : "text-muted-foreground"
                      }`}
                    />
                    <span>{tab.title}</span>
                  </button>
                );
              })}
            </div>

            {sheetActiveTab === "general" && (
              <div className="py-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-foreground">Tên dịch vụ</label>
                  <Input placeholder="Ví dụ: Lập trình Bot Discord" value={serviceForm.name} onChange={(e) => handleNameChange(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-foreground">Đường dẫn (slug)</label>
                  <div className="flex gap-2">
                    <div className="flex items-center bg-muted/40 border border-border/80 px-2.5 rounded-md text-[11px] text-muted-foreground select-none font-mono">
                      /
                    </div>
                    <Input
                      placeholder="lap-trinh-bot-discord"
                      value={serviceForm.slug}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, slug: e.target.value }))}
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-foreground">Phân loại</label>
                    <Select value={serviceForm.typeId} onValueChange={(val) => setServiceForm(prev => ({ ...prev, typeId: val }))}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {serviceTypesList.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <Icon icon={type.icon || "solar:globus-line-duotone"} className={cn("size-4", type.color || "text-primary")} />
                              <span>{type.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-foreground">Cách hiển thị giá</label>
                    <Select value={serviceForm.priceType} onValueChange={(val: any) => setServiceForm(prev => ({ ...prev, priceType: val }))}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starting_at">
                          <div className="flex items-center gap-2">
                            <Icon icon="solar:tag-price-line-duotone" className="size-4 text-blue-500" />
                            <span>Giá khởi điểm (Từ...)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fixed">
                          <div className="flex items-center gap-2">
                            <Icon icon="solar:lock-line-duotone" className="size-4 text-green-500" />
                            <span>Giá cố định</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="contact">
                          <div className="flex items-center gap-2">
                            <Icon icon="solar:chat-round-line-duotone" className="size-4 text-amber-500" />
                            <span>Giá liên hệ thỏa thuận</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-foreground">Giá khởi điểm (VNĐ)</label>
                    <Input type="number" value={serviceForm.basePrice} onChange={(e) => setServiceForm(prev => ({ ...prev, basePrice: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-foreground">Trạng thái xuất bản</label>
                    <Select value={serviceForm.status} onValueChange={(val: any) => setServiceForm(prev => ({ ...prev, status: val }))}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <Icon icon="solar:check-circle-line-duotone" className="size-4 text-green-500" />
                            <span>Hoạt động (Hiển thị công khai)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="draft">
                          <div className="flex items-center gap-2">
                            <Icon icon="solar:document-line-duotone" className="size-4 text-amber-500" />
                            <span>Bản nháp (Tạm ẩn)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="disabled">
                          <div className="flex items-center gap-2">
                            <Icon icon="solar:close-circle-line-duotone" className="size-4 text-rose-500" />
                            <span>Tắt hoàn toàn</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-foreground">Thời gian hoàn thành (ngày)</label>
                    <Input type="number" placeholder="Ví dụ: 7" value={serviceForm.deliveryTime || ""} onChange={(e) => setServiceForm(prev => ({ ...prev, deliveryTime: parseInt(e.target.value) || null }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                      <Icon icon="solar:gallery-line-duotone" className="size-4 text-muted-foreground" />
                      Ảnh đại diện (Thumbnail URL)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Nhập đường dẫn hoặc chọn từ thư viện..."
                        value={serviceForm.thumbnail}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, thumbnail: e.target.value }))}
                        className="h-9 shadow-sm text-[13px] flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => setGalleryOpen(true)}
                        className="size-9 flex items-center justify-center bg-vanixjnk/10 text-vanixjnk border border-vanixjnk/20 rounded-md hover:bg-vanixjnk/20 transition-colors shrink-0"
                      >
                        <Icon icon="solar:gallery-line-duotone" className="size-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-foreground">Tags công nghệ / công cụ (phân cách bằng dấu phẩy)</label>
                  <Input placeholder="Ví dụ: React, Typescript, Java, Photoshop" value={techInput} onChange={(e) => setTechInput(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-foreground">Mô tả ngắn</label>
                  <Textarea placeholder="Tóm tắt ngắn gọn về dịch vụ..." rows={2} value={serviceForm.description} onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-foreground">Nội dung chi tiết (hỗ trợ Markdown)</label>
                  <Textarea placeholder="Viết giới thiệu, quy trình làm việc chi tiết..." rows={8} value={serviceForm.content} onChange={(e) => setServiceForm(prev => ({ ...prev, content: e.target.value }))} />
                </div>
              </div>
            )}

            {sheetActiveTab === "formConfig" && (
              <div className="py-4 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Phiếu khảo sát nhu cầu tùy chỉnh</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Thêm các trường câu hỏi để thu thập thông tin khi khách hàng đặt đơn dịch vụ này.</p>
                  </div>
                  <Button variant="outline" size="sm" type="button" onClick={addDynamicField} className="gap-1 h-8">
                    <Icon icon="solar:add-circle-line-duotone" className="text-base" />
                    <span>Thêm trường hỏi</span>
                  </Button>
                </div>

                {serviceForm.fieldsConfig.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-border/80 rounded-xl text-muted-foreground/60 text-xs">
                    Chưa có trường khảo sát nào được cấu hình cho dịch vụ này.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {serviceForm.fieldsConfig.map((field, idx) => (
                      <div key={field.key} className="p-3 border rounded-xl bg-background/50 flex flex-col gap-3 relative group">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 absolute top-2 right-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 shrink-0"
                          onClick={() => removeDynamicField(idx)}
                        >
                          <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                        </Button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Tiêu đề trường (Label)</span>
                            <Input className="h-8 text-xs" placeholder="e.g. Phiên bản game" value={field.label} onChange={(e) => updateDynamicField(idx, "label", e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Loại trường</span>
                            <Select value={field.type} onValueChange={(val) => updateDynamicField(idx, "type", val)}>
                              <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Chữ ngắn (text)</SelectItem>
                                <SelectItem value="textarea">Đoạn văn (textarea)</SelectItem>
                                <SelectItem value="select">Hộp chọn (select)</SelectItem>
                                <SelectItem value="multiselect">Chọn nhiều (multiselect)</SelectItem>
                                <SelectItem value="checkbox">Hộp kiểm (checkbox)</SelectItem>
                                <SelectItem value="number">Số lượng (number)</SelectItem>
                                <SelectItem value="file">Đính kèm tệp (file)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Switch id={`req-${field.key}`} checked={field.required} onCheckedChange={(val) => updateDynamicField(idx, "required", val)} />
                            <label htmlFor={`req-${field.key}`} className="text-[11px] font-medium text-foreground cursor-pointer">Bắt buộc phải điền</label>
                          </div>

                          {["select", "multiselect"].includes(field.type) && (
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Các tùy chọn (phân tách bằng dấu phẩy)</span>
                              <Input
                                className="h-8 text-xs"
                                placeholder="e.g. 1.20, 1.21, 1.19"
                                value={field.options ? field.options.join(", ") : ""}
                                onChange={(e) =>
                                  updateDynamicField(
                                    idx,
                                    "options",
                                    e.target.value.split(",").map((o) => o.trim())
                                  )
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {sheetActiveTab === "features" && (
              <div className="py-4 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Đặc quyền và Tính năng mặc định</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Danh sách checklist các điểm nổi bật đi kèm của dịch vụ.</p>
                  </div>
                  <Button variant="outline" size="sm" type="button" onClick={addFeature} className="gap-1 h-8">
                    <Icon icon="solar:add-circle-line-duotone" className="text-base" />
                    <span>Thêm tính năng</span>
                  </Button>
                </div>

                {serviceForm.features.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-border/80 rounded-xl text-muted-foreground/60 text-xs">
                    Chưa có tính năng đặc thù nào được thêm.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {serviceForm.features.map((feature, idx) => (
                      <div key={idx} className="p-3 border rounded-xl bg-background/50 flex flex-col gap-3 relative group">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 absolute top-2 right-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 shrink-0"
                          onClick={() => removeFeature(idx)}
                        >
                          <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                        </Button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Tên tính năng</span>
                            <Input className="h-8 text-xs" placeholder="e.g. Tối ưu hiệu năng" value={feature.name} onChange={(e) => updateFeature(idx, "name", e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Icon (Iconify code)</span>
                            <Input className="h-8 text-xs font-mono" placeholder="e.g. solar:stars-line-duotone" value={feature.icon || ""} onChange={(e) => updateFeature(idx, "icon", e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Mô tả ngắn gọn</span>
                            <Input className="h-8 text-xs" placeholder="e.g. Đảm bảo chạy mượt trên VPS" value={feature.description || ""} onChange={(e) => updateFeature(idx, "description", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setServiceEditorOpen(false)}>Hủy bỏ</Button>
            <Button
              variant="vanixjnk"
              onClick={saveService}
              disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
            >
              {(createServiceMutation.isPending || updateServiceMutation.isPending) && (
                <Icon icon="solar:restart-line-duotone" className="mr-1.5 size-4 animate-spin" />
              )}
              Lưu thay đổi
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={packageManagerOpen} onOpenChange={setPackageManagerOpen}>
        <SheetContent className="sm:max-w-[550px] w-full p-0 flex flex-col">
          <SheetHeader className="p-6">
            <div className="size-10 rounded-xl bg-vanixjnk/10 text-vanixjnk flex items-center justify-center shrink-0 mb-2">
              <Icon icon="solar:tag-price-line-duotone" className="size-6 text-vanixjnk" />
            </div>
            <SheetTitle className="text-xl font-bold">
              Quản lý gói giá: {packageService?.name}
            </SheetTitle>
            <SheetDescription>
              Thiết kế các tầng gói định giá (như Basic, Premium) cho dịch vụ này.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar bg-background">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-foreground">Danh sách các gói giá</span>
              <Button size="sm" variant="vanixjnk" className="h-8 text-xs gap-1" onClick={() => handleOpenPackageEditor(null)}>
                <Icon icon="solar:add-circle-line-duotone" className="size-4" />
                <span>Thêm gói mới</span>
              </Button>
            </div>

            {packagesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : !servicePackages || servicePackages.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-2xl text-muted-foreground/60 text-xs">
                Chưa cấu hình gói giá cụ thể nào. Dịch vụ này sẽ sử dụng giá khởi điểm mặc định.
              </div>
            ) : (
              <div className="space-y-3">
                {servicePackages.map((pkg) => (
                  <div key={pkg.id} className="p-4 border rounded-xl bg-background/60 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-[13px] text-foreground">{pkg.name}</h4>
                        <Badge variant="success" className="font-mono text-[10px]">{pkg.price.toLocaleString("vi-VN")} đ</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[400px] truncate">{pkg.description}</p>
                      <span className="text-[10px] text-muted-foreground font-mono mt-1 block flex items-center gap-1">
                        <Icon icon="solar:calendar-line-duotone" className="size-3" />
                        Bàn giao: {pkg.deliveryTime} ngày
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => handleOpenPackageEditor(pkg)}>
                        <Icon icon="solar:pen-line-duotone" className="size-4 text-vanixjnk" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8 text-rose-500 hover:bg-rose-500/10"
                        onClick={() => deletePackageMutation.mutate({ id: pkg.id })}
                      >
                        <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 flex items-center justify-end">
            <Button variant="outline" onClick={() => setPackageManagerOpen(false)}>Đóng</Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={packageEditorOpen} onOpenChange={setPackageEditorOpen}>
        <SheetContent className="sm:max-w-[500px] w-full p-0 flex flex-col">
          <SheetHeader className="p-6">
            <div className="size-10 rounded-xl bg-vanixjnk/10 text-vanixjnk flex items-center justify-center shrink-0 mb-2">
              <Icon icon="solar:tag-price-line-duotone" className="size-6 text-vanixjnk" />
            </div>
            <SheetTitle className="text-xl font-bold">
              {editingPackage ? "Chỉnh sửa gói giá" : "Thêm gói dịch vụ mới"}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar bg-background">
            <div className="space-y-1">
              <label className="text-[13px] font-bold text-foreground">Tên gói dịch vụ</label>
              <Input placeholder="Ví dụ: Gói Cơ Bản" value={packageForm.name} onChange={(e) => setPackageForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[13px] font-bold text-foreground">Giá tiền (VNĐ)</label>
                <Input type="number" value={packageForm.price} onChange={(e) => setPackageForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-1">
                <label className="text-[13px] font-bold text-foreground">Thời gian bàn giao (ngày)</label>
                <Input type="number" value={packageForm.deliveryTime} onChange={(e) => setPackageForm(prev => ({ ...prev, deliveryTime: parseInt(e.target.value) || 1 }))} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[13px] font-bold text-foreground">Mô tả gói</label>
              <Textarea placeholder="Liệt kê những quyền lợi cơ bản hoặc cam kết của gói..." rows={3} value={packageForm.description} onChange={(e) => setPackageForm(prev => ({ ...prev, description: e.target.value }))} />
            </div>
          </div>

          <div className="p-6 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setPackageEditorOpen(false)}>Hủy</Button>
            <Button variant="vanixjnk" onClick={savePackage} disabled={createPackageMutation.isPending || updatePackageMutation.isPending}>
              Lưu gói
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <SheetContent className="sm:max-w-[400px] w-full p-0 flex flex-col">
          <SheetHeader className="p-6">
            <div className="size-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mb-2">
              <Icon icon="solar:danger-triangle-line-duotone" className="size-6" />
            </div>
            <SheetTitle className="text-xl font-bold text-rose-500">
              Xác nhận xóa dịch vụ
            </SheetTitle>
            <SheetDescription>
              Hành động này sẽ xóa vĩnh viễn dịch vụ và toàn bộ các gói giá con đi kèm.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 p-6 text-sm text-muted-foreground bg-background">
            Bạn có chắc chắn muốn xóa dịch vụ <strong className="text-foreground font-semibold">{serviceToDelete?.name}</strong> không?
          </div>

          <div className="p-6 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (serviceToDelete) {
                  deleteServiceMutation.mutate({ id: serviceToDelete.id });
                  setDeleteConfirmOpen(false);
                }
              }}
              disabled={deleteServiceMutation.isPending}
            >
              Xác nhận xóa
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <GalleryDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onSelect={(url) => setServiceForm(prev => ({ ...prev, thumbnail: url }))}
      />
    </div>
  );
}
