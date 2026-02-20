import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { usePageTitle } from '@/hooks/use-page-title';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  icon: string | null;
  thumbnail: string | null;
  price: string;
  minPrice: string | null;
  maxPrice: string | null;
  currency: string;
  priceUnit: string | null;
  features: string[];
  estimatedDays: number | null;
  isFeatured: boolean;
}

function formatPrice(price: string, currency: string) {
  const num = Number(price);
  if (!num) return "Liên hệ";
  return num.toLocaleString("vi-VN") + " " + currency;
}

const gradients = [
  "from-blue-500/10 to-cyan-500/10",
  "from-violet-500/10 to-purple-500/10",
  "from-amber-500/10 to-orange-500/10",
  "from-emerald-500/10 to-teal-500/10",
  "from-rose-500/10 to-pink-500/10",
  "from-indigo-500/10 to-blue-500/10",
];

const iconColors = [
  "text-blue-500",
  "text-violet-500",
  "text-amber-500",
  "text-emerald-500",
  "text-rose-500",
  "text-indigo-500",
];

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const gradient = gradients[index % gradients.length];
  const iconColor = iconColors[index % iconColors.length];

  return (
    <Link to={`/services/${service.slug}`} className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all duration-300">
      {service.isFeatured && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-semibold">
            <Icon icon="solar:star-bold" className="text-[10px]" />
            Nổi bật
          </div>
        </div>
      )}

      <div className={cn("bg-gradient-to-br px-6 pt-6 pb-5", gradient)}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm shrink-0">
            <Icon icon={service.icon || "solar:widget-5-bold-duotone"} className={cn("text-2xl", iconColor)} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-title leading-snug">{service.name}</h3>
            {service.tagline && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.tagline}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pt-4 pb-3 flex-1">
        {service.features && service.features.length > 0 && (
          <ul className="space-y-2">
            {service.features.slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon icon="solar:check-read-bold" className="text-emerald-500 text-[9px]" />
                </div>
                <span className="leading-relaxed">{f}</span>
              </li>
            ))}
            {service.features.length > 4 && (
              <li className="text-[11px] text-muted-foreground/50 pl-[26px]">+{service.features.length - 4} tính năng khác</li>
            )}
          </ul>
        )}
      </div>

      <div className="border-t border-border px-6 py-3.5 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-title">
            {service.minPrice && service.maxPrice ? (
              <>{formatPrice(service.minPrice, service.currency)} – {formatPrice(service.maxPrice, service.currency)}</>
            ) : service.minPrice ? (
              <>Từ {formatPrice(service.minPrice, service.currency)}</>
            ) : (
              formatPrice(service.price, service.currency)
            )}
          </div>
          {service.priceUnit && <span className="text-[10px] text-muted-foreground">{service.priceUnit}</span>}
        </div>
        <div className="flex items-center gap-3">
          {service.estimatedDays && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Icon icon="solar:clock-circle-bold-duotone" className="text-xs" />
              ~{service.estimatedDays} ngày
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="font-medium">Chi tiết</span>
            <Icon icon="solar:arrow-right-linear" className="text-sm" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ServiceList() {
  usePageTitle("Dịch vụ");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (api.api.app.services as any).get().then(({ data }: any) => {
      if (data?.success) setServices(data.services || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-8">
        <div className="flex flex-col items-center gap-2 max-w-lg mx-auto">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 mb-1">
            <Icon icon="solar:widget-5-bold-duotone" className="text-3xl text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-title">Dịch vụ</h1>
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            Giải pháp chuyên nghiệp, thiết kế riêng cho nhu cầu của bạn
          </p>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground" />
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="p-4 rounded-2xl bg-muted/30">
              <Icon icon="solar:widget-5-bold-duotone" className="text-4xl text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground">Chưa có dịch vụ nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {services.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        )}
      </AppDashed>
    </div>
  );
}
