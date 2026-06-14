"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import type { Service, ServicePackage } from "@/server/db/schemas/service.schema";
import { QuickReorderServicesDialog } from "./QuickReorderServicesDialog";
import { QuickSeedServicesDialog } from "./QuickSeedServicesDialog";

function formatCurrencyInput(value: string | number): string {
  const strValue = String(value);
  const raw = strValue.replace(/\D/g, "");
  if (!raw) return "";
  return Number(raw).toLocaleString("vi-VN");
}

function parseCurrencyInput(value: string): number {
  const raw = value.replace(/\D/g, "");
  return raw ? Number(raw) : 0;
}

export default function AdminServicesTab() {
  const router = useRouter();

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

  const servicesList = servicesData || [];
  const [servicesSearch, setServicesSearch] = useState("");
  const [servicesSorting, setServicesSorting] = useState<SortingState>([]);
  const [servicesPagination, setServicesPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [seedDialogOpen, setSeedDialogOpen] = useState(false);

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

  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

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
      result = result.filter((s) => s.typeId === serviceTypeFilter);
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
            onClick={() => router.push(`/adminPanel/services/edit/${row.original.id}`)}
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
      accessorKey: "order",
      meta: { title: "Thứ tự" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.order}</span>,
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
              onClick={() => router.push(`/adminPanel/services/edit/${row.original.id}`)}
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
        <div className="flex items-center gap-2 shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="vanixjnk" size="sm" className="gap-1.5 shrink-0 cursor-pointer">
                <Icon icon="solar:hamburger-menu-line-duotone" className="text-base" />
                <span>Thao tác</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-1 flex flex-col gap-0.5" align="end">
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2 cursor-pointer"
                onClick={() => refetchServices()}
                disabled={servicesLoading || servicesFetching}
              >
                <Icon
                  icon="solar:restart-line-duotone"
                  className={cn("mr-2 size-3.5 text-sky-500", (servicesLoading || servicesFetching) && "animate-spin")}
                />
                Làm mới
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2 cursor-pointer"
                onClick={() => router.push("/adminPanel/services/create")}
              >
                <Icon icon="solar:add-circle-line-duotone" className="mr-2 size-3.5 text-emerald-500" />
                Tạo dịch vụ mới
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2 cursor-pointer"
                onClick={() => setSortDialogOpen(true)}
              >
                <Icon icon="solar:sort-vertical-line-duotone" className="mr-2 size-3.5 text-indigo-500" />
                Sắp xếp
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2 cursor-pointer text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                onClick={() => setSeedDialogOpen(true)}
              >
                <Icon icon="solar:database-line-duotone" className="mr-2 size-3.5 text-amber-500" />
                Đổ dữ liệu mẫu
              </Button>
            </PopoverContent>
          </Popover>
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
          <div className="relative flex-1">
            <Icon icon="solar:magnifer-line-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <Input
              placeholder="Tìm kiếm dịch vụ..."
              className="pl-9 h-9 text-sm w-full bg-background"
              value={servicesSearch}
              onChange={(e) => setServicesSearch(e.target.value)}
            />
          </div>
        }
      />



      <QuickReorderServicesDialog
        open={sortDialogOpen}
        onOpenChange={setSortDialogOpen}
        onSuccess={() => refetchServices()}
      />

      <QuickSeedServicesDialog
        open={seedDialogOpen}
        onOpenChange={setSeedDialogOpen}
        onSuccess={() => refetchServices()}
      />
    </div>
  );
}
