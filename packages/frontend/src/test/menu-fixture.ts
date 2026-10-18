import { parsePalette, smoothieArtUrl } from '@/components/menu/smoothie-art';
import type { Smoothie } from '@/data/menu';

function smoothie(overrides: Partial<Smoothie> & Pick<Smoothie, 'id' | 'code' | 'name' | 'displayOrder'>): Smoothie {
  const base = {
    tagline: 'A test blend',
    category: 'Signature',
    description: 'Blended for tests.',
    ingredients: 'Strawberry, yogurt',
    palette: '#c2185b,#f48fb1,#fff1f5',
    garnish: 'strawberry',
    sizeMl: 450,
    priceUsd: 14,
    calories: 290,
    proteinG: 12,
    sugarG: 31,
    fiberG: 7,
    unitsSold: 64148,
    revenueUsd: 870263.99,
    grossMarginPct: 71.5,
    avgRating: 4.79,
    reviewCount: 2140,
    repeatRatePct: 46.2,
    storesStocking: 38,
    prepTimeSec: 75,
    updatedAt: new Date('2026-10-12T00:00:00Z'),
    revenueRank: 1,
    ...overrides,
  };
  return { ...base, colors: parsePalette(base.palette), art: smoothieArtUrl(base), cardArt: smoothieArtUrl(base, true) };
}

export const MENU_FIXTURE: Smoothie[] = [
  smoothie({ id: 'a', code: 'NCT-01', name: 'Velvet Rose Berry', displayOrder: 1 }),
  smoothie({
    id: 'b',
    code: 'NCT-02',
    name: 'Emerald Reserve',
    displayOrder: 2,
    category: 'Green',
    revenueUsd: 679653.78,
    revenueRank: 2,
  }),
];
