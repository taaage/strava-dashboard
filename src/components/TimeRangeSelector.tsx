export const TIME_RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "6m", days: 180 },
  { label: "1y", days: 365 },
];

interface TimeRangeSelectorProps {
  selected: number;
  onChange: (days: number) => void;
}

export function TimeRangeSelector({ selected, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-1">
      {TIME_RANGES.map(({ label, days }) => (
        <button
          key={days}
          onClick={() => onChange(days)}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
            selected === days
              ? "bg-surface-muted text-text-primary"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
