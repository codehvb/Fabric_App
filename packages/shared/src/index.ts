/**
 * Browser-safe contracts shared by the data registration package and frontend.
 *
 * Keep each record shape aligned with its decorated runtime entity in
 * `@rayfin-app/data`. This package must stay isomorphic, so do not import the
 * decorated classes here.
 */
export interface SmoothieRecord {
  id: string;
  code: string;
  displayOrder: number;
  name: string;
  tagline: string;
  category: string;
  description: string;
  ingredients: string;
  /** Comma-separated `base,top,accent` colours for the menu illustration. */
  palette: string;
  garnish: string;

  sizeMl: number;
  priceUsd: number;
  calories: number;
  proteinG: number;
  sugarG: number;
  fiberG: number;

  unitsSold: number;
  revenueUsd: number;
  grossMarginPct: number;
  avgRating: number;
  reviewCount: number;
  repeatRatePct: number;
  storesStocking: number;
  prepTimeSec: number;

  updatedAt: Date;
  owner_id: string;
  months?: SmoothieMonthlyRecord[];
}

export interface SmoothieMonthlyRecord {
  id: string;
  month: Date;
  unitsSold: number;
  revenueUsd: number;
  avgRating: number;
  smoothie_id: string;
  smoothie?: SmoothieRecord;
  owner_id: string;
}

export type UniversalAppSchema = {
  Smoothie: SmoothieRecord;
  SmoothieMonthly: SmoothieMonthlyRecord;
};
