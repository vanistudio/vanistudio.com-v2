"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
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

export default function AdminRequestsTab() {
  const { data: requestsData, isLoading: requestsLoading, refetch: refetchRequests, isFetching: requestsFetching } =
    trpc.administrator.services.getRequests.useQuery(undefined, { refetchOnWindowFocus: false });

  const updateRequestMutation = trpc.administrator.services.updateRequest.useMutation({
    onSuccess: () => {
      toast.success("Cập nhật yêu cầu thành công!");
      setRequestDetailsOpen(false);
      refetchRequests();
    },
    onError: (err) => toast.error(err.message || "Cập nhật yêu cầu thất bại"),
  });

  const deleteRequestMutation = trpc.administrator.services.deleteRequest.useMutation({
    onSuccess: () => {
      toast.success("Xóa yêu cầu thành công!");
      refetchRequests();
    },
    onError: (err) => toast.error(err.message || "Xóa yêu cầu thất bại"),
  });

  const requestsList = requestsData || [];
  const [requestsSearch, setRequestsSearch] = useState("");
  const [requestsSorting, setRequestsSorting] = useState<SortingState>([]);
  const [requestsPagination, setRequestsPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [requestStatusFilter, setRequestStatusFilter] = useState("all");

  const [requestDetailsOpen, setRequestDetailsOpen] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<any | null>(null);
  const [requestForm, setRequestForm] = useState({
    status: "pending" as any,
    price: 0,
    note: "",
  });

  const [requestToDelete, setRequestToDelete] = useState<any | null>(null);

  const handleOpenRequestDetails = (req: any) => {
    setViewingRequest(req);
    setRequestForm({
      status: req.status,
      price: req.price || req.package?.price || req.service?.basePrice || 0,
      note: req.note || "",
    });
    setRequestDetailsOpen(true);
  };

  const saveRequestUpdates = () => {
    if (!viewingRequest) return;
    updateRequestMutation.mutate({
      id: viewingRequest.id,
      data: requestForm,
    });
  };

  const filteredRequests = useMemo(() => {
    let result = [...requestsList];

    if (requestsSearch) {
      result = result.filter(
        (r) =>
          r.customerName.toLowerCase().includes(requestsSearch.toLowerCase()) ||
          r.customerEmail.toLowerCase().includes(requestsSearch.toLowerCase()) ||
          r.customerPhone.includes(requestsSearch) ||
          (r.service?.name && r.service.name.toLowerCase().includes(requestsSearch.toLowerCase()))
      );
    }

    if (requestStatusFilter !== "all") {
      result = result.filter((r) => r.status === requestStatusFilter);
    }

    if (requestsSorting.length > 0) {
      const { id, desc } = requestsSorting[0];
      result.sort((a: any, b: any) => {
        const valA = a[id];
        const valB = b[id];
        if (valA === undefined || valB === undefined) return 0;
        if (typeof valA === "string" && typeof valB === "string") {
          return desc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        return desc
          ? new Date(valB).getTime() - new Date(valA).getTime()
          : new Date(valA).getTime() - new Date(valB).getTime();
      });
    }

    return result;
  }, [requestsList, requestsSearch, requestStatusFilter, requestsSorting]);

  const paginatedRequests = useMemo(() => {
    const start = requestsPagination.pageIndex * requestsPagination.pageSize;
    const end = start + requestsPagination.pageSize;
    return filteredRequests.slice(start, end);
  }, [filteredRequests, requestsPagination]);

  const renderRequestSpecifications = (req: any) => {
    const specs = req.specifications || {};
    const fields = req.service?.fieldsConfig || [];

    if (Object.keys(specs).length === 0) {
      return <span className="italic text-muted-foreground/60">(Không có dữ liệu khảo sát)</span>;
    }

    return (
      <div className="space-y-3 p-4 bg-muted/30 border border-border/60 rounded-xl">
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <Icon icon="solar:clipboard-list-line-duotone" className="text-vanixjnk text-base" />
          Thông tin khảo sát nhu cầu
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(specs).map(([key, value]) => {
            const config = fields.find((f: any) => f.key === key);
            const label = config?.label || key;
            const displayValue = Array.isArray(value) 
              ? value.join(", ") 
              : typeof value === "boolean" 
                ? (value ? "Có" : "Không") 
                : String(value || "N/A");

            return (
              <div key={key} className="space-y-1">
                <span className="text-xs text-muted-foreground block">
                  {label}
                </span>
                <span className="text-xs font-medium text-foreground bg-background/50 border px-2.5 py-1.5 rounded-lg block">
                  {displayValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const requestColumns = React.useMemo<ColumnDef<any>[]>(() => [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-normal">
          {requestsPagination.pageIndex * requestsPagination.pageSize + row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: "customerName",
      meta: { title: "Khách hàng" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[13px]">{row.original.customerName}</span>
          <span className="text-[10px] text-muted-foreground font-mono">{row.original.customerEmail}</span>
        </div>
      ),
    },
    {
      accessorKey: "customerSocial",
      meta: { title: "Kênh liên hệ" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 max-w-[150px] truncate">
          <span className="text-[11px] font-medium text-foreground flex items-center gap-1">
            <Icon icon="solar:phone-calling-line-duotone" className="size-3.5 text-muted-foreground" />
            {row.original.customerPhone}
          </span>
          <span className="text-[10px] font-medium text-vanixjnk flex items-center gap-1">
            <Icon icon="solar:chat-round-line-duotone" className="size-3.5" />
            {row.original.customerSocial}
          </span>
        </div>
      ),
    },
    {
      id: "service",
      meta: { title: "Dịch vụ yêu cầu" },
      header: "Dịch vụ & Gói",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[12px] text-foreground">{row.original.service?.name || "N/A"}</span>
          {row.original.package && (
            <span className="text-[10px] font-medium text-muted-foreground">
              Gói: {row.original.package.name} ({row.original.package.price.toLocaleString("vi-VN")} đ)
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "price",
      meta: { title: "Giá thỏa thuận" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const price = row.getValue("price") as number | null;
        return (
          <span className="text-xs font-mono font-semibold text-foreground">
            {price ? `${price.toLocaleString("vi-VN")} đ` : "Chưa thỏa thuận"}
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
        const variants: Record<string, "outline" | "secondary" | "success" | "danger"> = {
          pending: "outline",
          confirmed: "secondary",
          processing: "secondary",
          completed: "success",
          cancelled: "danger",
        };
        const labels: Record<string, string> = {
          pending: "Đợi duyệt",
          confirmed: "Đã duyệt",
          processing: "Đang xử lý",
          completed: "Đã bàn giao",
          cancelled: "Đã hủy",
        };
        return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      meta: { title: "Ngày gửi" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => (
        <span className="text-xs font-mono text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
        </span>
      ),
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
          <PopoverContent className="w-36 p-1 flex flex-col gap-0.5" align="end">
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2"
              onClick={() => handleOpenRequestDetails(row.original)}
            >
              <Icon icon="solar:eye-line-duotone" className="mr-2 size-3.5" />
              Chi tiết / Duyệt
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              onClick={() => {
                setRequestToDelete(row.original);
              }}
            >
              <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-2 size-3.5" />
              Xóa yêu cầu
            </Button>
          </PopoverContent>
        </Popover>
      ),
    },
  ], [requestsPagination]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Danh sách yêu cầu dịch vụ</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý, chốt giá và duyệt các đơn yêu cầu khảo sát từ khách hàng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchRequests()} disabled={requestsLoading || requestsFetching} className="gap-1.5 shrink-0">
            <Icon icon="solar:restart-line-duotone" className={cn("text-base", (requestsLoading || requestsFetching) && "animate-spin")} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      <DataTable
        columns={requestColumns}
        data={paginatedRequests}
        isLoading={requestsLoading}
        pageCount={Math.ceil(filteredRequests.length / requestsPagination.pageSize)}
        totalRecords={filteredRequests.length}
        pagination={requestsPagination}
        onPaginationChange={setRequestsPagination}
        sorting={requestsSorting}
        onSortingChange={setRequestsSorting}
        toolbarInput={
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Icon icon="solar:magnifer-line-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
              <Input
                placeholder="Tìm kiếm khách hàng, email..."
                className="pl-9 h-9 text-sm w-full bg-background"
                value={requestsSearch}
                onChange={(e) => setRequestsSearch(e.target.value)}
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-9 w-9 border-border bg-background hover:bg-muted/50 shrink-0",
                    requestStatusFilter !== "all" && "text-vanixjnk border-vanixjnk/30 bg-vanixjnk/5 hover:bg-vanixjnk/10"
                  )}
                  title="Lọc trạng thái"
                >
                  <Icon icon="solar:filter-line-duotone" className="size-4 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3 flex flex-col gap-2" align="end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Trạng thái đơn
                  </label>
                  <Select value={requestStatusFilter} onValueChange={setRequestStatusFilter}>
                    <SelectTrigger size="sm" className="w-full justify-between bg-background border-border">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start">
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:globus-line-duotone" className="size-4 text-muted-foreground" />
                          <span>Tất cả</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:clock-circle-line-duotone" className="size-4 text-amber-500" />
                          <span>Đợi duyệt (Pending)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="confirmed">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:check-circle-line-duotone" className="size-4 text-blue-500" />
                          <span>Đã duyệt (Confirmed)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="processing">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:refresh-line-duotone" className="size-4 text-indigo-500" />
                          <span>Đang xử lý</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:verified-check-line-duotone" className="size-4 text-green-500" />
                          <span>Đã hoàn thành</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cancelled">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:close-circle-line-duotone" className="size-4 text-rose-500" />
                          <span>Đã hủy</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        }
      />

      <Sheet open={requestDetailsOpen} onOpenChange={setRequestDetailsOpen}>
        <SheetContent className="sm:max-w-[650px] w-full p-0 flex flex-col">
          <SheetHeader className="p-6">
            <div className="size-10 rounded-xl bg-vanixjnk/10 text-vanixjnk flex items-center justify-center shrink-0 mb-2">
              <Icon icon="solar:inbox-in-line-duotone" className="size-6 text-vanixjnk" />
            </div>
            <SheetTitle className="text-xl font-bold">Duyệt yêu cầu dịch vụ</SheetTitle>
            <SheetDescription>
              Xem chi tiết hồ sơ khách hàng, câu hỏi khảo sát và cập nhật tiến độ xử lý đơn yêu cầu.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar bg-background">
            {viewingRequest && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border bg-background/60">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Khách hàng đặt</span>
                    <p className="text-sm font-semibold text-foreground">{viewingRequest.customerName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{viewingRequest.customerEmail}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Thông tin liên hệ</span>
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Icon icon="solar:phone-calling-line-duotone" className="size-3.5 text-muted-foreground" />
                      {viewingRequest.customerPhone}
                    </p>
                    <p className="text-xs font-semibold text-vanixjnk flex items-center gap-1">
                      <Icon icon="solar:chat-round-line-duotone" className="size-3.5" />
                      {viewingRequest.customerSocial}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-background/60 space-y-2">
                  <span className="text-xs text-muted-foreground block">Dịch vụ yêu cầu đặt</span>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{viewingRequest.service?.name}</h4>
                      <span className="text-xs text-muted-foreground font-mono">Loại: {viewingRequest.service?.type}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-foreground block">
                        Gói: {viewingRequest.package?.name || "Giá mặc định"}
                      </span>
                      <span className="text-xs font-mono font-semibold text-vanixjnk">
                        {(viewingRequest.package?.price || viewingRequest.service?.basePrice || 0).toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>
                </div>

                {renderRequestSpecifications(viewingRequest)}

                {viewingRequest.requirements && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">Mô tả thêm từ khách hàng</span>
                    <div className="p-3 bg-muted/20 border rounded-xl text-xs text-foreground/80 whitespace-pre-wrap">
                      {viewingRequest.requirements}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Xử lý yêu cầu & Duyệt giá</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[13px] font-bold text-foreground">Trạng thái xử lý</label>
                      <Select value={requestForm.status} onValueChange={(val: any) => setRequestForm(prev => ({ ...prev, status: val }))}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">
                            <div className="flex items-center gap-2">
                              <Icon icon="solar:clock-circle-line-duotone" className="size-4 text-amber-500" />
                              <span>Chờ xử lý (Pending)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="confirmed">
                            <div className="flex items-center gap-2">
                              <Icon icon="solar:check-circle-line-duotone" className="size-4 text-blue-500" />
                              <span>Đã duyệt (Confirmed)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="processing">
                            <div className="flex items-center gap-2">
                              <Icon icon="solar:restart-line-duotone" className="size-4 text-indigo-500" />
                              <span>Đang thiết kế/code</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="completed">
                            <div className="flex items-center gap-2">
                              <Icon icon="solar:verified-check-line-duotone" className="size-4 text-green-500" />
                              <span>Đã hoàn thành bàn giao</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="cancelled">
                            <div className="flex items-center gap-2">
                              <Icon icon="solar:close-circle-line-duotone" className="size-4 text-rose-500" />
                              <span>Đã hủy bỏ</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[13px] font-bold text-foreground">Giá tiền chốt thỏa thuận (VNĐ)</label>
                      <Input
                        type="text"
                        value={formatCurrencyInput(requestForm.price)}
                        onChange={(e) => {
                          const parsed = parseCurrencyInput(e.target.value);
                          setRequestForm((prev) => ({ ...prev, price: parsed }));
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[13px] font-bold text-foreground">Ghi chú nội bộ quản trị viên</label>
                    <Textarea placeholder="Nhập ghi chú hoặc thông tin giao dịch..." rows={2} value={requestForm.note} onChange={(e) => setRequestForm(prev => ({ ...prev, note: e.target.value }))} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setRequestDetailsOpen(false)}>Đóng</Button>
            <Button variant="vanixjnk" onClick={saveRequestUpdates} disabled={updateRequestMutation.isPending}>
              {updateRequestMutation.isPending && (
                <Icon icon="solar:restart-line-duotone" className="mr-1.5 size-4 animate-spin" />
              )}
              Cập nhật yêu cầu
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!requestToDelete} onOpenChange={(open) => !open && setRequestToDelete(null)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500">
              <Icon icon="solar:danger-triangle-line-duotone" className="text-xl" />
              <span>Xác nhận xóa đơn yêu cầu</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Hành động này sẽ xóa vĩnh viễn đơn yêu cầu từ khách hàng <strong className="text-foreground">"{requestToDelete?.customerName}"</strong> và không thể hoàn tác.
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setRequestToDelete(null)}>Hủy</Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (requestToDelete) {
                  deleteRequestMutation.mutate({ id: requestToDelete.id });
                  setRequestToDelete(null);
                }
              }}
              disabled={deleteRequestMutation.isPending}
            >
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
