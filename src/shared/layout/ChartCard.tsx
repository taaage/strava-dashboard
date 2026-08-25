import { ReactNode, useState } from "react";
import { TimeRangeSelector } from "../TimeRangeSelector";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  height?: string;
  timeRange?: {
    selected: number;
    onChange: (days: number) => void;
  };
}

export function ChartCard({ title, subtitle, children, height = "h-56", timeRange }: ChartCardProps) {
  return (
    <div className="bg-surface-card rounded-3xl p-8 border border-surface-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">{title}</h2>
          {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
        </div>
        {timeRange && <TimeRangeSelector selected={timeRange.selected} onChange={timeRange.onChange} />}
      </div>
      <div className={height}>{children}</div>
    </div>
  );
}

export function useTimeRange(initial = 90) {
  const [days, setDays] = useState(initial);
  return { selected: days, onChange: setDays, days };
}
