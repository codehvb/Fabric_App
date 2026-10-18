import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface KpiTileProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}

/** A single figure with its label, styled like an engraved plaque. */
export function KpiTile({ label, value, hint, className }: KpiTileProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col gap-100 border-t border-primary/40 pt-300',
        className
      )}
    >
      <dt className="text-100 leading-100 font-medium tracking-widest text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="font-heading text-hero-700 leading-hero-700 text-foreground tabular-nums">
        {value}
      </dd>
      {hint && <dd className="text-200 leading-200 text-muted-foreground">{hint}</dd>}
    </div>
  );
}

/** A compact figure for dense rows such as the carousel caption. */
export function KpiInline({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-100 px-300">
      <span className="font-numeric text-400 leading-400 font-medium text-foreground tabular-nums">
        {value}
      </span>
      <span className="text-100 leading-100 tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  );
}
