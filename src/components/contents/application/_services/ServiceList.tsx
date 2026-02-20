import { useState, useEffect } from 'react';
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
    <Link to={`/services/${service.slug}`} className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      {service.isFeatured && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-medium">
            <Icon icon="solar:star-bold" className="text-xs" />
            Nổi bật
          </div>
        </div>
      )}
      <div className="flex flex-col items-center gap-3 p-6 pb-4">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon icon={service.icon || "solar:widget-5-bold-duotone"} className="text-2xl text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-bold text-title">{service.name}</h3>
          {service.tagline && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.tagline}</p>
          )}
        </div>
      </div>

      <div className="px-6 pb-4 flex-1">
        {service.features && service.features.length > 0 && (
          <ul className="space-y-1.5">
            {service.features.slice(0, 5).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <Icon icon="solar:check-circle-bold" className="text-emerald-500 text-sm shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
            {service.features.length > 5 && (
              <li className="text-[10px] text-muted-foreground/60 pl-5">+{service.features.length - 5} tính năng khác</li>
            )}
          </ul>
        )}
      </div>

      <div className="border-t border-border px-6 py-4 flex items-center justify-between bg-muted/10">
        <div>
          <div className="text-sm font-bold text-title">
            {service.minPrice && service.maxPrice ? (
              <>{formatPrice(service.minPrice, service.currency)} - {formatPrice(service.maxPrice, service.currency)}</>
            ) : service.minPrice ? (
              <>Từ {formatPrice(service.minPrice, service.currency)}</>
            ) : (
              formatPrice(service.price, service.currency)
            )}
          </div>
          {service.priceUnit && <span className="text-[10px] text-muted-foreground">{service.priceUnit}</span>}
        </div>
        {service.estimatedDays && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Icon icon="solar:clock-circle-bold-duotone" className="text-xs" />
            ~{service.estimatedDays} ngày
          </div>
        )}
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

      <AppDashed noTopBorder padding="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground" />
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Icon icon="solar:widget-5-bold-duotone" className="text-4xl text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Chưa có dịch vụ nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </AppDashed>
    </div>
  );
}
