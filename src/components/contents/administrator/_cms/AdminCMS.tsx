"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GalleryDialog } from "@/components/vanixjnk/gallery-dialog";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { MdxRenderer, MdxEditor, UI_COMPONENTS_TEMPLATES, insertMdxAtCursor } from "@/components/vanixjnk/mdx-builder";
import { cn } from "@/lib/utils";

// Định nghĩa Interface dữ liệu CMS
interface CmsPageMock {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  thumbnail: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isActive: boolean;
  publishedAt: string | null;
  createdAt: string;
}

// Danh sách dữ liệu mẫu
const INITIAL_PAGES: CmsPageMock[] = [
  {
    id: "1",
    title: "Về chúng tôi - Vani Studio",
    slug: "ve-chung-toi",
    description: "Giới thiệu về tầm nhìn, sứ mệnh và đội ngũ sáng lập của Vani Studio.",
    content: `# Chào mừng đến với Vani Studio!

Chúng tôi là một tập thể sáng tạo chuyên thiết kế **Website chuyên nghiệp**, phát triển **Ứng dụng di động**, giải pháp **Chatbot AI** và **giao diện UI/UX** chất lượng cao.

<Alert variant="default" className="border-vanixjnk/20 bg-vanixjnk/5 text-foreground my-4">
  <Icon icon="solar:info-square-line-duotone" className="size-5 text-vanixjnk" />
  <AlertTitle className="text-vanixjnk font-bold">Thông báo</AlertTitle>
  <AlertDescription>Vani Studio vừa ra mắt phiên bản v2 với giao diện quản trị hiện đại, hỗ trợ soạn thảo MDX phong phú.</AlertDescription>
</Alert>

## Tầm nhìn & Sứ mệnh

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
  <Card className="border-border/60 bg-card">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-vanixjnk">
        <Icon icon="solar:eye-line-duotone" className="size-5" />
        <span>Tầm nhìn</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      Trở thành đơn vị tiên phong kiến tạo giải pháp công nghệ hiện đại, nâng tầm trải nghiệm người dùng.
    </CardContent>
  </Card>

  <Card className="border-border/60 bg-card">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-vanixjnk">
        <Icon icon="solar:stars-line-duotone" className="size-5" />
        <span>Sứ mệnh</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      Mang lại giá trị tối đa cho khách hàng thông qua những sản phẩm chất lượng tốt nhất với thiết kế chỉn chu.
    </CardContent>
  </Card>
</div>

## Câu hỏi thường gặp

<Accordion type="single" collapsible className="w-full border border-border/60 rounded-xl px-4 py-2 bg-muted/10">
  <AccordionItem value="item-1">
    <AccordionTrigger>Thời gian hoàn thành một dự án thiết kế UI/UX là bao lâu?</AccordionTrigger>
    <AccordionContent>
      Thời gian trung bình khoảng từ 2 đến 4 tuần tùy thuộc vào quy mô và yêu cầu cụ thể của từng dự án.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Vani Studio có hỗ trợ sau bàn giao không?</AccordionTrigger>
    <AccordionContent>
      Có, chúng tôi cung cấp gói bảo hành 12 tháng miễn phí và hỗ trợ kỹ thuật 24/7 sau khi bàn giao sản phẩm.
    </AccordionContent>
  </AccordionItem>
</Accordion>

<div className="flex gap-2.5 mt-6">
  <Button variant="default" className="bg-vanixjnk text-white hover:bg-vanixjnk/90">
    Liên hệ ngay
  </Button>
  <Button variant="outline" className="border-border/80">
    Xem bảng giá
  </Button>
</div>`,
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
    metaTitle: "Giới thiệu về Vani Studio | Thiết kế UI/UX & Website",
    metaDescription: "Tìm hiểu thêm về đội ngũ phát triển, văn hóa và dịch vụ thiết kế UI/UX, website chuyên nghiệp tại Vani Studio.",
    metaKeywords: "vani studio, gioi thieu vani studio, thiet ke website, lap trinh app",
    isActive: true,
    publishedAt: "2026-06-01T08:00:00.000Z",
    createdAt: "2026-06-01T08:00:00.000Z",
  },
  {
    id: "2",
    title: "Chính sách bảo mật thông tin",
    slug: "chinh-sach-bao-mat",
    description: "Chính sách cam kết bảo vệ dữ liệu cá nhân của khách hàng khi truy cập Vani Studio.",
    content: `# Chính sách bảo mật thông tin khách hàng

Chúng tôi cam kết bảo vệ tuyệt đối thông tin riêng tư của người dùng. Bản chính sách này làm rõ các dữ liệu chúng tôi thu thập và cách sử dụng chúng.

## 1. Dữ liệu thu thập
- Tên và địa chỉ Email khi bạn gửi biểu mẫu liên hệ.
- Địa chỉ IP và lịch sử truy cập thông qua Google Analytics.

## 2. Bảo mật thông tin
Mọi dữ liệu truyền tải đều được mã hóa SSL/TLS an toàn. Chúng tôi tuyệt đối không bán hoặc cung cấp thông tin của bạn cho bên thứ ba.`,
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
    metaTitle: "Chính sách bảo mật | Vani Studio",
    metaDescription: "Đọc kỹ chính sách bảo mật thông tin người dùng và cam kết bảo vệ dữ liệu cá nhân tại Vani Studio.",
    metaKeywords: "chinh sach bao mat, bao mat thong tin, vani studio",
    isActive: true,
    publishedAt: "2026-06-02T10:30:00.000Z",
    createdAt: "2026-06-02T10:30:00.000Z",
  },
  {
    id: "3",
    title: "Điều khoản sử dụng dịch vụ",
    slug: "dieu-khoan-dich-vu",
    description: "Quy định và các điều khoản pháp lý ràng buộc giữa khách hàng và Vani Studio.",
    content: `# Điều khoản sử dụng dịch vụ

Chào mừng bạn truy cập trang web của chúng tôi. Khi sử dụng các dịch vụ do Vani Studio cung cấp, bạn mặc định đồng ý tuân thủ các điều khoản sau.

## 1. Quyền sở hữu trí tuệ
Mọi mã nguồn, thiết kế UI/UX, và tài liệu trên website này đều thuộc quyền sở hữu độc quyền của Vani Studio. Bạn không được sao chép khi chưa có văn bản đồng ý.

## 2. Giới hạn trách nhiệm
Chúng tôi nỗ lực tối đa để vận hành website thông suốt, tuy nhiên không chịu trách nhiệm nếu dịch vụ bị gián đoạn do sự cố bất khả kháng hoặc nhà mạng cung cấp.`,
    thumbnail: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
    metaTitle: "Điều khoản sử dụng dịch vụ | Vani Studio",
    metaDescription: "Chi tiết quy định sử dụng dịch vụ và trách nhiệm pháp lý giữa Vani Studio và khách hàng.",
    metaKeywords: "dieu khoan dich vu, dieu khoan vani studio, quy dinh su dung",
    isActive: true,
    publishedAt: "2026-06-03T14:15:00.000Z",
    createdAt: "2026-06-03T14:15:00.000Z",
  },
  {
    id: "4",
    title: "Quy trình thanh toán và Hoàn trả",
    slug: "chinh-sach-thanh-toan",
    description: "Thông tin hướng dẫn giao dịch, thanh toán trực tuyến và hoàn tiền cho các dịch vụ phần mềm.",
    content: `# Chính sách Thanh toán và Hoàn trả

Bài viết hướng dẫn quy trình chuyển khoản ngân hàng, thanh toán qua cổng điện tử và điều kiện hoàn tiền dịch vụ.

## 1. Phương thức thanh toán
Khách hàng có thể thanh toán qua các tài khoản ngân hàng chính thức của Vani Studio được cung cấp khi ký hợp đồng.

## 2. Điều kiện hoàn tiền
- Hoàn trả 100% nếu dự án chưa được khởi tạo thiết kế sau 7 ngày làm việc kể từ lúc đặt cọc.
- Hoàn trả 50% nếu khách hàng yêu cầu hủy khi thiết kế demo UI/UX đã hoàn thiện.`,
    thumbnail: "https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=600&q=80",
    metaTitle: "Quy trình thanh toán & Hoàn trả phí dịch vụ | Vani Studio",
    metaDescription: "Hướng dẫn thực hiện thanh toán hợp đồng và chính sách bồi hoàn chi phí dịch vụ của Vani Studio.",
    metaKeywords: "hoan tien, thanh toan hop dong, vani studio",
    isActive: false,
    publishedAt: null,
    createdAt: "2026-06-04T09:20:00.000Z",
  }
];

