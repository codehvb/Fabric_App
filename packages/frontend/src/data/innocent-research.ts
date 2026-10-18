// Public research on Innocent Drinks, compiled 14 October 2026. Every figure
// here comes from the cited source; nothing is estimated. The interactive labs
// apply the same questions to the Maison Nectar sample menu, not to Innocent.

export interface Source {
  id: string;
  publisher: string;
  title: string;
  date: string;
  url: string;
}

export const SOURCES = {
  gazette2025: {
    id: 'gazette2025',
    publisher: 'Grocery Gazette',
    title: 'Innocent Drinks returned to profit in 2024',
    date: '10 Dec 2025',
    url: 'https://www.grocerygazette.co.uk/2025/12/10/innocent-drinks-returned-to-profit-in-2024/',
  },
  grocer2025Ranking: {
    id: 'grocer2025Ranking',
    publisher: 'The Grocer',
    title: 'Soft drinks – juices & smoothies 2025: functional juice shots fuel growth',
    date: '12 Dec 2025',
    url: 'https://www.thegrocer.co.uk/rankings/soft-drinks-juices-and-smoothies-2025-functional-juice-shots-fuel-growth/712957.article',
  },
  grocer2024Report: {
    id: 'grocer2024Report',
    publisher: 'The Grocer',
    title: 'Soft drinks – juices & smoothies 2024: juices dry up as own label prices rocket',
    date: '13 Dec 2024',
    url: 'https://www.thegrocer.co.uk/analysis-and-features/soft-drinks-juices-and-smoothies-2024-juices-dry-up-as-own-label-prices-rocket/698923.article',
  },
  grocerLosses: {
    id: 'grocerLosses',
    publisher: 'The Grocer',
    title: 'Innocent losses soar as £200m factory needs more investment',
    date: '18 Jan 2024',
    url: 'https://www.thegrocer.co.uk/news/innocent-losses-soar-as-200m-factory-needs-more-investment/687275.article',
  },
  grocerNpm: {
    id: 'grocerNpm',
    publisher: 'The Grocer',
    title: 'Doritos, Belvita and Innocent facing bans under new government health score',
    date: '15 Jan 2026',
    url: 'https://www.thegrocer.co.uk/news/doritos-belvita-and-innocent-facing-bans-under-new-government-health-score/713972.article',
  },
  igdHfss: {
    id: 'igdHfss',
    publisher: 'IGD',
    title: 'HFSS advertising ban comes into force',
    date: 'Jan 2026',
    url: 'https://www.igd.com/articles/hfss-advertising-ban-comes-into-force/72216',
  },
  nhsSugar: {
    id: 'nhsSugar',
    publisher: 'NHS',
    title: 'Sugar: the facts',
    date: 'current guidance',
    url: 'https://www.nhs.uk/live-well/eat-well/food-types/how-does-sugar-in-our-diet-affect-our-health/',
  },
  innocentNpm: {
    id: 'innocentNpm',
    publisher: 'Innocent Drinks',
    title: 'Why the NPM 2018 matters to innocent',
    date: 'position paper',
    url: 'https://www.innocentdrinks.co.uk/content/dam/innocent/gb/en/things-we-make/nutrition/nutrition-new-vi/why%20the%20NPM%202018%20matters%20to%20innocent.pdf',
  },
  freshplazaOj: {
    id: 'freshplazaOj',
    publisher: 'FreshPlaza',
    title: 'Orange juice prices reach new record high',
    date: '5 Jul 2024',
    url: 'https://www.freshplaza.com/north-america/article/9642059/orange-juice-prices-reach-new-record-high/',
  },
  gazetteAsa: {
    id: 'gazetteAsa',
    publisher: 'Grocery Gazette',
    title: 'Innocent ad ‘misleads’ consumers over eco claims, ASA rules',
    date: '23 Feb 2022',
    url: 'https://www.grocerygazette.co.uk/2022/02/23/innocent-ad-misleads-consumers-over-eco-claims-asa-rules/',
  },
  raconteur: {
    id: 'raconteur',
    publisher: 'Raconteur',
    title: 'What happens when ethical trailblazers are acquired by multinationals',
    date: 'feature',
    url: 'https://raconteur.net/sustainability/what-happens-when-ethical-trailblazers-are-acquired-by-multinationals',
  },
} satisfies Record<string, Source>;

type SourceId = keyof typeof SOURCES;

export interface Evidence {
  text: string;
  source: SourceId;
}

export type LabId = 'sugar' | 'cost' | 'season' | 'tradedown';

export interface Challenge {
  id: string;
  title: string;
  severity: 'High' | 'Medium';
  summary: string;
  evidence: Evidence[];
  fixes: string[];
  lab?: { id: LabId; label: string };
}

export const HEADLINE_FACTS: { value: string; label: string; source: SourceId }[] = [
  { value: '£466.1m', label: 'Turnover in 2024, up 13.2%', source: 'gazette2025' },
  { value: '£13m', label: 'Operating profit in 2024, first profit since 2020', source: 'gazette2025' },
  { value: '70%', label: 'Of drinks now made at the Rotterdam “Blender”', source: 'gazette2025' },
  { value: '−2.4m L', label: 'Volume lost in The Grocer’s 2025 juice ranking', source: 'grocer2025Ranking' },
];

