import type { Smoothie } from '@/data/menu';

/** NHS: adults should have no more than 30g of free sugars a day. */
export const DAILY_FREE_SUGARS_G = 30;
/** NHS: at most 150ml of fruit juice and smoothies in total per day. */
export const DAILY_SMOOTHIE_ML = 150;

export interface SugarRow {
  smoothie: Smoothie;
  serveMl: number;
  sugarPerServeG: number;
  pctOfDailyMax: number;
  overDailyMax: boolean;
  sugarPer150mlG: number;
}

/**
 * Sugar per serve after a recipe cut. `serveMl` of `null` serves each blend in
 * its own bottle size.
 */
export function sugarLab(smoothies: Smoothie[], cutPct: number, serveMl: number | null): SugarRow[] {
  return smoothies.map((smoothie) => {
    const size = serveMl ?? smoothie.sizeMl;
    const perMl = (smoothie.sugarG * (1 - cutPct / 100)) / smoothie.sizeMl;
    const sugarPerServeG = perMl * size;
    return {
      smoothie,
      serveMl: size,
      sugarPerServeG,
      pctOfDailyMax: (sugarPerServeG / DAILY_FREE_SUGARS_G) * 100,
      overDailyMax: sugarPerServeG > DAILY_FREE_SUGARS_G,
      sugarPer150mlG: perMl * DAILY_SMOOTHIE_ML,
    };
  });
}

export interface CostRow {
  smoothie: Smoothie;
  marginBefore: number;
  marginAfter: number;
  profitLost: number;
  priceRisePct: number;
}

export interface CostShock {
  rows: CostRow[];
  marginBefore: number;
  marginAfter: number;
  profitLost: number;
  avgPriceRisePct: number;
}

/**
 * Reprices each blend's cost of goods when fruit costs rise by `inflationPct`
 * and fruit is `fruitSharePct` of cost of goods. Volumes are held flat.
 */
export function costShock(smoothies: Smoothie[], inflationPct: number, fruitSharePct: number): CostShock {
  const uplift = 1 + (inflationPct / 100) * (fruitSharePct / 100);
  const rows = smoothies.map((smoothie) => {
    const revenue = smoothie.revenueUsd;
    const margin = smoothie.grossMarginPct / 100;
    const cogs = revenue * (1 - margin);
    const newCogs = cogs * uplift;
    // Revenue that would restore the original margin on the new cost base.
    const restoringRevenue = newCogs / (1 - margin);
    return {
      smoothie,
      marginBefore: smoothie.grossMarginPct,
      marginAfter: ((revenue - newCogs) / revenue) * 100,
      profitLost: newCogs - cogs,
      priceRisePct: (restoringRevenue / revenue - 1) * 100,
    };
  });
  const revenue = rows.reduce((sum, r) => sum + r.smoothie.revenueUsd, 0);
  const weighted = (pick: (r: CostRow) => number) =>
    revenue ? rows.reduce((sum, r) => sum + pick(r) * r.smoothie.revenueUsd, 0) / revenue : 0;
  return {
    rows,
    marginBefore: weighted((r) => r.marginBefore),
    marginAfter: weighted((r) => r.marginAfter),
    profitLost: rows.reduce((sum, r) => sum + r.profitLost, 0),
    avgPriceRisePct: weighted((r) => r.priceRisePct),
  };
}

export interface MonthlyRevenue {
  smoothieId: string;
  month: Date;
  revenueUsd: number;
}

export type Season = 'Summer' | 'Winter' | 'Shoulder';

export function seasonOf(month: Date): Season {
  const m = month.getUTCMonth();
  if (m >= 5 && m <= 7) return 'Summer';
  if (m === 11 || m <= 1) return 'Winter';
  return 'Shoulder';
}

export interface Seasonality {
  months: { month: Date; revenueUsd: number; season: Season }[];
  summerSharePct: number;
  winterSharePct: number;
  peakToTrough: number;
  winterHeroes: { smoothie: Smoothie; winterSharePct: number }[];
}

export function seasonality(smoothies: Smoothie[], rows: MonthlyRevenue[]): Seasonality {
  const byMonth = new Map<number, number>();
  for (const row of rows) {
    const key = Date.UTC(row.month.getUTCFullYear(), row.month.getUTCMonth(), 1);
    byMonth.set(key, (byMonth.get(key) ?? 0) + row.revenueUsd);
  }
  const months = [...byMonth.entries()]
    .sort(([a], [b]) => a - b)
    .map(([key, revenueUsd]) => ({ month: new Date(key), revenueUsd, season: seasonOf(new Date(key)) }));
  const total = months.reduce((sum, m) => sum + m.revenueUsd, 0);
  const shareOf = (season: Season) =>
    total ? (months.filter((m) => m.season === season).reduce((s, m) => s + m.revenueUsd, 0) / total) * 100 : 0;
  const values = months.map((m) => m.revenueUsd);

  const winterHeroes = smoothies
    .map((smoothie) => {
      const own = rows.filter((r) => r.smoothieId === smoothie.id);
      const ownTotal = own.reduce((s, r) => s + r.revenueUsd, 0);
      const winter = own.filter((r) => seasonOf(r.month) === 'Winter').reduce((s, r) => s + r.revenueUsd, 0);
      return { smoothie, winterSharePct: ownTotal ? (winter / ownTotal) * 100 : 0 };
    })
    .sort((a, b) => b.winterSharePct - a.winterSharePct)
    .slice(0, 3);

  return {
    months,
    summerSharePct: shareOf('Summer'),
    winterSharePct: shareOf('Winter'),
    peakToTrough: values.length ? Math.max(...values) / Math.max(1, Math.min(...values)) : 0,
    winterHeroes,
  };
}

export interface TradeDownRow {
  smoothie: Smoothie;
  pricePer100ml: number;
  riskScore: number;
}

/**
 * Blends most likely to lose shoppers to cheaper alternatives: expensive per
 * 100ml and weakly re-bought. Score is 0–100, relative to this menu.
 */
export function tradeDownWatchlist(smoothies: Smoothie[]): TradeDownRow[] {
  const per100 = smoothies.map((s) => (s.priceUsd / s.sizeMl) * 100);
  const lo = Math.min(...per100);
  const hi = Math.max(...per100);
  const repeatLo = Math.min(...smoothies.map((s) => s.repeatRatePct));
  const repeatHi = Math.max(...smoothies.map((s) => s.repeatRatePct));
  const norm = (v: number, a: number, b: number) => (b > a ? (v - a) / (b - a) : 0.5);
  return smoothies
    .map((smoothie, i) => ({
      smoothie,
      pricePer100ml: per100[i],
      riskScore: Math.round(
        (0.5 * norm(per100[i], lo, hi) + 0.5 * (1 - norm(smoothie.repeatRatePct, repeatLo, repeatHi))) * 100
      ),
    }))
    .sort((a, b) => b.riskScore - a.riskScore);
}
