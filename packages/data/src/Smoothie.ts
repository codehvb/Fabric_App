import {
  date,
  decimal,
  entity,
  int,
  many,
  role,
  text,
  uuid,
} from '@microsoft/rayfin-core';

import { SmoothieMonthly } from './SmoothieMonthly.js';

/**
 * A smoothie on the menu, with its recipe, nutrition, and trailing-twelve-month
 * performance KPIs.
 *
 * The menu is shared: every signed-in user can read it, while only the user
 * who created a row may change or remove it. Every `@text` carries a `max` so
 * MSSQL never gets an `NVARCHAR(MAX)` column.
 */
@entity()
@role('authenticated', 'read')
@role('authenticated', 'create', {
  policy: (claims, item) => claims.sub.eq(item.owner_id),
})
@role('authenticated', 'update', {
  policy: (claims, item) => claims.sub.eq(item.owner_id),
})
@role('authenticated', 'delete', {
  policy: (claims, item) => claims.sub.eq(item.owner_id),
})
export class Smoothie {
  @uuid() id!: string;
  @text({ min: 1, max: 20, unique: true }) code!: string;
  @int() displayOrder!: number;
  @text({ min: 1, max: 120 }) name!: string;
  @text({ max: 200 }) tagline!: string;
  @text({ max: 40 }) category!: string;
  @text({ max: 1200 }) description!: string;
  @text({ max: 400 }) ingredients!: string;
  /** Comma-separated `base,top,accent` colours for the menu illustration. */
  @text({ max: 80 }) palette!: string;
  /** Illustration garnish key, e.g. `strawberry` or `mint`. */
  @text({ max: 40 }) garnish!: string;

  @int() sizeMl!: number;
  @decimal() priceUsd!: number;
  @int() calories!: number;
  @decimal() proteinG!: number;
  @decimal() sugarG!: number;
  @decimal() fiberG!: number;

  @int() unitsSold!: number;
  @decimal() revenueUsd!: number;
  @decimal() grossMarginPct!: number;
  @decimal() avgRating!: number;
  @int() reviewCount!: number;
  @decimal() repeatRatePct!: number;
  @int() storesStocking!: number;
  @int() prepTimeSec!: number;

  @date() updatedAt!: Date;
  @text({ max: 200 }) owner_id!: string;

  @many(() => SmoothieMonthly) months?: SmoothieMonthly[];
}
