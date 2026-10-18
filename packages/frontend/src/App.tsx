//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Moon, RotateCw, Sun } from 'lucide-react';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { KpiInline } from '@/components/menu/kpi';
import { PortfolioRibbon } from '@/components/menu/portfolio-ribbon';
import { CARD_HEIGHT, CARD_WIDTH } from '@/components/menu/smoothie-art';
import { SmoothiePanel } from '@/components/menu/smoothie-panel';
import type { FocusRequest } from '@/components/showcase/carousel-scene';
import { format, portfolioKpis, type Smoothie } from '@/data/menu';
import { useTheme } from '@/hooks/theme.context';
import { useMenu } from '@/hooks/use-menu';
import { cn } from '@/lib/utils';

const CarouselScene = lazy(() =>
  import('@/components/showcase/carousel-scene').then((module) => ({
    default: module.CarouselScene,
  }))
);

const StrategyRoom = lazy(() => import('@/components/strategy/strategy-room'));

type View = 'collection' | 'strategy';

const pad = (n: number) => String(n).padStart(2, '0');

function App() {
  const { state, retry } = useMenu();
  const [view, setView] = useState<View>('collection');
  const ready = state.status === 'ready' && state.data.length > 0;

  return (
    <div className="relative h-full overflow-hidden bg-background text-foreground">
      <Masthead view={ready ? view : null} onViewChange={setView} />
      {state.status === 'loading' && <Pouring label="Pouring the collection…" />}
      {state.status === 'error' && (
        <Notice title="The menu couldn't be loaded" action={<RetryButton onClick={retry} />}>
          {state.message}
        </Notice>
      )}
      {state.status === 'ready' && state.data.length === 0 && (
        <Notice title="The menu is empty" action={<RetryButton onClick={retry} />}>
          No smoothies are stored in the Fabric database yet. The app owner can load the sample
          collection by running the seed script, then reload.
        </Notice>
      )}
      {ready && view === 'collection' && <Collection smoothies={state.data} />}
      {ready && view === 'strategy' && (
        <Suspense fallback={<Pouring label="Opening the strategy room…" />}>
          <StrategyRoom smoothies={state.data} />
        </Suspense>
      )}
    </div>
  );
}

