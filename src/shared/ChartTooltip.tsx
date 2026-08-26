interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  render: (data: any) => React.ReactNode;
}

export function ChartTooltip({ active, payload, render }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
      {render(data)}
    </div>
  );
}
