import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
}

export default function KPICard({ title, value, icon: Icon, change }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-[var(--color-border)] hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-[var(--color-secondary)]">{value}</p>
          {change && (
            <p className="text-sm mt-2 text-blue-600">{change}</p>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-50">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
}
