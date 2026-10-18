import type { SmoothieMonthlyRecord, SmoothieRecord } from '@rayfin-app/shared';

import { parsePalette, smoothieArtUrl, type Palette } from '@/components/menu/smoothie-art';
import type { MonthlyRevenue } from '@/data/strategy';
import { getRayfinClient } from '@/lib/rayfin-client';

const SMOOTHIE_FIELDS = [
  'id', 'code', 'displayOrder', 'name', 'tagline', 'category', 'description',
  'ingredients', 'palette', 'garnish', 'sizeMl', 'priceUsd', 'calories',
  'proteinG', 'sugarG', 'fiberG', 'unitsSold', 'revenueUsd', 'grossMarginPct',
  'avgRating', 'reviewCount', 'repeatRatePct', 'storesStocking', 'prepTimeSec',
  'updatedAt',
] as const satisfies readonly (keyof SmoothieRecord)[];

type SmoothieRow = Pick<SmoothieRecord, (typeof SMOOTHIE_FIELDS)[number]>;

export interface Smoothie extends SmoothieRow {
  colors: Palette;
  /** Card artwork as a data URL. */
  art: string;
  /** The same artwork mirrored, for the 3D ring's back-facing cards. */
  cardArt: string;
  revenueRank: number;
}

export interface MonthlyPoint {
  month: Date;
  unitsSold: number;
  revenueUsd: number;
  avgRating: number;
}

export interface PortfolioKpis {
  revenueUsd: number;
  unitsSold: number;
  avgRating: number;
  reviewCount: number;
  grossMarginPct: number;
  repeatRatePct: number;
  topSeller: Smoothie | null;
}

// The data API returns decimals as numbers today; coerce anyway so a string
// decimal can never leak into arithmetic or formatting.
const num = (value: unknown) => Number(value ?? 0);

export async function fetchMenu(): Promise<Smoothie[]> {
  const client = await getRayfinClient();
  const rows = (await client.data.Smoothie.select([...SMOOTHIE_FIELDS])
    .orderBy({ displayOrder: 'asc' })
    .first(500)
    .execute()) as SmoothieRow[];

  const smoothies = rows.map((row) => ({
    ...row,
    priceUsd: num(row.priceUsd),
    proteinG: num(row.proteinG),
    sugarG: num(row.sugarG),
    fiberG: num(row.fiberG),
    revenueUsd: num(row.revenueUsd),
    grossMarginPct: num(row.grossMarginPct),
    avgRating: num(row.avgRating),
    repeatRatePct: num(row.repeatRatePct),
    updatedAt: new Date(row.updatedAt),
    colors: parsePalette(row.palette),
    art: smoothieArtUrl(row),
    cardArt: smoothieArtUrl(row, true),
    revenueRank: 0,
  }));

  const byRevenue = [...smoothies].sort((a, b) => b.revenueUsd - a.revenueUsd);
  byRevenue.forEach((smoothie, index) => (smoothie.revenueRank = index + 1));
  return smoothies;
}

export async function fetchMonthly(smoothieId: string): Promise<MonthlyPoint[]> {
  const client = await getRayfinClient();
  const rows = (await client.data.SmoothieMonthly.select([
    'month',
    'unitsSold',
    'revenueUsd',
    'avgRating',
  ])
    .where({ smoothie_id: { eq: smoothieId } })
    .orderBy({ month: 'asc' })
    .first(120)
    .execute()) as Pick<SmoothieMonthlyRecord, 'month' | 'unitsSold' | 'revenueUsd' | 'avgRating'>[];

  return rows.map((row) => ({
    month: new Date(row.month),
    unitsSold: num(row.unitsSold),
    revenueUsd: num(row.revenueUsd),
    avgRating: num(row.avgRating),
  }));
}

/** Every smoothie's monthly revenue, for menu-wide seasonality. */
export async function fetchPortfolioMonthly(): Promise<MonthlyRevenue[]> {
  const client = await getRayfinClient();
  const rows = (await client.data.SmoothieMonthly.select(['smoothie_id', 'month', 'revenueUsd'])
    .orderBy({ month: 'asc' })
    .first(5000)
    .execute()) as Pick<SmoothieMonthlyRecord, 'smoothie_id' | 'month' | 'revenueUsd'>[];

  return rows.map((row) => ({
    smoothieId: row.smoothie_id,
    month: new Date(row.month),
    revenueUsd: num(row.revenueUsd),
  }));
}

export function portfolioKpis(smoothies: Smoothie[]): PortfolioKpis {
  const revenueUsd = smoothies.reduce((sum, s) => sum + s.revenueUsd, 0);
  const unitsSold = smoothies.reduce((sum, s) => sum + s.unitsSold, 0);
  const reviewCount = smoothies.reduce((sum, s) => sum + s.reviewCount, 0);
  const weighted = (pick: (s: Smoothie) => number, weight: (s: Smoothie) => number) => {
    const total = smoothies.reduce((sum, s) => sum + weight(s), 0);
    return total ? smoothies.reduce((sum, s) => sum + pick(s) * weight(s), 0) / total : 0;
  };
  return {
    revenueUsd,
    unitsSold,
    reviewCount,
    avgRating: weighted((s) => s.avgRating, (s) => s.reviewCount),
    grossMarginPct: weighted((s) => s.grossMarginPct, (s) => s.revenueUsd),
    repeatRatePct: weighted((s) => s.repeatRatePct, (s) => s.unitsSold),
    topSeller: smoothies.find((s) => s.revenueRank === 1) ?? null,
  };
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat('en-US');
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

export const format = {
  price: (value: number) => currency.format(value),
  money: (value: number) => compactCurrency.format(value),
  int: (value: number) => integer.format(Math.round(value)),
  count: (value: number) => compact.format(value),
  pct: (value: number) => `${value.toFixed(1)}%`,
  rating: (value: number) => value.toFixed(2),
  grams: (value: number) => `${Number.isInteger(value) ? value : value.toFixed(1)} g`,
};

/** A user-facing message for a failed data call, without provider internals. */
export function describeLoadError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/401|403|unauthori[sz]ed|forbidden|permission/i.test(message)) {
    return "Your account doesn't have access to the menu data. Ask the app owner to grant access, then reload.";
  }
  if (/missing required rayfin configuration/i.test(message)) {
    return "The app isn't connected to its Fabric backend. Check its configuration and reload.";
  }
  if (/failed to fetch|network|ECONN|timeout/i.test(message)) {
    return "Couldn't reach the Fabric backend. Check your connection and try again.";
  }
  return "The menu couldn't be loaded from Fabric. Try again in a moment.";
}
