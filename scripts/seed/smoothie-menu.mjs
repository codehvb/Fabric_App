// Maison Nectar sample menu. Every figure here is illustrative sample data,
// generated deterministically so a reseed always produces the same numbers.

/** Twelve complete months, oldest first: Oct 2025 – Sep 2026. */
export const MONTHS = Array.from(
  { length: 12 },
  (_, i) => new Date(Date.UTC(2025, 9 + i, 1))
);

// Month multipliers indexed by calendar month (0 = Jan).
const SEASONS = {
  summer: [0.72, 0.76, 0.86, 0.95, 1.08, 1.22, 1.3, 1.26, 1.08, 0.9, 0.78, 0.72],
  winter: [1.18, 1.12, 1.04, 0.95, 0.88, 0.82, 0.8, 0.83, 0.92, 1.04, 1.14, 1.24],
  steady: [0.94, 0.95, 0.99, 1.01, 1.03, 1.06, 1.07, 1.05, 1.01, 0.99, 0.96, 0.97],
};

export const SMOOTHIES = [
  {
    code: 'NCT-01', name: 'Velvet Rose Berry', category: 'Signature',
    tagline: 'Strawberry and raspberry folded into rose-scented cream',
    description: 'Our house signature. Sun-ripened strawberries and raspberries are blended with strained Greek yogurt, a whisper of Damask rose water and Madagascan vanilla bean for a velvety, perfumed finish.',
    ingredients: 'Strawberry, raspberry, Greek yogurt, rose water, vanilla bean, wildflower honey',
    palette: '#c2185b,#f48fb1,#fff1f5', garnish: 'strawberry',
    sizeMl: 450, priceUsd: 14, calories: 290, proteinG: 12, sugarG: 31, fiberG: 7,
    baseUnits: 5200, season: 'summer', growth: 0.012,
    grossMarginPct: 71.5, rating: 4.8, reviewCount: 2140, repeatRatePct: 46.2, storesStocking: 38, prepTimeSec: 75,
  },
  {
    code: 'NCT-02', name: 'Emerald Reserve', category: 'Green',
    tagline: 'Cold greens, green apple and a bright ginger lift',
    description: 'A deeply green blend of Tuscan kale, baby spinach and cucumber, balanced with crisp green apple, fresh lime and ginger, then finished with a measure of spirulina.',
    ingredients: 'Kale, spinach, cucumber, green apple, lime, ginger, spirulina',
    palette: '#2e7d32,#9ccc65,#e8f5e9', garnish: 'mint',
    sizeMl: 450, priceUsd: 13, calories: 180, proteinG: 5, sugarG: 19, fiberG: 8,
    baseUnits: 4100, season: 'steady', growth: 0.018,
    grossMarginPct: 68.9, rating: 4.6, reviewCount: 1580, repeatRatePct: 52.8, storesStocking: 36, prepTimeSec: 70,
  },
  {
    code: 'NCT-03', name: 'Gold Leaf Mango', category: 'Tropical',
    tagline: 'Alphonso mango, passion fruit and turmeric, crowned in gold',
    description: 'Alphonso mango and tart passion fruit are blended with coconut water and fresh turmeric root, then crowned with a single sheet of edible gold leaf. Our most celebrated pour.',
    ingredients: 'Alphonso mango, passion fruit, coconut water, turmeric, lime, edible gold leaf',
    palette: '#f9a825,#ffe082,#fff8e1', garnish: 'mango',
    sizeMl: 450, priceUsd: 16, calories: 260, proteinG: 3, sugarG: 44, fiberG: 5,
    baseUnits: 4800, season: 'summer', growth: 0.015,
    grossMarginPct: 74.2, rating: 4.9, reviewCount: 2410, repeatRatePct: 41.5, storesStocking: 34, prepTimeSec: 80,
  },
  {
    code: 'NCT-04', name: 'Midnight Cacao', category: 'Protein',
    tagline: 'Dark cacao, Medjool date and almond butter, 28 g protein',
    description: 'A dense, dessert-dark protein blend of single-origin cacao, Medjool dates and roasted almond butter with oat milk and whey isolate, finished with a pinch of Maldon sea salt.',
    ingredients: 'Cacao, Medjool date, almond butter, oat milk, whey isolate, sea salt',
    palette: '#4e342e,#8d6e63,#efebe9', garnish: 'cacao',
    sizeMl: 500, priceUsd: 15, calories: 410, proteinG: 28, sugarG: 26, fiberG: 6,
    baseUnits: 3900, season: 'winter', growth: 0.01,
    grossMarginPct: 66.3, rating: 4.7, reviewCount: 1720, repeatRatePct: 55.1, storesStocking: 33, prepTimeSec: 90,
  },
  {
    code: 'NCT-05', name: 'Blue Lagoon', category: 'Wellness',
    tagline: 'Blue spirulina, pineapple and coconut cream',
    description: 'A vivid, naturally blue blend of blue spirulina, banana and golden pineapple, rounded with coconut cream and a squeeze of lime. Light, creamy and quietly restorative.',
    ingredients: 'Blue spirulina, banana, pineapple, coconut cream, lime',
    palette: '#0277bd,#4fc3f7,#e1f5fe', garnish: 'lime',
    sizeMl: 450, priceUsd: 14, calories: 240, proteinG: 4, sugarG: 28, fiberG: 4,
    baseUnits: 3300, season: 'summer', growth: 0.02,
    grossMarginPct: 70.4, rating: 4.5, reviewCount: 1190, repeatRatePct: 38.7, storesStocking: 30, prepTimeSec: 75,
  },
  {
    code: 'NCT-06', name: 'Dragon Silk', category: 'Tropical',
    tagline: 'Pink pitaya, lychee and white peach',
    description: 'Magenta pitaya, perfumed lychee and white peach blended into cultured coconut yogurt. Silky, floral and luminously pink.',
    ingredients: 'Pitaya, lychee, white peach, coconut yogurt, lime',
    palette: '#ad1457,#f06292,#fce4ec', garnish: 'dragonfruit',
    sizeMl: 450, priceUsd: 15, calories: 220, proteinG: 6, sugarG: 30, fiberG: 6,
    baseUnits: 3600, season: 'summer', growth: 0.014,
    grossMarginPct: 72.8, rating: 4.7, reviewCount: 1430, repeatRatePct: 43.9, storesStocking: 31, prepTimeSec: 80,
  },
  {
    code: 'NCT-07', name: 'Matcha Silk', category: 'Wellness',
    tagline: 'Ceremonial matcha, oat milk and vanilla',
    description: 'Stone-ground ceremonial matcha from Uji whisked into oat milk with banana, vanilla and a thread of raw honey. Calm, grassy and gently sweet.',
    ingredients: 'Ceremonial matcha, banana, oat milk, vanilla, raw honey',
    palette: '#558b2f,#c5e1a5,#f1f8e9', garnish: 'leaf',
    sizeMl: 450, priceUsd: 14, calories: 230, proteinG: 7, sugarG: 22, fiberG: 4,
    baseUnits: 3700, season: 'steady', growth: 0.022,
    grossMarginPct: 69.6, rating: 4.6, reviewCount: 1310, repeatRatePct: 49.4, storesStocking: 35, prepTimeSec: 70,
  },
  {
    code: 'NCT-08', name: 'Citrus Sunrise', category: 'Signature',
    tagline: 'Blood orange, carrot and fresh ginger',
    description: 'Winter blood oranges pressed with heirloom carrot, fresh ginger, turmeric and Meyer lemon. A bright, warming morning ritual.',
    ingredients: 'Blood orange, carrot, ginger, turmeric, Meyer lemon',
    palette: '#e65100,#ffb74d,#fff3e0', garnish: 'orange',
    sizeMl: 400, priceUsd: 12, calories: 170, proteinG: 3, sugarG: 27, fiberG: 4,
    baseUnits: 4400, season: 'winter', growth: 0.008,
    grossMarginPct: 73.9, rating: 4.5, reviewCount: 1880, repeatRatePct: 39.2, storesStocking: 40, prepTimeSec: 60,
  },
  {
    code: 'NCT-09', name: 'Coconut Cloud', category: 'Signature',
    tagline: 'Young coconut, cashew and Ceylon cinnamon',
    description: 'The flesh and water of young Thai coconuts blended with banana, soaked cashews, vanilla and Ceylon cinnamon. Soft, cool and cloud-light.',
    ingredients: 'Young coconut, banana, cashew, vanilla, Ceylon cinnamon',
    palette: '#bcaaa4,#f5f0e8,#ffffff', garnish: 'coconut',
    sizeMl: 450, priceUsd: 13, calories: 310, proteinG: 6, sugarG: 24, fiberG: 3,
    baseUnits: 2900, season: 'steady', growth: 0.006,
    grossMarginPct: 70.1, rating: 4.4, reviewCount: 960, repeatRatePct: 36.5, storesStocking: 28, prepTimeSec: 65,
  },
  {
    code: 'NCT-10', name: 'Açaí Noir', category: 'Berry',
    tagline: 'Açaí, blackberry and dark cherry with hemp seed',
    description: 'Amazonian açaí with blackberry, wild blueberry and dark sweet cherry, deepened with hemp seed and a touch of Vermont maple. Inky, rich and antioxidant-dense.',
    ingredients: 'Açaí, blackberry, blueberry, dark cherry, hemp seed, maple syrup',
    palette: '#4a148c,#9575cd,#ede7f6', garnish: 'berries',
    sizeMl: 450, priceUsd: 16, calories: 300, proteinG: 9, sugarG: 29, fiberG: 10,
    baseUnits: 4600, season: 'steady', growth: 0.016,
    grossMarginPct: 67.8, rating: 4.8, reviewCount: 2260, repeatRatePct: 51.3, storesStocking: 39, prepTimeSec: 85,
  },
];

