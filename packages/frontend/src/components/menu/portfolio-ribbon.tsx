import { format, type PortfolioKpis } from '@/data/menu';

/** Menu-wide KPIs across all smoothies, trailing twelve months. */
export function PortfolioRibbon({ kpis, count }: { kpis: PortfolioKpis; count: number }) {
  const items = [
    { label: 'Revenue · TTM', value: format.money(kpis.revenueUsd) },
    { label: 'Units poured', value: format.count(kpis.unitsSold) },
    { label: 'Guest rating', value: `${format.rating(kpis.avgRating)} ★`, hint: `${format.count(kpis.reviewCount)} reviews` },
    { label: 'Gross margin', value: format.pct(kpis.grossMarginPct) },
    { label: 'Repeat rate', value: format.pct(kpis.repeatRatePct) },
    { label: 'Top seller', value: kpis.topSeller?.name ?? '—', wide: true },
  ];

  return (
    <section
      aria-label={`Menu performance across ${count} smoothies`}
      className="pointer-events-auto mx-auto flex min-w-0 max-w-full snap-x overflow-x-auto rounded-full border border-primary/25 bg-card/60 px-300 py-200 shadow-2xl backdrop-blur-xl [scrollbar-width:none]"
    >
      <dl className="flex items-stretch divide-x divide-primary/20">
        {items.map((item) => (
          <div key={item.label} className="flex shrink-0 snap-start flex-col justify-center gap-100 px-500 py-100">
            <dt className="text-100 leading-100 tracking-widest whitespace-nowrap text-muted-foreground uppercase">
              {item.label}
            </dt>
            <dd
              className={
                item.wide
                  ? 'font-heading text-400 leading-400 whitespace-nowrap text-primary italic'
                  : 'font-numeric text-500 leading-500 font-medium whitespace-nowrap text-foreground tabular-nums'
              }
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
