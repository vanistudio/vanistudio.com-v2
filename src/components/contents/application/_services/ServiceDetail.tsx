import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { usePageTitle } from '@/hooks/use-page-title';
import { api } from '@/lib/api';

interface Service {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  content: string | null;
  icon: string | null;
  thumbnail: string | null;
  coverImage: string | null;
  price: string;
  minPrice: string | null;
  maxPrice: string | null;
  currency: string;
  priceUnit: string | null;
  features: string[];
  deliverables: string[];
  estimatedDays: number | null;
  isFeatured: boolean;
}

function formatPrice(price: string, currency: string) {
  const num = Number(price);
  if (!num) return "Liên hệ";
  return num.toLocaleString("vi-VN") + " " + currency;
}

export default function ServiceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  usePageTitle(service?.name || "Dịch vụ");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    (api.api.app.services as any)[slug].get()
      .then(({ data }: any) => {
        if (data?.success) setService(data.service);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

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

  if (!service) {
    return (
      <div className="flex flex-col w-full">
        <AppDashed noTopBorder padding="p-0">
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Icon icon="solar:widget-5-bold-duotone" className="text-5xl text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">Không tìm thấy dịch vụ</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/services')}>
              <Icon icon="solar:arrow-left-bold" className="text-sm mr-1.5" />
              Quay lại
            </Button>
          </div>
        </AppDashed>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => navigate('/services')}>
            <Icon icon="solar:arrow-left-bold" className="text-sm" />
          </Button>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon={service.icon || "solar:widget-5-bold-duotone"} className="text-xl text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-title truncate">{service.name}</h1>
              {service.tagline && (
                <p className="text-xs text-muted-foreground truncate">{service.tagline}</p>
              )}
            </div>
          </div>
          {service.isFeatured && (
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] shrink-0">
              <Icon icon="solar:star-bold" className="text-xs mr-1" />
              Nổi bật
            </Badge>
          )}
        </div>
      </AppDashed>

      {(service.coverImage || service.thumbnail) && (
        <AppDashed noTopBorder padding="p-0">
          <div className="w-full h-[250px] overflow-hidden">
            <img
              src={service.coverImage || service.thumbnail || ''}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          </div>
        </AppDashed>
      )}

      <AppDashed noTopBorder padding="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-4">
            {service.features && service.features.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tính năng</h3>
                <ul className="space-y-1.5">
                  {service.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Icon icon="solar:check-circle-bold" className="text-emerald-500 text-sm shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {service.deliverables && service.deliverables.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Bàn giao</h3>
                <ul className="space-y-1.5">
                  {service.deliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Icon icon="solar:box-bold-duotone" className="text-primary text-sm shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="sm:w-[220px] shrink-0">
            <div className="rounded-xl border border-border p-4 flex flex-col gap-3 bg-muted/10">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Giá dịch vụ</p>
                <p className="text-lg font-bold text-title">
                  {service.minPrice && service.maxPrice ? (
                    <>{formatPrice(service.minPrice, service.currency)} - {formatPrice(service.maxPrice, service.currency)}</>
                  ) : service.minPrice ? (
                    <>Từ {formatPrice(service.minPrice, service.currency)}</>
                  ) : (
                    formatPrice(service.price, service.currency)
                  )}
                </p>
                {service.priceUnit && <p className="text-[10px] text-muted-foreground">{service.priceUnit}</p>}
              </div>
              {service.estimatedDays && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Thời gian dự kiến</p>
                  <div className="flex items-center gap-1.5">
                    <Icon icon="solar:clock-circle-bold-duotone" className="text-sm text-primary" />
                    <span className="text-sm font-medium text-title">~{service.estimatedDays} ngày</span>
                  </div>
                </div>
              )}
              <Link
                to="/contact"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Icon icon="solar:chat-round-dots-bold-duotone" className="text-sm" />
                Liên hệ ngay
              </Link>
            </div>
          </div>
        </div>
      </AppDashed>

      {service.content && (
        <AppDashed noTopBorder padding="p-4">
          <article
            className="prose dark:prose-invert prose-sm max-w-none text-foreground/90"
            dangerouslySetInnerHTML={{ __html: service.content }}
          />
        </AppDashed>
      )}

      <AppDashed noTopBorder withDotGrid padding="p-6">
        <div className="flex items-center justify-center">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/services')}>
            <Icon icon="solar:arrow-left-bold" className="text-sm mr-1.5" />
            Quay lại danh sách
          </Button>
        </div>
      </AppDashed>
    </div>
  );
}
