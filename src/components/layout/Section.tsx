import { ReactNode } from "react";

interface SectionProps {
  title?: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-8">
      {title && (
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 px-1">
          {title}
        </p>
      )}
      {children}
    </section>
  );
}
