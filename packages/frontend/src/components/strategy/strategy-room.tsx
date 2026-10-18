import { ArrowDownRight, ArrowUpRight, ExternalLink, FlaskConical, Lightbulb, Scale, Snowflake, TriangleAlert } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

import { CostChart, SeasonChart, SugarChart } from '@/components/strategy/strategy-charts';
import { format, type Smoothie } from '@/data/menu';
import { CHALLENGES, HEADLINE_FACTS, SOURCES, type Challenge, type LabId, type Source } from '@/data/innocent-research';
import {
  costShock,
  DAILY_FREE_SUGARS_G,
  DAILY_SMOOTHIE_ML,
  seasonality,
  sugarLab,
  tradeDownWatchlist,
} from '@/data/strategy';
import { usePortfolioMonthly } from '@/hooks/use-menu';
import { cn } from '@/lib/utils';

const SOURCE_LIST: Source[] = Object.values(SOURCES);
const sourceNumber = (id: string) => SOURCE_LIST.findIndex((s) => s.id === id) + 1;

const scrollToLab = (id: LabId) =>
  document.getElementById(`lab-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/** Research brief on Innocent Drinks, with labs that apply each fix to the sample menu. */
export default function StrategyRoom({ smoothies }: { smoothies: Smoothie[] }) {
  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="mx-auto flex max-w-6xl flex-col gap-800 px-600 pt-[calc(var(--spacing-800)*6)] pb-[calc(var(--spacing-800)*3)] sm:px-800 lg:pt-[calc(var(--spacing-800)*4)]">
        <Intro />
        <section aria-labelledby="challenges-title" className="flex flex-col gap-600">
          <SectionTitle id="challenges-title" eyebrow="Part one · The research">
            Six pressure points on Innocent
          </SectionTitle>
          <div className="grid gap-500 lg:grid-cols-2">
            {CHALLENGES.map((challenge, i) => (
              <ChallengeCard key={challenge.id} challenge={challenge} index={i + 1} />
            ))}
          </div>
        </section>

        <section aria-labelledby="labs-title" className="flex flex-col gap-600">
          <SectionTitle id="labs-title" eyebrow="Part two · The dashboard answer">
            Four tools, tested on our menu
          </SectionTitle>
          <p className="max-w-3xl text-300 leading-300 text-muted-foreground">
            Each tool turns one of the problems above into a decision you can model. They run on the Maison Nectar
            sample menu stored in Fabric, so the numbers are illustrative. The same tools would work on Innocent’s
            own product data.
          </p>
          <SugarLab smoothies={smoothies} />
          <CostLab smoothies={smoothies} />
          <SeasonLab smoothies={smoothies} />
          <TradeDownLab smoothies={smoothies} />
        </section>

        <Sources />
      </div>
    </div>
  );
}

function Intro() {
  return (
    <header className="flex flex-col gap-600">
      <div className="flex flex-col gap-300">
        <span className="text-200 tracking-widest text-primary uppercase">Strategy room · Research brief, October 2026</span>
        <h1 className="max-w-4xl font-heading text-hero-900 leading-hero-900 font-medium">
          Innocent Drinks: six pressure points, and a dashboard that answers them
        </h1>
        <p className="max-w-3xl font-heading text-500 leading-500 text-muted-foreground italic">
          Europe’s leading smoothie brand is back in profit, but sugar rules, fruit prices, own-label competition
          and trust in its green claims all threaten its growth.
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-500 lg:grid-cols-4">
        {HEADLINE_FACTS.map((fact) => (
          <div key={fact.label} className="flex flex-col gap-100 border-t border-primary/40 pt-300">
            <dd className="font-heading text-hero-800 leading-hero-800 text-foreground">{fact.value}</dd>
            <dt className="text-300 leading-300 text-muted-foreground">
              {fact.label} <SourceRef id={fact.source} />
            </dt>
          </div>
        ))}
      </dl>
      <p className="w-fit rounded-full border border-primary/30 px-400 py-100 text-200 text-muted-foreground">
        Facts about Innocent come from the public sources listed below. Simulations use Maison Nectar sample data.
      </p>
    </header>
  );
}

function SectionTitle({ id, eyebrow, children }: { id: string; eyebrow: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-100">
      <span className="text-200 tracking-widest text-primary uppercase">{eyebrow}</span>
      <h2 id={id} className="flex items-center gap-400 font-heading text-hero-800 leading-hero-800 font-medium">
        {children}
        <span className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" aria-hidden />
      </h2>
    </div>
  );
}

function SourceRef({ id }: { id: string }) {
  const source = SOURCES[id as keyof typeof SOURCES];
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      title={`${source.publisher}: ${source.title} (${source.date})`}
      className="align-super text-100 font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      [{sourceNumber(id)}]
    </a>
  );
}

function ChallengeCard({ challenge, index }: { challenge: Challenge; index: number }) {
  return (
    <article className="flex flex-col gap-400 rounded-3xl border border-border bg-card/70 p-600 backdrop-blur">
      <div className="flex items-center justify-between gap-300">
        <span className="font-numeric text-200 tracking-widest text-muted-foreground">0{index}</span>
        <span
          className={cn(
            'rounded-full px-300 py-100 text-100 font-medium tracking-widest uppercase',
            challenge.severity === 'High' ? 'bg-chart-alert/15 text-chart-alert' : 'bg-primary/10 text-primary'
          )}
        >
          {challenge.severity} risk
        </span>
      </div>
      <h3 className="font-heading text-hero-700 leading-hero-700 font-medium">{challenge.title}</h3>
      <p className="font-heading text-400 leading-400 text-muted-foreground italic">{challenge.summary}</p>

      <div className="flex flex-col gap-200">
        <h4 className="flex items-center gap-200 text-100 tracking-widest text-muted-foreground uppercase">
          <TriangleAlert className="icon-size-100" aria-hidden /> The evidence
        </h4>
        <ul className="flex flex-col gap-200">
          {challenge.evidence.map((item) => (
            <li key={item.text} className="text-300 leading-300 text-foreground">
              {item.text} <SourceRef id={item.source} />
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-200 rounded-2xl bg-primary/5 p-400">
        <h4 className="flex items-center gap-200 text-100 tracking-widest text-primary uppercase">
          <Lightbulb className="icon-size-100" aria-hidden /> How we’d solve it
        </h4>
        <ul className="flex list-disc flex-col gap-100 pl-500 marker:text-primary">
          {challenge.fixes.map((fix) => (
            <li key={fix} className="text-300 leading-300 text-foreground">
              {fix}
            </li>
          ))}
        </ul>
      </div>

      {challenge.lab && (
        <button
          type="button"
          onClick={() => scrollToLab(challenge.lab!.id)}
          className="mt-auto inline-flex w-fit items-center gap-200 text-300 font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {challenge.lab.label}
          <ArrowDownRight className="icon-size-200" aria-hidden />
        </button>
      )}
    </article>
  );
}

function Lab({
  id,
  icon,
  title,
  question,
  children,
}: {
  id: LabId;
  icon: ReactNode;
  title: string;
  question: string;
  children: ReactNode;
}) {
  return (
    <article id={`lab-${id}`} className="flex scroll-mt-[calc(var(--spacing-800)*4)] flex-col gap-600 rounded-3xl border border-primary/25 bg-card/70 p-600 backdrop-blur sm:p-800">
      <header className="flex flex-col gap-200">
        <span className="flex items-center gap-200 text-200 tracking-widest text-primary uppercase">
          {icon} {title}
        </span>
        <h3 className="font-heading text-hero-700 leading-hero-700 font-medium">{question}</h3>
      </header>
      {children}
    </article>
  );
}

function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: 'alert' | 'good' }) {
  return (
    <div className="flex flex-col gap-100 border-t border-primary/30 pt-300">
      <span className="text-100 tracking-widest text-muted-foreground uppercase">{label}</span>
      <span
        className={cn(
          'font-heading text-hero-700 leading-hero-700 tabular-nums',
          tone === 'alert' ? 'text-chart-alert' : tone === 'good' ? 'text-primary' : 'text-foreground'
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-200">
      <span className="flex items-baseline justify-between text-300 text-muted-foreground">
        {label}
        <span className="font-numeric text-400 font-medium text-foreground tabular-nums">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-primary"
      />
    </label>
  );
}

function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-200">
      <span className="text-300 text-muted-foreground">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-200">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={option.value === value}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-full border px-400 py-100 text-300 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              option.value === value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Insight({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-300 rounded-2xl border border-primary/20 bg-primary/5 p-400 text-300 leading-300 text-foreground">
      <Lightbulb className="mt-100 icon-size-200 shrink-0 text-primary" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

function SugarLab({ smoothies }: { smoothies: Smoothie[] }) {
  const [cut, setCut] = useState(0);
  const [serve, setServe] = useState<number | null>(null);
  const rows = useMemo(() => sugarLab(smoothies, cut, serve), [smoothies, cut, serve]);
  const over = rows.filter((r) => r.overDailyMax).length;
  const avgPct = rows.reduce((s, r) => s + r.pctOfDailyMax, 0) / Math.max(1, rows.length);
  const worst = [...rows].sort((a, b) => b.sugarPerServeG - a.sugarPerServeG)[0];

  return (
    <Lab
      id="sugar"
      icon={<FlaskConical className="icon-size-200" aria-hidden />}
      title="Sugar Lab · answers challenges 01 and 02"
      question="How many blends break the daily sugar limit in a single serve?"
    >
      <div className="grid gap-600 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-600">
          <Slider
            label="Reformulate: cut sugar by"
            value={cut}
            min={0}
            max={40}
            step={5}
            display={`${cut}%`}
            onChange={setCut}
          />
          <Segmented
            label="Serve size"
            value={serve ?? 0}
            onChange={(v) => setServe(v === 0 ? null : v)}
            options={[
              { value: 0, label: 'Full bottle' },
              { value: 250, label: '250ml “little”' },
              { value: DAILY_SMOOTHIE_ML, label: '150ml NHS portion' },
            ]}
          />
          <div className="grid grid-cols-2 gap-500">
            <Stat label="Blends over daily max" value={`${over} / ${rows.length}`} tone={over ? 'alert' : 'good'} />
            <Stat label="Average share of daily max" value={`${Math.round(avgPct)}%`} tone={avgPct > 100 ? 'alert' : undefined} />
          </div>
          {worst && (
            <Insight>
              Sweetest serve: <strong>{worst.smoothie.name}</strong> at {worst.sugarPerServeG.toFixed(1)}g, which is{' '}
              {Math.round(worst.pctOfDailyMax)}% of the NHS {DAILY_FREE_SUGARS_G}g daily maximum.
              Innocent cut Juicy Water sugar by a fifth in 2024 and its volumes grew 16.3% <SourceRef id="grocer2024Report" />.
            </Insight>
          )}
        </div>
        <SugarChart rows={rows} />
      </div>
    </Lab>
  );
}

const SHOCK_PRESETS = [
  { value: 25, label: '+25%' },
  { value: 50, label: '+50%' },
  { value: 112, label: '+112% (orange concentrate, 2024)' },
];

function CostLab({ smoothies }: { smoothies: Smoothie[] }) {
  const [inflation, setInflation] = useState(112);
  const [fruitShare, setFruitShare] = useState(45);
  const shock = useMemo(() => costShock(smoothies, inflation, fruitShare), [smoothies, inflation, fruitShare]);
  const hardest = [...shock.rows].sort((a, b) => a.marginAfter - b.marginAfter)[0];

  return (
    <Lab
      id="cost"
      icon={<TriangleAlert className="icon-size-200" aria-hidden />}
      title="Cost Shock Simulator · answers challenge 03"
      question="What does a fruit price spike do to our margins, and what price rise would offset it?"
    >
      <div className="grid gap-600 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-600">
          <Slider
            label="Fruit cost inflation"
            value={inflation}
            min={0}
            max={150}
            step={1}
            display={`+${inflation}%`}
            onChange={setInflation}
          />
          <Segmented label="Presets" value={inflation} onChange={setInflation} options={SHOCK_PRESETS} />
          <Slider
            label="Fruit share of cost of goods (assumption)"
            value={fruitShare}
            min={20}
            max={70}
            step={5}
            display={`${fruitShare}%`}
            onChange={setFruitShare}
          />
          <div className="grid grid-cols-2 gap-500">
            <Stat label="Menu gross margin" value={`${shock.marginBefore.toFixed(1)}% → ${shock.marginAfter.toFixed(1)}%`} tone="alert" />
            <Stat label="Gross profit at risk" value={format.money(shock.profitLost)} tone="alert" />
            <Stat label="Price rise to hold margin" value={`+${shock.avgPriceRisePct.toFixed(1)}%`} />
            <Stat label="Hardest hit" value={hardest?.smoothie.name ?? '—'} />
          </div>
          <Insight>
            Raising prices across the board risks pushing shoppers to own label (challenge 04). Use swappable fruit bases
            to protect the hardest-hit blends first, then plan price and pack changes product by product.
          </Insight>
        </div>
        <CostChart rows={shock.rows} />
      </div>
    </Lab>
  );
}

function SeasonLab({ smoothies }: { smoothies: Smoothie[] }) {
  const monthly = usePortfolioMonthly();
  const season = useMemo(
    () => (monthly.status === 'ready' ? seasonality(smoothies, monthly.data) : null),
    [monthly, smoothies]
  );

  return (
    <Lab
      id="season"
      icon={<Snowflake className="icon-size-200" aria-hidden />}
      title="Seasonality Planner · answers challenge 05"
      question="How uneven is demand through the year, and which blends fill the winter gap?"
    >
      {monthly.status === 'error' ? (
        <p role="alert" className="text-300 text-foreground">{monthly.message}</p>
      ) : !season ? (
        <div role="status" aria-label="Loading monthly revenue" className="h-[calc(var(--spacing-800)*9)] animate-pulse rounded-3xl bg-muted" />
      ) : (
        <div className="grid gap-600 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="flex flex-col gap-600">
            <div className="grid grid-cols-2 gap-500">
              <Stat label="Summer share (Jun–Aug)" value={format.pct(season.summerSharePct)} />
              <Stat label="Winter share (Dec–Feb)" value={format.pct(season.winterSharePct)} />
              <Stat label="Peak to trough" value={`${season.peakToTrough.toFixed(2)}×`} />
            </div>
            <div className="flex flex-col gap-200">
              <span className="text-100 tracking-widest text-muted-foreground uppercase">Winter heroes</span>
              <ol className="flex flex-col gap-200">
                {season.winterHeroes.map((hero) => (
                  <li key={hero.smoothie.id} className="flex items-baseline justify-between gap-300 border-b border-border pb-200">
                    <span className="font-heading text-400">{hero.smoothie.name}</span>
                    <span className="font-numeric text-300 text-muted-foreground tabular-nums">
                      {format.pct(hero.winterSharePct)} of its sales in winter
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <Insight>
              Put the winter heroes forward from December to February to fill factory capacity while summer blends dip.
              That smooths the line loading Innocent’s Blender needs.
            </Insight>
          </div>
          <SeasonChart season={season} />
        </div>
      )}
    </Lab>
  );
}

function TradeDownLab({ smoothies }: { smoothies: Smoothie[] }) {
  const rows = useMemo(() => tradeDownWatchlist(smoothies).slice(0, 5), [smoothies]);
  return (
    <Lab
      id="tradedown"
      icon={<Scale className="icon-size-200" aria-hidden />}
      title="Trade-down watchlist · answers challenge 04"
      question="Which blends are most likely to lose shoppers to cheaper own label?"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[calc(var(--spacing-800)*18)] text-left">
          <thead>
            <tr className="border-b border-primary/30 text-100 tracking-widest text-muted-foreground uppercase">
              <th className="py-200 pr-400 font-medium">Blend</th>
              <th className="py-200 pr-400 font-medium">Price per 100ml</th>
              <th className="py-200 pr-400 font-medium">Repeat rate</th>
              <th className="py-200 pr-400 font-medium">Risk</th>
              <th className="py-200 font-medium">Suggested move</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.smoothie.id} className="border-b border-border">
                <td className="py-300 pr-400 font-heading text-400">{row.smoothie.name}</td>
                <td className="py-300 pr-400 font-numeric text-300 tabular-nums">${row.pricePer100ml.toFixed(2)}</td>
                <td className="py-300 pr-400 font-numeric text-300 tabular-nums">{format.pct(row.smoothie.repeatRatePct)}</td>
                <td className="py-300 pr-400">
                  <span className="flex items-center gap-200">
                    <span className="h-100 w-[calc(var(--spacing-800)*2)] overflow-hidden rounded-full bg-muted" aria-hidden>
                      <span className="block h-full rounded-full bg-chart-alert" style={{ width: `${row.riskScore}%` }} />
                    </span>
                    <span className="font-numeric text-300 tabular-nums">{row.riskScore}</span>
                  </span>
                </td>
                <td className="py-300 text-300 text-muted-foreground">{suggestMove(row.smoothie, row.pricePer100ml)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Insight>
        Risk combines price per 100ml and repeat rate, scored 0–100 relative to this menu. Expensive blends that
        shoppers rarely re-buy are the first to go when budgets tighten.
      </Insight>
    </Lab>
  );
}

function suggestMove(smoothie: Smoothie, pricePer100ml: number) {
  if (smoothie.repeatRatePct < 40) return 'Loyalty multipack or subscription to lift repeat purchase';
  if (pricePer100ml > 3.3) return 'Add a smaller, lower-price format to protect the entry price';
  return 'Tell the value story: ingredients, nutrition and price per 100ml on pack';
}

function Sources() {
  return (
    <section aria-labelledby="sources-title" className="flex flex-col gap-400 border-t border-border pt-600">
      <h2 id="sources-title" className="font-heading text-500 leading-500 font-medium italic">
        Sources
      </h2>
      <ol className="grid gap-200 sm:grid-cols-2">
        {SOURCE_LIST.map((source, i) => (
          <li key={source.id} className="text-200 leading-200 text-muted-foreground">
            <span className="font-numeric text-primary">[{i + 1}]</span>{' '}
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {source.publisher}, “{source.title}”, {source.date}{' '}
              <ExternalLink className="inline icon-size-100" aria-hidden />
            </a>
          </li>
        ))}
      </ol>
      <p className="flex items-center gap-200 text-200 text-muted-foreground">
        <ArrowUpRight className="icon-size-100" aria-hidden />
        Research compiled 14 October 2026. Maison Nectar is a fictional brand with sample data.
      </p>
    </section>
  );
}