export default function AdminCMS() {
  // Quản lý danh sách trang CMS
  const [pages, setPages] = useState<CmsPageMock[]>(INITIAL_PAGES);

  // Bộ lọc & Tìm kiếm & Phân trang giống AdminDenies.tsx
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  // State màn hình (list = Danh sách, editor = Trình soạn thảo)
  const [viewMode, setViewMode] = useState<"list" | "editor">("list");
  const [editingPage, setEditingPage] = useState<CmsPageMock | null>(null);

  // Form soạn thảo CMS
  const [formData, setFormData] = useState<Partial<CmsPageMock>>({
    title: "",
    slug: "",
    description: "",
    content: "",
    thumbnail: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    isActive: true,
  });

  // State các hộp thoại Dialog
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<CmsPageMock | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState<CmsPageMock | null>(null);

  // State tab trong Trình soạn thảo (content = Nội dung, seo = Cấu hình SEO)
  const [editorTab, setEditorTab] = useState<"content" | "seo">("content");

  // Trình target cho gallery picker (thumbnail = Ảnh đại diện, editor = Chèn vào nội dung)
  const [galleryTarget, setGalleryTarget] = useState<"thumbnail" | "editor">("thumbnail");

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (textToInsert: string) => {
    insertMdxAtCursor(textareaRef.current, textToInsert, formData.content || "", (val) => {
      setFormData((prev) => ({ ...prev, content: val }));
    });
  };

  // Debounce tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Tạo slug tự động từ tiêu đề
  const handleGenerateSlug = () => {
    if (!formData.title) {
      toast.error("Vui lòng nhập Tiêu đề trước khi tạo Slug!");
      return;
    }
    const slug = formData.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    
    setFormData((prev) => ({ ...prev, slug }));
    toast.success("Đã tạo Slug tự động thành công!");
  };

  // Mở trình soạn thảo tạo mới
  const handleCreateNew = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      content: "",
      thumbnail: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      isActive: true,
    });
    setEditingPage(null);
    setEditorTab("content");
    setViewMode("editor");
  };

  // Mở trình soạn thảo chỉnh sửa
  const handleEdit = (page: CmsPageMock) => {
    setEditingPage(page);
    setFormData({ ...page });
    setEditorTab("content");
    setViewMode("editor");
  };

  // Lưu dữ liệu (Giả lập Client-side)
  const handleSave = () => {
    if (!formData.title?.trim()) {
      toast.error("Tiêu đề trang không được để trống!");
      return;
    }
    if (!formData.slug?.trim()) {
      toast.error("Đường dẫn (Slug) không được để trống!");
      return;
    }
    if (!formData.content?.trim()) {
      toast.error("Nội dung trang không được để trống!");
      return;
    }

    if (editingPage) {
      // Chỉnh sửa trang hiện tại
      setPages((prev) =>
        prev.map((p) =>
          p.id === editingPage.id
            ? ({
                ...p,
                ...formData,
                publishedAt: formData.isActive ? (p.publishedAt || new Date().toISOString()) : null,
              } as CmsPageMock)
            : p
        )
      );
      toast.success("Cập nhật trang CMS thành công!");
    } else {
      // Tạo trang mới
      const newPage: CmsPageMock = {
        id: Date.now().toString(),
        title: formData.title,
        slug: formData.slug,
        description: formData.description || "",
        content: formData.content,
        thumbnail: formData.thumbnail || "",
        metaTitle: formData.metaTitle || "",
        metaDescription: formData.metaDescription || "",
        metaKeywords: formData.metaKeywords || "",
        isActive: formData.isActive || false,
        publishedAt: formData.isActive ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
      };
      setPages((prev) => [newPage, ...prev]);
      toast.success("Thêm mới trang CMS thành công!");
    }
    setViewMode("list");
  };

  // Xác nhận mở dialog xóa
  const triggerDelete = (page: CmsPageMock) => {
    setPageToDelete(page);
    setDeleteConfirmOpen(true);
  };

  // Thực thi xóa
  const confirmDelete = () => {
    if (pageToDelete) {
      setPages((prev) => prev.filter((p) => p.id !== pageToDelete.id));
      toast.success(`Đã xóa thành công trang "${pageToDelete.title}"!`);
      setDeleteConfirmOpen(false);
      setPageToDelete(null);
    }
  };

  // Lọc dữ liệu hiển thị (Bao gồm cả sắp xếp và tìm kiếm)
  const filteredPages = useMemo(() => {
    let result = [...pages];

    if (debouncedSearch) {
      result = result.filter(
        (page) =>
          page.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          page.slug.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (page.description && page.description.toLowerCase().includes(debouncedSearch.toLowerCase()))
      );
    }

    if (filterActive !== "all") {
      result = result.filter((page) =>
        filterActive === "active" ? page.isActive : !page.isActive
      );
    }

    // Áp dụng sắp xếp động giống react-table
    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      result.sort((a: any, b: any) => {
        const valA = a[id];
        const valB = b[id];
        if (valA === undefined || valB === undefined) return 0;
        if (typeof valA === "string" && typeof valB === "string") {
          return desc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        if (typeof valA === "boolean" && typeof valB === "boolean") {
          return desc ? (valA === valB ? 0 : valA ? -1 : 1) : (valA === valB ? 0 : valA ? 1 : -1);
        }
        return desc
          ? new Date(valB).getTime() - new Date(valA).getTime()
          : new Date(valA).getTime() - new Date(valB).getTime();
      });
    }

    return result;
  }, [pages, debouncedSearch, filterActive, sorting]);

  // Phân trang dữ liệu hiển thị ở Client-side
  const paginatedPages = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredPages.slice(start, end);
  }, [filteredPages, pagination]);

  // Thiết lập các Cột cho DataTable
  const columns = React.useMemo<ColumnDef<CmsPageMock>[]>(() => [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => {
        const pageIdx = pagination.pageIndex;
        const pageSize = pagination.pageSize;
        return (
          <span className="text-muted-foreground font-normal">
            {pageIdx * pageSize + row.index + 1}
          </span>
        );
      },
    },
    {
      accessorKey: "thumbnail",
      meta: { title: "Ảnh đại diện" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const thumb = row.getValue("thumbnail") as string;
        const title = row.original.title;
        return (
          <div className="size-11 rounded-lg border border-border bg-muted/40 overflow-hidden flex items-center justify-center shadow-2xs">
            {thumb ? (
              <img src={thumb} alt={title} className="size-full object-cover" />
            ) : (
              <Icon icon="solar:gallery-remove-line-duotone" className="size-5 text-muted-foreground" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      meta: { title: "Trang CMS" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        const slug = row.original.slug;
        return (
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[13px] font-bold text-foreground hover:text-vanixjnk transition-colors cursor-pointer"
              onClick={() => handleEdit(row.original)}
            >
              {title}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Icon icon="solar:link-broken-line-duotone" className="size-3" />
              /{slug}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      meta: { title: "Mô tả ngắn" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const desc = row.getValue("description") as string;
        return (
          <span className="text-xs text-muted-foreground max-w-[280px] block truncate font-medium">
            {desc || <span className="italic text-muted-foreground/60">(Không có mô tả)</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "isActive",
      meta: { title: "Trạng thái" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const active = row.getValue("isActive") as boolean;
        return (
          <Badge variant={active ? "success" : "destructive"}>
            <Icon
              icon={active ? "solar:check-circle-line-duotone" : "solar:slash-circle-line-duotone"}
              className="size-3.5 mr-1"
            />
            {active ? "Hoạt động" : "Tạm ẩn"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      meta: { title: "Ngày tạo" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const dateStr = row.getValue("createdAt") as string;
        return (
          <span className="text-xs font-mono text-muted-foreground">
            {new Date(dateStr).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            onClick={() => {
              setPreviewPage(row.original);
              setPreviewOpen(true);
            }}
          >
            <Icon icon="solar:eye-line-duotone" className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-vanixjnk hover:text-vanixjnk hover:bg-vanixjnk/10"
            onClick={() => handleEdit(row.original)}
          >
            <Icon icon="solar:pen-line-duotone" className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => triggerDelete(row.original)}
          >
            <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
          </Button>
        </div>
      ),
    },
  ], [pagination]);

  // Render định dạng MDX (sử dụng component dùng chung)
  const renderMarkdown = (text: string) => {
    return <MdxRenderer content={text} scope={{ formData }} />;
  };

  return (
    <div className="flex flex-col w-full flex-1">
      {/* 1. Header Trang */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:bookmark-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Trang CMS tĩnh</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Quản lý nội dung, bài viết giới thiệu, điều khoản điều kiện và thông tin chính sách của cửa hàng.
                </p>
              </div>
            </div>
            
            {viewMode === "list" && (
              <Button
                variant="vanixjnk"
                size="sm"
                onClick={handleCreateNew}
                className="gap-1.5 shrink-0 font-semibold shadow-md"
              >
                <Icon icon="solar:add-circle-line-duotone" className="text-lg" />
                <span>Tạo trang mới</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Dải phân cách họa tiết kiến trúc */}
      <div
        className="relative w-full border-t border-b border-dashed border-primary/20 overflow-hidden text-primary/20"
        style={{ height: "36px" }}
      >
        <div
          className="absolute inset-y-0 left-[-100vw] w-[300vw]"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)"
          }}
        />
      </div>

      {/* 2. Nội dung chi tiết */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col mb-10">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 min-h-[500px]">
          
          {/* A. GIAO DIỆN DANH SÁCH (List Mode) */}
          {viewMode === "list" && (
            <div className="space-y-6">
              {/* Sử dụng component DataTable chính xác như AdminDenies.tsx */}
              <DataTable
                columns={columns}
                data={paginatedPages}
                isLoading={false}
                searchPlaceholder="Tìm kiếm theo tiêu đề hoặc slug..."
                pageCount={Math.ceil(filteredPages.length / pagination.pageSize)}
                totalRecords={filteredPages.length}
                pagination={pagination}
                onPaginationChange={setPagination}
                sorting={sorting}
                onSortingChange={setSorting}
                toolbarInput={
                  <div className="flex items-center gap-2 w-full">
                    <div className="relative flex-1">
                      <Icon
                        icon="solar:magnifer-line-duotone"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"
                      />
                      <Input
                        placeholder="Tìm kiếm theo tiêu đề hoặc slug..."
                        className="pl-9 h-9 text-sm w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className={cn(
                            "h-9 w-9 border-border bg-background hover:bg-muted/50 shrink-0",
                            filterActive !== "all" && "text-vanixjnk border-vanixjnk/30 bg-vanixjnk/5 hover:bg-vanixjnk/10"
                          )}
                          title="Lọc trạng thái"
                        >
                          <Icon icon="solar:filter-line-duotone" className="size-4 shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-3 flex flex-col gap-2" align="end">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Trạng thái
                          </label>
                          <Select value={filterActive} onValueChange={(val: any) => setFilterActive(val)}>
                            <SelectTrigger size="sm" className="w-full justify-between bg-background border-border">
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent position="popper" align="start">
                              <SelectItem value="all">Tất cả</SelectItem>
                              <SelectItem value="active">Hoạt động</SelectItem>
                              <SelectItem value="inactive">Tạm ẩn</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                }
              />
            </div>
          )}

          {/* B. GIAO DIỆN TRÌNH SOẠN THẢO (Editor Mode) */}
          {viewMode === "editor" && (
            <div className="space-y-6">
              {/* Thanh điều hướng Editor */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="size-8 rounded-lg p-0 shrink-0"
                    title="Quay lại danh sách"
                  >
                    <Icon icon="solar:arrow-left-line-duotone" className="size-5" />
                  </Button>
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      {editingPage ? `Chỉnh sửa trang CMS` : "Tạo trang CMS mới"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {editingPage ? `Đang chỉnh sửa nội dung cho: ${editingPage.title}` : "Điền thông tin và tạo bài viết tĩnh mới."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="text-xs font-semibold"
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="vanixjnk"
                    size="sm"
                    onClick={handleSave}
                    className="gap-1.5 font-bold shadow-md text-xs"
                  >
                    <Icon icon="solar:diskette-line-duotone" className="size-4" />
                    <span>Lưu bài viết</span>
                  </Button>
                </div>
              </div>

              {/* Phân chia cấu hình */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* 2.1 Cột nội dung chính (Trái - 8 columns) */}
                <div className="lg:col-span-8 space-y-5">
                  <div className="grid grid-cols-2 sm:flex items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-full sm:w-auto sm:self-start whitespace-nowrap">
                    <button
                      onClick={() => setEditorTab("content")}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto",
                        editorTab === "content"
                          ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-sm"
                          : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      )}
                    >
                      <Icon icon="solar:document-text-line-duotone" className="size-4" />
                      <span>Nội dung bài viết</span>
                    </button>
                    <button
                      onClick={() => setEditorTab("seo")}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto",
                        editorTab === "seo"
                          ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-sm"
                          : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      )}
                    >
                      <Icon icon="solar:magnifer-zoom-in-line-duotone" className="size-4" />
                      <span>Tối ưu SEO (Meta)</span>
                    </button>
                  </div>

                  {editorTab === "content" && (
                    <div className="space-y-4">
                      {/* Tiêu đề */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground flex items-center gap-1">
                          Tiêu đề trang <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="Ví dụ: Về chúng tôi - Vani Studio"
                          className="h-9 text-xs"
                        />
                      </div>

                      {/* Slug */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground flex items-center justify-between w-full">
                          <span>Đường dẫn URL thân thiện (Slug) <span className="text-red-500">*</span></span>
                          <button
                            type="button"
                            onClick={handleGenerateSlug}
                            className="text-[10px] text-vanixjnk hover:underline flex items-center gap-1 font-bold"
                          >
                            <Icon icon="solar:magic-stick-2-line-duotone" />
                            Tự động tạo
                          </button>
                        </label>
                        <div className="flex gap-2">
                          <div className="flex items-center bg-muted/40 border border-border/80 px-2.5 rounded-md text-[11px] text-muted-foreground select-none font-mono">
                            /
                          </div>
                          <Input
                            value={formData.slug}
                            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                            placeholder="ve-chung-toi"
                            className="h-9 text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Mô tả ngắn */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Mô tả ngắn</label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Tóm tắt ngắn gọn nội dung trang CMS này dùng để hiển thị..."
                          className="h-16 text-xs resize-none"
                        />
                      </div>

                      {/* Khung Editor MDX / Markdown tích hợp */}
                      <MdxEditor
                        ref={textareaRef}
                        value={formData.content || ""}
                        onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
                        onOpenGallery={() => {
                          setGalleryTarget("editor");
                          setGalleryOpen(true);
                        }}
                        scope={{ formData }}
                      />
                    </div>
                  )}

                  {editorTab === "seo" && (
                    <div className="space-y-4">
                      {/* Meta Title */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Meta Title (Tiêu đề SEO)</label>
                        <Input
                          value={formData.metaTitle}
                          onChange={(e) => setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))}
                          placeholder="Tiêu đề hiển thị trên thẻ trình duyệt Google..."
                          className="h-9 text-xs"
                        />
                      </div>

                      {/* Meta Description */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Meta Description (Mô tả SEO)</label>
                        <Textarea
                          value={formData.metaDescription}
                          onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
                          placeholder="Nhập mô tả tóm tắt để tối ưu kết quả tìm kiếm..."
                          className="h-24 text-xs resize-none"
                        />
                      </div>

                      {/* Meta Keywords */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Meta Keywords (Từ khóa SEO)</label>
                        <Input
                          value={formData.metaKeywords}
                          onChange={(e) => setFormData((prev) => ({ ...prev, metaKeywords: e.target.value }))}
                          placeholder="Từ khóa SEO ngăn cách bởi dấu phẩy..."
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2.2 Cột thiết lập cài đặt (Phải - 4 columns) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Card trạng thái hoạt động */}
                  <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-4">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b pb-2 border-border/60">
                      <Icon icon="solar:settings-line-duotone" className="size-4 text-vanixjnk" />
                      Trạng thái & Xuất bản
                    </h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[12px] font-bold text-foreground">Kích hoạt trang</span>
                        <span className="text-[10px] text-muted-foreground">Công khai bài viết ra ngoài.</span>
                      </div>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(val) => setFormData((prev) => ({ ...prev, isActive: val }))}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Ngày xuất bản</span>
                      <div className="flex items-center gap-2 p-2.5 bg-background border border-border rounded-lg text-xs font-mono text-muted-foreground select-none">
                        <Icon icon="solar:calendar-line-duotone" className="size-4" />
                        {formData.isActive ? (
                          <span>Tự động kích hoạt khi lưu</span>
                        ) : (
                          <span className="italic text-muted-foreground/60">(Đang ở chế độ ẩn)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Thumbnail ảnh đại diện */}
                  <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b pb-2 border-border/60">
                      <Icon icon="solar:gallery-line-duotone" className="size-4 text-vanixjnk" />
                      Ảnh đại diện trang (Thumbnail)
                    </h4>

                    <div className="flex items-center gap-2">
                      <Input
                        value={formData.thumbnail || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail: e.target.value }))}
                        placeholder="Đường dẫn ảnh bìa..."
                        className="h-9 text-xs flex-1 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setGalleryTarget("thumbnail");
                          setGalleryOpen(true);
                        }}
                        className="size-9 flex items-center justify-center bg-vanixjnk/10 text-vanixjnk border border-vanixjnk/20 rounded-md hover:bg-vanixjnk/20 transition-colors shrink-0"
                        title="Chọn ảnh"
                      >
                        <Icon icon="solar:gallery-line-duotone" className="size-5" />
                      </button>
                    </div>

                    <div className="flex flex-col justify-center border border-border/50 rounded-xl bg-muted/20 min-h-[120px] p-2 items-center text-center overflow-hidden">
                      {formData.thumbnail ? (
                        <img src={formData.thumbnail} alt="Thumbnail preview" className="max-h-24 w-auto object-contain rounded-lg shadow-sm" />
                      ) : (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1.5"><Icon icon="solar:gallery-remove-line-duotone" /> Chưa có ảnh bìa</span>
                      )}
                    </div>
                  </div>

                  {/* Card Thư viện Component (Shadcn UI & MDX) */}
                  <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-3">
                    <div className="flex flex-col gap-0.5 border-b pb-2 border-border/60">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Icon icon="solar:widget-add-line-duotone" className="size-4 text-vanixjnk" />
                        Thành phần UI (MDX & Shadcn)
                      </h4>
                      <span className="text-[10px] text-muted-foreground">Click để chèn nhanh component tại con trỏ</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {UI_COMPONENTS_TEMPLATES.map((comp) => (
                        <button
                          key={`side-${comp.name}`}
                          type="button"
                          onClick={() => insertAtCursor(comp.template)}
                          className="flex flex-col items-start gap-1 p-2 rounded-lg bg-background border border-border/60 hover:border-vanixjnk/40 hover:bg-vanixjnk/5 transition-all duration-200 group text-left w-full shadow-2xs"
                        >
                          <div className="flex items-center gap-1.5 w-full">
                            <div className="size-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-vanixjnk/10 group-hover:text-vanixjnk transition-colors shrink-0">
                              <Icon icon={comp.icon} className="size-4" />
                            </div>
                            <span className="text-[11px] font-bold text-foreground group-hover:text-vanixjnk transition-colors truncate">
                              {comp.name}
                            </span>
                          </div>
                          <span className="text-[9px] text-muted-foreground line-clamp-1">
                            {comp.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* 3. DIALOGS PHỤ TRỢ (Xác nhận, Gallery, và Preview) */}
      
      {/* 3.1 Gallery Dialog Picker */}
      <GalleryDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onSelect={(url) => {
          if (galleryTarget === "editor") {
            insertAtCursor(`\n![Hình ảnh](${url})\n`);
            setFormData((prev) => ({
              ...prev,
              thumbnail: prev.thumbnail || url
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              thumbnail: url
            }));
          }
          setGalleryOpen(false);
          toast.success("Đã chọn ảnh thành công!");
        }}
      />

      {/* 3.2 Dialog Xác nhận xóa */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[420px] p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-destructive font-bold">
              <Icon icon="solar:danger-line-duotone" className="size-5" />
              <span>Xác nhận xóa trang?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1.5">
              Hành động này sẽ xóa vĩnh viễn trang CMS <strong>{pageToDelete?.title}</strong> khỏi cơ sở dữ liệu. Bạn chắc chắn muốn tiếp tục chứ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(false)}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              className="text-xs font-bold"
            >
              Xóa trang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3.3 Dialog Xem Trước (Frontend Preview Mock) */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto p-0 rounded-2xl border border-border bg-background">
          {previewPage && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b px-4 py-2.5 bg-muted/30 select-none">
                <div className="flex items-center gap-1.5">
                  <div className="size-3 rounded-full bg-red-500/80" />
                  <div className="size-3 rounded-full bg-yellow-500/80" />
                  <div className="size-3 rounded-full bg-green-500/80" />
                  <span className="text-[10px] font-mono text-muted-foreground ml-3 bg-muted/60 px-3 py-0.5 rounded border border-border/80">
                    https://vanistudio.com/{previewPage.slug}
                  </span>
                </div>
                <Badge variant={previewPage.isActive ? "success" : "destructive"} className="text-[9px] font-bold">
                  {previewPage.isActive ? "Đã Xuất Bản" : "Bản Nháp"}
                </Badge>
              </div>

              {previewPage.thumbnail && (
                <div className="w-full h-48 bg-muted overflow-hidden relative">
                  <img src={previewPage.thumbnail} alt="Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                </div>
              )}

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-snug">
                    {previewPage.title}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3 font-medium">
                    <span className="flex items-center gap-1"><Icon icon="solar:user-line-duotone" /> Admin</span>
                    <span className="text-border/80">•</span>
                    <span className="flex items-center gap-1">
                      <Icon icon="solar:calendar-line-duotone" />
                      {previewPage.publishedAt 
                        ? new Date(previewPage.publishedAt).toLocaleDateString("vi-VN") 
                        : "Bản nháp"
                      }
                    </span>
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none border-t pt-5">
                  {renderMarkdown(previewPage.content)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