function Collection({ smoothies }: { smoothies: Smoothie[] }) {
  const count = smoothies.length;
  const wrap = useCallback((index: number) => ((index % count) + count) % count, [count]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [frontIndex, setFrontIndex] = useState(0);
  const [focus, setFocus] = useState<FocusRequest | null>(null);
  const [ready, setReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);

  const kpis = useMemo(() => portfolioKpis(smoothies), [smoothies]);
  const cards = useMemo(
    () => smoothies.map(({ id, name, cardArt }) => ({ id, name, art: cardArt })),
    [smoothies]
  );

  const turnTo = useCallback(
    (index: number) => setFocus((prev) => ({ index: wrap(index), nonce: (prev?.nonce ?? 0) + 1 })),
    [wrap]
  );

  const select = useCallback(
    (id: string) => {
      setSelectedId(id);
      turnTo(smoothies.findIndex((s) => s.id === id));
    },
    [smoothies, turnTo]
  );

  const selectedIndex = smoothies.findIndex((s) => s.id === selectedId);
  const selected = selectedIndex >= 0 ? smoothies[selectedIndex] : null;
  const featured = smoothies.find((s) => s.id === hoveredId) ?? smoothies[frontIndex] ?? smoothies[0];

  const step = useCallback(
    (direction: -1 | 1) => {
      if (selectedIndex >= 0) select(smoothies[wrap(selectedIndex + direction)].id);
      else turnTo(frontIndex + direction);
    },
    [frontIndex, select, selectedIndex, smoothies, turnTo, wrap]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null);
      if (event.key === 'ArrowLeft') step(-1);
      if (event.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  const onReady = useCallback(() => setReady(true), []);

  return (
    <div className="absolute inset-0" style={{ '--smoothie': featured.colors.base } as CSSProperties}>
      {/* Ambient glow that takes on the featured smoothie's colour */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-(--smoothie) opacity-30 transition-colors duration-700 [mask-image:radial-gradient(ellipse_at_50%_50%,black_0%,transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,var(--color-halo)_0%,transparent_45%)] opacity-60"
      />

      <div className="absolute inset-0">
        {sceneFailed ? (
          <SceneUnavailable smoothies={smoothies} onSelect={select} />
        ) : (
          <ErrorBoundary fallbackRender={() => null} onError={() => setSceneFailed(true)}>
            <Suspense fallback={null}>
              <CarouselScene
                cards={cards}
                aspect={CARD_HEIGHT / CARD_WIDTH}
                activeId={hoveredId}
                focus={focus}
                onHover={setHoveredId}
                onSelect={select}
                onFrontChange={setFrontIndex}
                onReady={onReady}
              />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>

      <AnimatePresence>{!ready && !sceneFailed && <Pouring key="pouring" label="Setting the bar…" />}</AnimatePresence>

      <div className="pointer-events-none absolute inset-x-0 top-[calc(var(--spacing-800)*5)] z-10 flex justify-center px-400 lg:top-[calc(var(--spacing-800)*3)]">
        <PortfolioRibbon kpis={kpis} count={count} />
      </div>

      <nav
        aria-label="Smoothie menu"
        className="pointer-events-none absolute top-1/2 left-800 z-10 hidden -translate-y-1/2 xl:block"
      >
        <ol className="flex flex-col gap-100">
          {smoothies.map((smoothie, i) => {
            const isFeatured = smoothie.id === featured.id;
            return (
              <li key={smoothie.id}>
                <button
                  type="button"
                  onClick={() => select(smoothie.id)}
                  onMouseEnter={() => setHoveredId(smoothie.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(smoothie.id)}
                  onBlur={() => setHoveredId(null)}
                  className={cn(
                    'pointer-events-auto flex items-baseline gap-300 rounded-md px-200 py-100 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                    isFeatured ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="font-numeric text-200 tabular-nums">{pad(i + 1)}</span>
                  <span
                    className={cn(
                      'h-px self-center bg-primary transition-all duration-300',
                      isFeatured ? 'w-600' : 'w-200 opacity-40'
                    )}
                  />
                  <span className="font-heading text-400 leading-400">{smoothie.name}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <Caption smoothie={featured} onOpen={() => select(featured.id)} onStep={step} />

      <SmoothiePanel
        smoothie={selected}
        total={count}
        onClose={() => setSelectedId(null)}
        onStep={step}
      />
    </div>
  );
}

function Caption({
  smoothie,
  onOpen,
  onStep,
}: {
  smoothie: Smoothie;
  onOpen: () => void;
  onStep: (direction: -1 | 1) => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-400 px-400 pb-600 text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={smoothie.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-200"
        >
          <span className="text-200 tracking-widest text-primary uppercase">
            N° {pad(smoothie.displayOrder)} · {smoothie.category} · {format.price(smoothie.priceUsd)}
          </span>
          <span className="font-heading text-hero-800 leading-hero-800 font-medium">{smoothie.name}</span>
          <span className="hidden font-heading text-400 text-muted-foreground italic sm:block">
            {smoothie.tagline}
          </span>
          <div className="mt-200 flex divide-x divide-primary/20">
            <KpiInline label="Revenue" value={format.money(smoothie.revenueUsd)} />
            <KpiInline label="Units" value={format.count(smoothie.unitsSold)} />
            <KpiInline label="Rating" value={format.rating(smoothie.avgRating)} />
            <KpiInline label="Margin" value={format.pct(smoothie.grossMarginPct)} />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-auto flex items-center gap-300">
        <RoundButton label="Turn to previous smoothie" onClick={() => onStep(-1)}>
          <ChevronLeft className="icon-size-200" />
        </RoundButton>
        <button
          type="button"
          onClick={onOpen}
          className="rounded-full bg-primary px-600 py-200 text-300 font-medium tracking-widest text-primary-foreground uppercase shadow-lg transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
        >
          View all KPIs
        </button>
        <RoundButton label="Turn to next smoothie" onClick={() => onStep(1)}>
          <ChevronRight className="icon-size-200" />
        </RoundButton>
      </div>

      <p className="text-200 text-muted-foreground">
        Scroll to turn the collection · Sample data and illustrations, stored in Fabric
      </p>
    </div>
  );
}

function Masthead({ view, onViewChange }: { view: View | null; onViewChange: (view: View) => void }) {
  const { isDark, toggleTheme } = useTheme();
  return (
    <header
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-400 px-600 pt-600 sm:px-800',
        // The strategy room scrolls beneath the masthead, so give it a backdrop.
        view === 'strategy' && 'bg-gradient-to-b from-background via-background/95 to-transparent pb-600'
      )}
    >
      <div className="flex flex-col gap-100">
        <span className="font-heading text-hero-700 leading-hero-700 font-medium tracking-widest uppercase">
          Maison Nectar
        </span>
        <span className="text-200 tracking-widest text-muted-foreground uppercase">
          Atelier of cold-pressed blends
        </span>
      </div>
      <div className="pointer-events-auto flex items-center gap-300">
        {view && (
          <div role="tablist" aria-label="View" className="flex rounded-full border border-primary/30 bg-card/60 p-100 backdrop-blur">
            {(
              [
                ['collection', 'Collection', 'Collection'],
                ['strategy', 'Strategy room', 'Strategy'],
              ] as const
            ).map(([id, label, short]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={view === id}
                aria-label={label}
                onClick={() => onViewChange(id)}
                className={cn(
                  'rounded-full px-400 py-100 text-200 font-medium tracking-wider uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  view === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        )}
        <span className="hidden rounded-full border border-primary/40 px-300 py-100 text-100 tracking-widest text-primary uppercase sm:inline">
          Sample data
        </span>
        <RoundButton label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggleTheme}>
          {isDark ? <Sun className="icon-size-200" /> : <Moon className="icon-size-200" />}
        </RoundButton>
      </div>
    </header>
  );
}

function RoundButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded-full border border-primary/30 bg-card/60 p-300 text-muted-foreground backdrop-blur transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {children}
    </button>
  );
}

function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-200 rounded-full bg-primary px-500 py-200 text-300 font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <RotateCw className="icon-size-200" aria-hidden />
      Try again
    </button>
  );
}

function Pouring({ label }: { label: string }) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-300"
    >
      <span className="h-px w-800 animate-pulse bg-primary" />
      <span className="font-heading text-500 text-muted-foreground italic">{label}</span>
    </motion.div>
  );
}

function Notice({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-600">
      <div role="alert" className="flex max-w-md flex-col items-center gap-400 text-center">
        <h1 className="font-heading text-hero-700 leading-hero-700 font-medium">{title}</h1>
        <p className="text-300 leading-300 text-muted-foreground">{children}</p>
        {action}
      </div>
    </div>
  );
}

/** Shown when WebGL is unavailable: the collection stays browsable as a grid. */
function SceneUnavailable({ smoothies, onSelect }: { smoothies: Smoothie[]; onSelect: (id: string) => void }) {
  return (
    <div className="flex h-full justify-center overflow-y-auto px-600 pt-[calc(var(--spacing-800)*6)] pb-[calc(var(--spacing-800)*9)]">
      <div className="grid h-fit max-w-5xl grid-cols-2 gap-400 sm:grid-cols-5">
        {smoothies.map((smoothie) => (
          <button
            key={smoothie.id}
            type="button"
            onClick={() => onSelect(smoothie.id)}
            className="overflow-hidden rounded-2xl ring-1 ring-primary/30 transition-transform hover:-translate-y-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <img src={smoothie.art} alt={smoothie.name} className="w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
