import { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Icon } from '@iconify/react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link, useSearchParams } from 'react-router-dom';
import { usePageTitle } from '@/hooks/use-page-title';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  thumbnail: string | null;
  coverImage: string | null;
  type: string;
  price: string;
  salePrice: string | null;
  isFeatured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

const typeMap: Record<string, { label: string; color: string; dotColor: string }> = {
  free: { label: "Miễn phí", color: "text-emerald-500", dotColor: "bg-emerald-500" },
  premium: { label: "Premium", color: "text-amber-500", dotColor: "bg-amber-500" },
  enterprise: { label: "Enterprise", color: "text-purple-500", dotColor: "bg-purple-500" },
};

function ProductCard({ product }: { product: Product }) {
  const typeInfo = typeMap[product.type] || typeMap.premium;
  const hasDiscount = product.salePrice && Number(product.salePrice) < Number(product.price);

  return (
    <Link to={`/products/${product.slug}`} className="flex flex-col gap-2 cursor-pointer group w-full p-3">
      <div className="p-[4px] rounded-[10px] border border-border">
        <div className="relative w-full bg-muted-background rounded-[6px] border border-border h-[180px] overflow-hidden select-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="bg-background rounded-t-[6px] absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[75%] group-hover:h-[70%] transition-all duration-300 p-[2px] pb-0">
            <div className="w-full h-full rounded-t-[4px] overflow-hidden">
              {product.thumbnail ? (
                <img alt={product.name} loading="lazy" className="w-full h-full object-cover" src={product.thumbnail} />
              ) : product.coverImage ? (
                <img alt={product.name} loading="lazy" className="w-full h-full object-cover" src={product.coverImage} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/30">
                  <Icon icon="solar:box-bold-duotone" className="text-4xl text-muted-foreground/30" />
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-2 left-2">
            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", typeInfo.dotColor.replace('bg-', 'border-').replace('500', '500/30'), typeInfo.dotColor.replace('500', '500/15'), typeInfo.color)}>
              {typeInfo.label}
            </span>
          </div>
        </div>
      </div>
      <div className="px-1 flex flex-col gap-1">
        <h3 className="text-sm font-bold text-title truncate">{product.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{product.tagline || product.description}</p>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1 select-none">
            <span className="text-xs text-muted-foreground transition-colors duration-300 group-hover:text-title">Xem chi tiết</span>
            <ArrowUpRight size={12} className="text-muted-foreground transition-all duration-300 group-hover:rotate-45 group-hover:text-title" />
          </div>
          {product.type === "free" ? (
            <Badge variant="secondary" className="text-[10px] font-medium h-5">Miễn phí</Badge>
          ) : Number(product.price) > 0 && (
            <div className="flex items-center gap-1">
              {hasDiscount && (
                <span className="text-[10px] text-muted-foreground line-through">
                  {Number(product.price).toLocaleString("vi-VN")}đ
                </span>
              )}
              <span className="text-xs font-semibold text-primary">
                {Number(hasDiscount ? product.salePrice : product.price).toLocaleString("vi-VN")}đ
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ProductList() {
  usePageTitle("Sản phẩm");
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const activeCategory = searchParams.get("category") || "";

  useEffect(() => {
    (api.api.app.products.categories as any).get()
      .then(({ data }: any) => {
        if (data?.success) setCategories(data.categories || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const queryParams: Record<string, string> = { limit: '50' };
    if (activeCategory) queryParams.categoryId = activeCategory;

    (api.api.app.products as any).get({ query: queryParams })
      .then(({ data }: any) => {
        if (data?.success) setProducts(data.products || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === activeCategory) {
      searchParams.delete("category");
    } else {
      searchParams.set("category", categoryId);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-5">
        <div className="flex flex-col items-center gap-1.5">
          <h1 className="text-xl font-bold text-title">Sản phẩm</h1>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Khám phá các sản phẩm, công cụ và giải pháp phần mềm từ Vani Studio
          </p>
        </div>
      </AppDashed>

      {/* Category filter */}
      {categories.length > 0 && (
        <AppDashed noTopBorder padding="p-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleCategoryClick("")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                !activeCategory
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
              )}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {cat.icon && <Icon icon={cat.icon} className="text-sm" />}
                {cat.name}
              </button>
            ))}
          </div>
        </AppDashed>
      )}

      {/* Products grid */}
      <AppDashed noTopBorder padding="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Icon icon="solar:box-bold-duotone" className="text-5xl text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">
              {activeCategory ? "Không có sản phẩm trong danh mục này" : "Chưa có sản phẩm nào"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </AppDashed>
    </div>
  );
}
