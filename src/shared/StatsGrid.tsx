import { ReactNode } from "react";

interface StatsGridProps {
  cols?: 2 | 3 | 4;
  children: ReactNode;
}

export function StatsGrid({ cols = 4, children }: StatsGridProps) {
  const colClass = cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-3" : "grid-cols-2 lg:grid-cols-4";
  return <div className={`grid ${colClass} gap-3`}>{children}</div>;
}
