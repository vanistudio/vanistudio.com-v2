import { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Icon } from '@iconify/react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { usePageTitle } from '@/hooks/use-page-title';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';

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

function ServiceCard({ service }: { service: Service }) {
  return (
    <Link to={`/services/${service.slug}`} className="flex flex-col gap-2 cursor-pointer group w-full p-3">
      <div className="p-[4px] rounded-[10px] border border-border">
        <div className="relative w-full bg-muted-background rounded-[6px] border border-border h-[180px] overflow-hidden select-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon icon={service.icon || "solar:widget-5-bold-duotone"} className="text-2xl text-primary" />
            </div>
            {service.features && service.features.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center px-4">
                {service.features.slice(0, 3).map((f, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{f}</span>
                ))}
              </div>
            )}
          </div>
          {service.isFeatured && (
            <div className="absolute top-2 left-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/15 text-amber-500">
                Nổi bật
              </span>
            </div>
          )}
          {service.estimatedDays && (
            <div className="absolute top-2 right-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border bg-background/80 text-muted-foreground">
                ~{service.estimatedDays} ngày
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="px-1 flex flex-col gap-1">
        <h3 className="text-sm font-bold text-title truncate">{service.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{service.tagline || service.description}</p>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1 select-none">
            <span className="text-xs text-muted-foreground transition-colors duration-300 group-hover:text-title">Xem chi tiết</span>
            <ArrowUpRight size={12} className="text-muted-foreground transition-all duration-300 group-hover:rotate-45 group-hover:text-title" />
          </div>
          <span className="text-xs font-semibold text-primary">
            {service.minPrice && service.maxPrice ? (
              <>{formatPrice(service.minPrice, service.currency)} – {formatPrice(service.maxPrice, service.currency)}</>
            ) : service.minPrice ? (
              <>Từ {formatPrice(service.minPrice, service.currency)}</>
            ) : (
              formatPrice(service.price, service.currency)
            )}
          </span>
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
      <AppDashed noTopBorder padding="p-5">
        <div className="flex flex-col items-center gap-1.5">
          <div className="p-3 rounded-xl bg-primary/10 mb-1">
            <Icon icon="solar:widget-5-bold-duotone" className="text-3xl text-primary" />
          </div>
          <h1 className="text-xl font-bold text-title">Dịch vụ</h1>
          <p className="text-sm text-muted-foreground text-center max-w-lg">
            Các dịch vụ chuyên nghiệp mà chúng tôi cung cấp
          </p>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground" />
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Icon icon="solar:widget-5-bold-duotone" className="text-5xl text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">Chưa có dịch vụ nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </AppDashed>
    </div>
  );
}
