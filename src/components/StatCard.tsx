interface StatCardProps {
  title: string;
  value: string;
  comparison?: {
    value: number;
    unit: string;
    isPercentage?: boolean;
  };
}

export function StatCard({ title, value, comparison }: StatCardProps) {
  return (
    <div className="bg-surface-card rounded-3xl p-6 border border-surface-border">
      <p className="text-sm font-medium text-text-muted mb-2">{title}</p>
      <p className="text-2xl font-semibold text-text-primary">{value}</p>
      {comparison && (
        <p className={`text-xs mt-2 font-medium ${comparison.value >= 0 ? "text-green-400" : "text-red-400"}`}>
          {comparison.value >= 0 ? "↑" : "↓"} {Math.abs(comparison.value)}{comparison.isPercentage ? "%" : ` ${comparison.unit}`} vs last year
        </p>
      )}
    </div>
  );
}