export const CHALLENGES: Challenge[] = [
  {
    id: 'sugar',
    title: 'Sugar and the health halo',
    severity: 'High',
    summary:
      'Smoothies are sold as healthy, but blended fruit sugar counts as free sugar, so one bottle can use up an adult’s whole daily allowance.',
    evidence: [
      { text: 'The NHS says adults should have no more than 30g of free sugars a day, and smoothies count as free sugars.', source: 'nhsSugar' },
      { text: 'The NHS advises a maximum of 150ml of fruit juice and smoothies in total per day, with meals.', source: 'nhsSugar' },
      { text: 'Innocent publicly objects to the 2018 Nutrient Profiling Model scoring 100% juices and smoothies as “less healthy”.', source: 'innocentNpm' },
    ],
    fixes: [
      'Reformulate towards vegetable, fibre and protein bases, and show sugar per 150ml on pack.',
      'Grow smaller “little” formats that fit inside the 150ml guidance.',
      'Precedent: Innocent cut Juicy Water sugar by a fifth in April 2024 and grew volumes 16.3%.',
    ],
    lab: { id: 'sugar', label: 'Open the Sugar Lab' },
  },
  {
    id: 'regulation',
    title: 'Regulation could move the goalposts',
    severity: 'High',
    summary:
      'Juice is exempt from the 2026 junk-food ad ban today, but a proposed switch to the 2018 health score would pull smoothies into scope.',
    evidence: [
      { text: 'UK HFSS ad restrictions began on 5 January 2026: no TV ads 5:30am–9pm and no paid online ads. Fruit juice is currently exempt.', source: 'igdHfss' },
      { text: 'A DHSC impact assessment proposes moving to the 2018 model, which would bring fruit juices and smoothies into the ad and promotion bans. Innocent’s orange with bits is named. DHSC says no decision has been made.', source: 'grocerNpm' },
    ],
    fixes: [
      'Score every product against the 2018 model now, before it is adopted.',
      'Build an “always advertisable” range: lower sugar, functional shots, veg-led blends.',
      'Shift spend towards owned channels, sampling and in-store experience that the ban does not touch.',
    ],
    lab: { id: 'sugar', label: 'See which blends are exposed' },
  },
  {
    id: 'cost',
    title: 'Fruit cost shocks',
    severity: 'High',
    summary:
      'Orange juice, a core smoothie and juice base, hit record prices as disease and weather cut supply, squeezing margins.',
    evidence: [
      { text: 'The EU orange juice concentrate benchmark reached $6,550/t on 28 June 2024, up 112% year on year.', source: 'freshplazaOj' },
      { text: 'Brazil’s 2024–25 orange crop was forecast at 232.4m boxes, down 24.4% on the previous season.', source: 'freshplazaOj' },
      { text: 'In 2022, rises in commodity, energy, logistics and packaging costs helped push Innocent’s after-tax loss to £48.8m.', source: 'grocerLosses' },
    ],
    fixes: [
      'Design recipes with swappable bases (apple, mandarin, vegetable) so costly fruit can be rotated out.',
      'Use multi-origin contracts and forward buying on the most volatile fruit.',
      'Plan price and pack moves in advance, product by product, instead of across-the-board increases.',
    ],
    lab: { id: 'cost', label: 'Run the Cost Shock Simulator' },
  },
  {
    id: 'tradedown',
    title: 'Own-label trade-down',
    severity: 'High',
    summary:
      'When prices rise, shoppers move to cheaper own-label juice. The category is shrinking and Innocent lost volume while functional brands grew.',
    evidence: [
      { text: 'Innocent’s 2022 accounts cite shoppers switching to cheaper own-label smoothies and juices.', source: 'grocerLosses' },
      { text: 'Juices and smoothies lost 52.7m litres in 2024, the biggest drop of any soft drinks sector. Own label fell 8% as its price per litre rose 13.3%.', source: 'grocer2024Report' },
      { text: 'Innocent shed 2.4m litres in The Grocer’s 2025 ranking while functional brands drove category growth.', source: 'grocer2025Ranking' },
    ],
    fixes: [
      'Protect loyalty with repeat-purchase mechanics such as multipacks, subscriptions and rewards.',
      'Make value per 100ml clear for the blends most exposed to trade-down.',
      'Lead in innovation that own label struggles to copy. Innocent launched three functional shots in November 2025.',
    ],
    lab: { id: 'tradedown', label: 'View the trade-down watchlist' },
  },
  {
    id: 'operations',
    title: 'Running the £200m Blender',
    severity: 'Medium',
    summary:
      'Innocent’s carbon-neutral Rotterdam factory took longer to ramp up than expected, but is now the engine of the turnaround.',
    evidence: [
      { text: 'The £200m “Blender” opened in September 2021. A slower-than-expected ramp-up left the supply chain “unstable”.', source: 'grocerLosses' },
      { text: 'By 2024 it made about 70% of Innocent’s drinks. Headcount fell 33% and the company returned to a £13m operating profit.', source: 'gazette2025' },
    ],
    fixes: [
      'Track throughput, waste and service level by line, side by side with demand.',
      'Forecast seasonal peaks so the factory runs evenly year-round.',
      'Use counter-seasonal products to fill winter capacity.',
    ],
    lab: { id: 'season', label: 'Open the Seasonality Planner' },
  },
  {
    id: 'trust',
    title: 'Sustainability credibility',
    severity: 'Medium',
    summary:
      'A brand built on doing good faces scrutiny over plastic and its Coca-Cola ownership, and regulators now police green claims.',
    evidence: [
      { text: 'The ASA banned the “Little Drinks, Big Dreams” ad in February 2022 for implying a net-positive environmental impact. It noted the bottles include non-recycled plastic.', source: 'gazetteAsa' },
      { text: 'Coca-Cola has owned more than 90% of Innocent since 2013. Campaigners link the brand to its parent’s plastic record.', source: 'raconteur' },
    ],
    fixes: [
      'Only make claims backed by lifecycle data for each product.',
      'Publish recycled content and carbon per bottle, verified by a third party.',
      'Run new campaigns through a claims check against ASA guidance before they air.',
    ],
  },
];
