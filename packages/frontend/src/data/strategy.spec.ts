import { describe, expect, it } from 'vitest';

import { costShock, seasonality, sugarLab, tradeDownWatchlist } from '@/data/strategy';
import { MENU_FIXTURE } from '@/test/menu-fixture';

describe('sugarLab', () => {
  it('flags a 450ml bottle with 31g of sugar as over the 30g daily maximum', () => {
    const [row] = sugarLab(MENU_FIXTURE, 0, null);
    expect(row.sugarPerServeG).toBeCloseTo(31);
    expect(row.overDailyMax).toBe(true);
    expect(row.sugarPer150mlG).toBeCloseTo(31 / 3);
  });

  it('scales sugar by the recipe cut and the serve size', () => {
    const [row] = sugarLab(MENU_FIXTURE, 20, 150);
    expect(row.sugarPerServeG).toBeCloseTo((31 * 0.8) / 3);
    expect(row.overDailyMax).toBe(false);
  });
});

describe('costShock', () => {
  it('leaves margins untouched with no inflation', () => {
    const shock = costShock(MENU_FIXTURE, 0, 45);
    expect(shock.marginAfter).toBeCloseTo(shock.marginBefore);
    expect(shock.profitLost).toBeCloseTo(0);
  });

  it('reprices cost of goods and finds the price rise that restores margin', () => {
    const { rows } = costShock(MENU_FIXTURE, 100, 50);
    const row = rows[0];
    // Cost of goods rises 50%; the restoring price rise matches it.
    expect(row.priceRisePct).toBeCloseTo(50);
    const cogs = row.smoothie.revenueUsd * (1 - row.smoothie.grossMarginPct / 100);
    expect(row.profitLost).toBeCloseTo(cogs * 0.5);
    expect(row.marginAfter).toBeLessThan(row.marginBefore);
  });
});

describe('seasonality', () => {
  it('totals revenue by month and ranks winter heroes', () => {
    const [a, b] = MENU_FIXTURE;
    const result = seasonality(MENU_FIXTURE, [
      { smoothieId: a.id, month: new Date(Date.UTC(2026, 6, 1)), revenueUsd: 90 },
      { smoothieId: a.id, month: new Date(Date.UTC(2026, 0, 1)), revenueUsd: 10 },
      { smoothieId: b.id, month: new Date(Date.UTC(2026, 0, 1)), revenueUsd: 60 },
      { smoothieId: b.id, month: new Date(Date.UTC(2026, 6, 1)), revenueUsd: 40 },
    ]);
    expect(result.months.map((m) => m.revenueUsd)).toEqual([70, 130]);
    expect(result.summerSharePct).toBeCloseTo(65);
    expect(result.winterHeroes[0].smoothie.id).toBe(b.id);
    expect(result.peakToTrough).toBeCloseTo(130 / 70);
  });
});

describe('tradeDownWatchlist', () => {
  it('ranks the pricier, less re-bought blend as the bigger risk', () => {
    const cheapLoyal = { ...MENU_FIXTURE[0], id: 'x', priceUsd: 10, repeatRatePct: 60 };
    const pricyFickle = { ...MENU_FIXTURE[1], id: 'y', priceUsd: 18, repeatRatePct: 30 };
    const [top] = tradeDownWatchlist([cheapLoyal, pricyFickle]);
    expect(top.smoothie.id).toBe('y');
    expect(top.riskScore).toBe(100);
  });
});
