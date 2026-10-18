import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Crown, X } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

import { KpiTile } from '@/components/menu/kpi';
import { format, type Smoothie } from '@/data/menu';
import { useMonthly } from '@/hooks/use-menu';

const MonthlyCharts = lazy(() => import('@/components/menu/monthly-charts'));

// Daily reference amounts used for the nutrition bars.
const DAILY = { calories: 2000, proteinG: 50, sugarG: 50, fiberG: 28 };

interface SmoothiePanelProps {
  smoothie: Smoothie | null;
  total: number;
  onClose: () => void;
  onStep: (direction: -1 | 1) => void;
}

export function SmoothiePanel({ smoothie, total, onClose, onStep }: SmoothiePanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOpen = smoothie !== null;

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {smoothie && (
        <motion.aside
          key="smoothie-panel"
          role="dialog"
          aria-labelledby="smoothie-panel-title"
          initial={{ x: '100%', opacity: 0.6 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0.6 }}
          transition={{ type: 'spring', stiffness: 240, damping: 32 }}
          style={{ '--smoothie': smoothie.colors.base } as CSSProperties}
          className="absolute inset-y-0 right-0 z-30 flex w-full flex-col border-l border-primary/25 bg-card/95 text-card-foreground shadow-2xl backdrop-blur-xl lg:max-w-2xl"
        >
          <div className="flex items-center justify-between gap-300 border-b border-border px-600 py-400">
            <p className="text-200 font-medium tracking-widest text-muted-foreground uppercase">
              N° {String(smoothie.displayOrder).padStart(2, '0')} / {String(total).padStart(2, '0')}
              {' · '}
              {smoothie.category}
            </p>
            <div className="flex items-center gap-100">
              <IconButton label="Previous smoothie" onClick={() => onStep(-1)}>
                <ChevronLeft className="icon-size-300" />
              </IconButton>
              <IconButton label="Next smoothie" onClick={() => onStep(1)}>
                <ChevronRight className="icon-size-300" />
              </IconButton>
              <IconButton ref={closeRef} label="Close details" onClick={onClose}>
                <X className="icon-size-300" />
              </IconButton>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <motion.div
              key={smoothie.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex flex-col gap-800 px-600 pt-600 pb-800"
            >
              <Hero smoothie={smoothie} total={total} />
              <Performance smoothie={smoothie} />
              <Trends smoothie={smoothie} />
              <Nutrition smoothie={smoothie} />

              <Section title="The blend">
                <p className="text-300 leading-300 text-muted-foreground">{smoothie.description}</p>
                <ul className="mt-400 flex flex-wrap gap-200" aria-label="Ingredients">
                  {smoothie.ingredients.split(',').map((ingredient) => (
                    <li
                      key={ingredient}
                      className="rounded-full border border-primary/30 px-300 py-100 text-200 text-foreground"
                    >
                      {ingredient.trim()}
                    </li>
                  ))}
                </ul>
              </Section>

              <p className="text-200 text-muted-foreground">
                Sample data, stored in Fabric · Updated{' '}
                {smoothie.updatedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </motion.div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Hero({ smoothie, total }: { smoothie: Smoothie; total: number }) {
  return (
    <div className="relative grid gap-600 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:items-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-600 -z-10 bg-[radial-gradient(ellipse_at_25%_40%,color-mix(in_srgb,var(--smoothie)_40%,transparent),transparent_65%)]"
      />
      <img
        src={smoothie.art}
        alt={`Illustration of ${smoothie.name}`}
        className="aspect-[800/1040] w-full max-w-[calc(var(--spacing-800)*9)] justify-self-center rounded-3xl shadow-2xl ring-1 ring-primary/30"
      />
      <div className="flex flex-col gap-300">
        {smoothie.revenueRank <= 3 && (
          <span className="inline-flex w-fit items-center gap-200 rounded-full border border-primary/40 bg-primary/10 px-300 py-100 text-200 font-medium tracking-wider text-primary uppercase">
            <Crown className="icon-size-100" aria-hidden />
            {smoothie.revenueRank === 1 ? 'Best seller' : `No. ${smoothie.revenueRank} by revenue`}
          </span>
        )}
        <h2 id="smoothie-panel-title" className="font-heading text-hero-900 leading-hero-900 font-medium">
          {smoothie.name}
        </h2>
        <p className="font-heading text-500 leading-500 text-muted-foreground italic">{smoothie.tagline}</p>
        <div className="flex items-baseline gap-400 pt-200">
          <span className="font-numeric text-hero-700 leading-hero-700 text-primary">
            {format.price(smoothie.priceUsd)}
          </span>
          <span className="text-300 text-muted-foreground">
            {smoothie.sizeMl} ml · ranked {smoothie.revenueRank} of {total} by revenue
          </span>
        </div>
      </div>
    </div>
  );
}

function Performance({ smoothie }: { smoothie: Smoothie }) {
  return (
    <Section title="Performance · trailing twelve months">
      <dl className="grid grid-cols-2 gap-x-600 gap-y-600 sm:grid-cols-4">
        <KpiTile label="Revenue" value={format.money(smoothie.revenueUsd)} hint={format.price(smoothie.revenueUsd)} />
        <KpiTile label="Units sold" value={format.count(smoothie.unitsSold)} hint={`${format.int(smoothie.unitsSold / 12)} a month`} />
        <KpiTile label="Gross margin" value={format.pct(smoothie.grossMarginPct)} hint={format.money((smoothie.revenueUsd * smoothie.grossMarginPct) / 100) + ' profit'} />
        <KpiTile label="Guest rating" value={`${format.rating(smoothie.avgRating)} ★`} hint={`${format.int(smoothie.reviewCount)} reviews`} />
        <KpiTile label="Repeat rate" value={format.pct(smoothie.repeatRatePct)} hint="Guests who reorder" />
        <KpiTile label="Boutiques" value={smoothie.storesStocking} hint="Stocking this blend" />
        <KpiTile label="Per boutique" value={format.money(smoothie.revenueUsd / Math.max(1, smoothie.storesStocking))} hint="Revenue per store" />
        <KpiTile label="Prep time" value={`${smoothie.prepTimeSec}s`} hint="Average to pour" />
      </dl>
    </Section>
  );
}

function Trends({ smoothie }: { smoothie: Smoothie }) {
  const monthly = useMonthly(smoothie.id);
  return (
    <Section title="Monthly trend">
      {monthly.status === 'error' ? (
        <p role="alert" className="rounded-2xl border border-destructive/40 p-400 text-300 text-foreground">
          {monthly.message}
        </p>
      ) : monthly.status === 'loading' ? (
        <ChartSkeleton />
      ) : monthly.data.length === 0 ? (
        <p className="rounded-2xl border border-border p-600 text-center text-300 text-muted-foreground">
          No monthly history has been recorded for this smoothie yet.
        </p>
      ) : (
        <Suspense fallback={<ChartSkeleton />}>
          <MonthlyCharts points={monthly.data} />
        </Suspense>
      )}
    </Section>
  );
}

function ChartSkeleton() {
  return (
    <div role="status" aria-label="Loading monthly trend" className="grid gap-500">
      {[0, 1].map((i) => (
        <div key={i} className="h-[calc(var(--spacing-800)*7)] animate-pulse rounded-3xl bg-muted" />
      ))}
    </div>
  );
}

function Nutrition({ smoothie }: { smoothie: Smoothie }) {
  const rows = [
    { label: 'Calories', value: `${smoothie.calories} kcal`, share: smoothie.calories / DAILY.calories },
    { label: 'Protein', value: format.grams(smoothie.proteinG), share: smoothie.proteinG / DAILY.proteinG },
    { label: 'Sugars', value: format.grams(smoothie.sugarG), share: smoothie.sugarG / DAILY.sugarG },
    { label: 'Fibre', value: format.grams(smoothie.fiberG), share: smoothie.fiberG / DAILY.fiberG },
  ];
  return (
    <Section title={`Nutrition · per ${smoothie.sizeMl} ml`}>
      <dl className="grid gap-400 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-200">
            <div className="flex items-baseline justify-between">
              <dt className="text-300 text-muted-foreground">{row.label}</dt>
              <dd className="font-numeric text-400 text-foreground tabular-nums">
                {row.value}
                <span className="ml-200 text-200 text-muted-foreground">{Math.round(row.share * 100)}% DV</span>
              </dd>
            </div>
            <div className="h-100 overflow-hidden rounded-full bg-muted" aria-hidden>
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, row.share * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </dl>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-400">
      <h3 className="flex items-center gap-300 font-heading text-500 leading-500 font-medium italic">
        {title}
        <span className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" aria-hidden />
      </h3>
      {children}
    </section>
  );
}

function IconButton({
  label,
  onClick,
  children,
  ref,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-full p-200 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {children}
    </button>
  );
}
