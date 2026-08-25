import { useState } from "react";

interface LineToggleConfig {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
}

interface LineToggleProps {
  lines: LineToggleConfig[];
  visible: Record<string, boolean>;
  onToggle: (key: string) => void;
}

export function LineToggle({ lines, visible, onToggle }: LineToggleProps) {
  return (
    <div className="flex gap-2 text-xs">
      {lines.map(({ key, label, color, dashed }) => (
        <button
          key={key}
          onClick={() => onToggle(key)}
          className={`flex items-center gap-1.5 ${visible[key] ? "text-text-primary" : "text-text-muted line-through"}`}
        >
          <span
            className={`w-3 h-0.5 rounded inline-block ${dashed ? "border-t-2 border-dashed" : ""}`}
            style={dashed ? { borderColor: color } : { backgroundColor: color }}
          />
          {label}
        </button>
      ))}
    </div>
  );
}

export function useLineToggle(defaults: Record<string, boolean>) {
  const [visible, setVisible] = useState<Record<string, boolean>>(defaults);
  const toggle = (key: string) => setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  return { visible, toggle };
}
