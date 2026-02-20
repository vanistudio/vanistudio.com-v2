import { Icon } from "@iconify/react";
import AppDashed from "@/components/layouts/application/AppDashed";

interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  bgColor?: string;
  textColor?: string;
}

interface AdminStatsProps {
  items: StatItem[];
}

export default function AdminStats({ items }: AdminStatsProps) {
  return (
    <AppDashed noTopBorder padding="p-0">
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
        {items.map((item, i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.bgColor ?? "bg-primary/10"}`}>
              <Icon icon={item.icon} className={`text-lg ${item.textColor ?? "text-primary"}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-title leading-tight">{item.value}</p>
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </AppDashed>
  );
}
