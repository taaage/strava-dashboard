import zwiftLogo from "../../assets/zwift.svg";

export type ActivityFilter = "all" | "outdoor" | "indoor" | "races";

interface ActivityFiltersProps {
  filter: ActivityFilter;
  onFilterChange: (f: ActivityFilter) => void;
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onClear: () => void;
  hasFilters: boolean;
}

const FILTERS: { key: ActivityFilter; label: string; icon?: string; logo?: boolean }[] = [
  { key: "outdoor", label: "Outdoor", icon: "🛣️" },
  { key: "indoor", label: "Indoor", logo: true },
  { key: "races", label: "Races", icon: "🏁" },
];

export function ActivityFilters({ filter, onFilterChange, from, to, onFromChange, onToChange, onClear, hasFilters }: ActivityFiltersProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {FILTERS.map(({ key, label, icon, logo }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${filter === key ? "bg-surface-muted text-text-primary" : "text-text-muted hover:text-text-secondary"}`}
        >
          {icon && <span>{icon}</span>}
          {logo && <img src={zwiftLogo} alt="Zwift" className="w-4 h-4" />}
          {label}
        </button>
      ))}
      <input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className="bg-surface-muted border border-surface-border rounded-lg px-2 py-1.5 text-text-primary"
      />
      <span className="text-text-muted">–</span>
      <input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        className="bg-surface-muted border border-surface-border rounded-lg px-2 py-1.5 text-text-primary"
      />
      {hasFilters && (
        <button onClick={onClear} className="text-text-muted hover:text-text-primary px-2">
          ✕
        </button>
      )}
    </div>
  );
}
