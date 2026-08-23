interface CardPlaceholderProps {
  height?: string;
  className?: string;
}

export function CardPlaceholder({ height = "h-72", className = "" }: CardPlaceholderProps) {
  return (
    <div className={`bg-surface-card rounded-3xl p-8 border border-surface-border ${height} ${className}`} />
  );
}
