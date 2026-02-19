import { useState, useEffect } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePageTitle } from "@/hooks/use-page-title";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Product { id: string; name: string; }
interface User { id: string; displayName: string | null; email: string; }

const initialForm = {
  productId: "",
  productName: "",
  userId: "",
  status: "unused",
  maxActivations: "1",
  notes: "",
  domain: "",
};

function Section({ title, icon, description, children }: { title: string; icon: string; description?: string; children: React.ReactNode }) {
  return (
    <AppDashed noTopBorder padding="p-5">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon={icon} className="text-sm text-primary" />
            </div>
            <span className="text-sm font-semibold text-title">{title}</span>
          </div>
          {description && <p className="text-xs text-muted-foreground mt-1 ml-9">{description}</p>}
        </div>
        <Separator />
        {children}
      </div>
    </AppDashed>
  );
}

function Field({ label, hint, children, span = 1 }: { label: string; hint?: string; children: React.ReactNode; span?: number }) {
  return (
    <div className={`space-y-1.5 ${span === 2 ? "col-span-2" : span === 3 ? "col-span-3" : ""}`}>
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

export default function LicenseForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  usePageTitle(isEditing ? "Chỉnh sửa License" : "Tạo License Key");
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [generatedKey, setGeneratedKey] = useState("");

  useEffect(() => {
    (api.api.admin.licenses as any).products.get().then(({ data }: any) => {
      if (data?.success) setProducts(data.products || []);
    });
    (api.api.admin.licenses as any).users.get().then(({ data }: any) => {
      if (data?.success) setUsers(data.users || []);
    });

    if (id) {
      setLoading(true);
      (api.api.admin.licenses as any)({ id }).get().then(({ data }: any) => {
        if (data?.success && data.license) {
          const l = data.license;
          setGeneratedKey(l.key);
          setForm({
            productId: l.productId || "",
            productName: l.productName || "",
            userId: l.userId || "",
            status: l.status || "unused",
            maxActivations: String(l.maxActivations || 1),
            notes: l.notes || "",
            domain: l.domain || "",
          });
        }
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setForm((f) => ({ ...f, productId, productName: product?.name || f.productName }));
  };

  const handleSubmit = async () => {
    if (!form.productName) return toast.error("Vui lòng chọn sản phẩm");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        productId: form.productId || undefined,
        userId: form.userId || undefined,
        maxActivations: parseInt(form.maxActivations) || 1,
      };
      if (isEditing && id) {
        const { data } = await (api.api.admin.licenses as any)({ id }).patch(payload);
        if (data?.success) { toast.success("Cập nhật thành công"); navigate("/admin/licenses"); }
        else toast.error(data?.error || "Thất bại");
      } else {
        const { data } = await (api.api.admin.licenses as any).post(payload);
        if (data?.success) {
          setGeneratedKey(data.license.key);
          toast.success("Tạo license thành công");
          navigate("/admin/licenses");
        } else toast.error(data?.error || "Thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setSubmitting(false);
    }
  };

  const copyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      toast.success("Đã copy license key");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full">
        <AppDashed noTopBorder padding="p-0">
          <div className="flex items-center justify-center py-20">
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground" />
          </div>
        </AppDashed>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate("/admin/licenses")}>
              <Icon icon="solar:arrow-left-bold" className="text-sm" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-title">{isEditing ? "Chỉnh sửa License" : "Tạo License Key"}</h1>
              <p className="text-xs text-muted-foreground">License key sẽ được tự động tạo khi lưu</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/admin/licenses")}>
              Hủy
            </Button>
            <Button size="sm" className="text-xs gap-1.5" disabled={submitting} onClick={handleSubmit}>
              <Icon icon="solar:check-circle-bold-duotone" className="text-sm" />
              {submitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo License"}
            </Button>
          </div>
        </div>
      </AppDashed>

      {isEditing && generatedKey && (
        <AppDashed noTopBorder padding="p-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <Icon icon="solar:key-bold-duotone" className="text-xl text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-muted-foreground block">License Key</span>
              <span className="text-sm font-mono font-semibold text-foreground">{generatedKey}</span>
            </div>
            <Button variant="outline" size="sm" className="text-xs gap-1.5 shrink-0" onClick={copyKey}>
              <Icon icon="solar:copy-bold-duotone" className="text-sm" />
              Copy
            </Button>
          </div>
        </AppDashed>
      )}

      <Section title="Sản phẩm" icon="solar:box-bold-duotone" description="Chọn sản phẩm để cấp license key">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Sản phẩm *" hint="Chọn sản phẩm từ danh sách đã có">
            <Select value={form.productId} onValueChange={handleProductChange}>
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Chọn sản phẩm..." />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tên sản phẩm" hint="Tự động điền khi chọn, có thể sửa">
            <Input className="text-sm" placeholder="Tên sản phẩm" value={form.productName} onChange={(e) => set("productName", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Người dùng" icon="solar:user-bold-duotone" description="Gán license cho người dùng (bỏ trống nếu chưa cần)">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Người dùng" hint="Chọn user để gán license">
            <Select value={form.userId} onValueChange={(v) => set("userId", v)}>
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Chưa gán..." />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                <SelectItem value="none">Không gán</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.displayName || u.email} {u.displayName ? `(${u.email})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Trạng thái">
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unused">Chưa dùng</SelectItem>
                <SelectItem value="active">Đang dùng</SelectItem>
                <SelectItem value="expired">Hết hạn</SelectItem>
                <SelectItem value="revoked">Đã thu hồi</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Cài đặt" icon="solar:settings-bold-duotone" description="Giới hạn kích hoạt">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Max kích hoạt" hint="Số lần tối đa có thể kích hoạt">
            <Input className="text-sm" type="number" placeholder="1" min="1" value={form.maxActivations} onChange={(e) => set("maxActivations", e.target.value)} />
          </Field>
          <Field label="Domain" hint="Domain được phép sử dụng license">
            <Input className="text-sm" placeholder="example.com" value={form.domain} onChange={(e) => set("domain", e.target.value)} />
          </Field>
          <Field label="Ghi chú" span={2} hint="Ghi chú nội bộ cho admin">
            <Textarea className="text-sm min-h-[60px] resize-y" placeholder="Ghi chú về license này..." value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>
        </div>
      </Section>

      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/admin/licenses")}>
            Hủy bỏ
          </Button>
          <Button size="sm" className="text-xs gap-1.5" disabled={submitting} onClick={handleSubmit}>
            <Icon icon="solar:check-circle-bold-duotone" className="text-sm" />
            {submitting ? "Đang lưu..." : isEditing ? "Cập nhật license" : "Tạo license"}
          </Button>
        </div>
      </AppDashed>
    </div>
  );
}