function prng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const round = (value, digits) => Number(value.toFixed(digits));

/** Monthly units, revenue, and rating, plus the trailing-twelve-month totals. */
export function buildMenu() {
  return SMOOTHIES.map((smoothie, index) => {
    const random = prng(index * 7919 + 17);
    const months = MONTHS.map((month, i) => {
      const season = SEASONS[smoothie.season][month.getUTCMonth()];
      const trend = 1 + smoothie.growth * i;
      const noise = 0.95 + random() * 0.1;
      const unitsSold = Math.round(smoothie.baseUnits * season * trend * noise);
      // Promotions and loyalty redemptions realise slightly below list price.
      const realised = smoothie.priceUsd * (0.955 + random() * 0.025);
      return {
        month,
        unitsSold,
        revenueUsd: round(unitsSold * realised, 2),
        avgRating: round(Math.min(5, smoothie.rating - 0.12 + random() * 0.24), 2),
      };
    });
    // eslint-disable-next-line no-unused-vars
    const { baseUnits, season, growth, rating, ...fields } = smoothie;
    return {
      ...fields,
      displayOrder: index + 1,
      unitsSold: months.reduce((sum, m) => sum + m.unitsSold, 0),
      revenueUsd: round(months.reduce((sum, m) => sum + m.revenueUsd, 0), 2),
      avgRating: round(months.reduce((sum, m) => sum + m.avgRating, 0) / months.length, 2),
      months,
    };
  });
}
