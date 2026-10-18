// Illustrated menu cards, drawn as SVG from each smoothie's stored palette and
// garnish. The same artwork textures the 3D cards and fills the detail panel.
// Colours here are illustration pigments, not UI tokens: an SVG rendered as an
// image cannot read CSS variables.

export const CARD_WIDTH = 800;
export const CARD_HEIGHT = 1040;

const OBSIDIAN = '#0b0a0d';
const GOLD = '#d4b26a';
const IVORY = '#f6efe4';

export interface ArtInput {
  code: string;
  name: string;
  category: string;
  palette: string;
  garnish: string;
}

export interface Palette {
  base: string;
  top: string;
  accent: string;
}

export function parsePalette(palette: string): Palette {
  const [base = '#8e5b7a', top = '#e8b4c8', accent = '#fff4f8'] = palette
    .split(',')
    .map((part) => part.trim())
    .filter((part) => /^#[0-9a-f]{6}$/i.test(part));
  return { base, top, accent };
}

function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const channel = (shift: number) =>
    Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return `#${((1 << 24) | (channel(16) << 16) | (channel(8) << 8) | channel(0)).toString(16).slice(1)}`;
}

function escapeXml(text: string): string {
  return text.replace(/[<>&'"]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === "'" ? '&apos;' : '&quot;'
  );
}

function citrusWheel(rind: string, flesh: string): string {
  const segments = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return `<line x1="0" y1="0" x2="${(Math.cos(angle) * 42).toFixed(1)}" y2="${(Math.sin(angle) * 42).toFixed(1)}" stroke="${IVORY}" stroke-opacity="0.8" stroke-width="3"/>`;
  }).join('');
  return `<circle r="56" fill="${rind}"/><circle r="47" fill="${IVORY}" fill-opacity="0.85"/><circle r="44" fill="${flesh}"/>${segments}<circle r="5" fill="${IVORY}"/>`;
}

const GARNISHES: Record<string, string> = {
  strawberry: `<path d="M0,-34 C42,-46 60,-2 32,34 C19,52 7,62 0,66 C-7,62 -19,52 -32,34 C-60,-2 -42,-46 0,-34Z" fill="#d81b3c"/>
    <path d="M-12,-30 C-6,-16 6,-16 12,-30" fill="none" stroke="#ff8a9c" stroke-opacity="0.5" stroke-width="4"/>
    ${[[-18, -6], [0, -12], [18, -6], [-24, 14], [-6, 10], [12, 12], [26, 12], [-12, 30], [6, 32], [-2, 48]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="4" fill="#ffe082"/>`).join('')}
    <path d="M0,-36 C-24,-58 -42,-44 -40,-36 C-26,-40 -12,-38 0,-36 C12,-38 26,-40 40,-36 C42,-44 24,-58 0,-36Z" fill="#2e7d32"/>
    <path d="M0,-38 L4,-66" stroke="#2e7d32" stroke-width="6" stroke-linecap="round"/>`,
  mint: `<g transform="rotate(-28)"><ellipse rx="22" ry="52" fill="#43a047"/><line x1="0" y1="-48" x2="0" y2="48" stroke="#a5d6a7" stroke-width="3"/></g>
    <g transform="translate(34,10) rotate(30)"><ellipse rx="19" ry="44" fill="#66bb6a"/><line x1="0" y1="-40" x2="0" y2="40" stroke="#c8e6c9" stroke-width="3"/></g>`,
  leaf: `<g transform="rotate(-20)"><path d="M0,-62 C40,-30 40,30 0,62 C-40,30 -40,-30 0,-62Z" fill="#7cb342"/><line x1="0" y1="-56" x2="0" y2="56" stroke="#dcedc8" stroke-width="3"/>
    ${[-30, -10, 10, 30].map((y) => `<path d="M0,${y} L22,${y - 14} M0,${y} L-22,${y - 14}" stroke="#dcedc8" stroke-width="2"/>`).join('')}</g>`,
  lime: citrusWheel('#558b2f', '#c5e1a5'),
  orange: citrusWheel('#ef6c00', '#ffb74d'),
  mango: `<g transform="rotate(-12)">${[[-26, 0], [6, -18], [10, 18], [36, 0]].map(([x, y], i) => `<rect x="${x - 20}" y="${y - 20}" width="40" height="40" rx="9" fill="${i % 2 ? '#ffb300' : '#ffa000'}"/><rect x="${x - 14}" y="${y - 14}" width="12" height="8" rx="4" fill="#ffe082" fill-opacity="0.7"/>`).join('')}</g>`,
  cacao: `${[[-24, 6, 14], [8, -14, -10], [20, 18, 24]].map(([x, y, r]) => `<rect x="${x - 22}" y="${y - 16}" width="44" height="32" rx="6" transform="rotate(${r} ${x} ${y})" fill="#6d4c41"/><rect x="${x - 18}" y="${y - 12}" width="18" height="10" rx="3" transform="rotate(${r} ${x} ${y})" fill="#a1887f"/>`).join('')}
    <path d="M-40,-30 C-20,-50 10,-46 26,-36" fill="none" stroke="#bcaaa4" stroke-width="7" stroke-linecap="round"/>`,
  dragonfruit: `<circle r="56" fill="#e91e63"/><circle r="48" fill="#fdf5f8"/>
    ${Array.from({ length: 26 }, (_, i) => { const a = i * 2.4; const r = 8 + (i % 6) * 6.5; return `<ellipse cx="${(Math.cos(a) * r).toFixed(1)}" cy="${(Math.sin(a) * r).toFixed(1)}" rx="2.4" ry="3.4" fill="#1b1b1b"/>`; }).join('')}`,
  coconut: `<path d="M-58,0 A58,58 0 0 0 58,0 Z" fill="#5d4037"/><path d="M-50,0 A50,50 0 0 0 50,0 Z" fill="${IVORY}"/><path d="M-40,0 A40,40 0 0 0 40,0 Z" fill="#efe6da"/>
    ${[[-30, 34], [-8, 44], [18, 40], [36, 26]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#3e2723" fill-opacity="0.6"/>`).join('')}`,
  berries: `${[[-28, 8, '#311b92'], [0, -16, '#4527a0'], [24, 10, '#1a237e'], [-4, 22, '#4a148c'], [30, -18, '#283593']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="20" fill="${c}"/><circle cx="${Number(x) - 6}" cy="${Number(y) - 7}" r="5" fill="#ffffff" fill-opacity="0.35"/>`).join('')}`,
};

/**
 * `mirror` flips the drawing horizontally. The 3D ring shows each card's back
 * face, so its texture is mirrored to read correctly from the front.
 */
export function smoothieSvg(item: ArtInput, mirror = false): string {
  const { base, top, accent } = parsePalette(item.palette);
  const bgTop = mix(base, OBSIDIAN, 0.58);
  const bgBottom = mix(base, OBSIDIAN, 0.86);
  const number = item.code.replace(/\D/g, '').slice(-2).padStart(2, '0');
  const garnish = GARNISHES[item.garnish] ?? GARNISHES.mint;
  const id = item.code.replace(/[^a-z0-9]/gi, '');
  const glass = 'M250,340 L286,846 Q289,868 312,868 L488,868 Q511,868 514,846 L550,340 Z';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bgTop}"/><stop offset="1" stop-color="${bgBottom}"/></linearGradient>
    <radialGradient id="glow-${id}" cx="0.5" cy="0.52" r="0.45"><stop offset="0" stop-color="${top}" stop-opacity="0.42"/><stop offset="1" stop-color="${top}" stop-opacity="0"/></radialGradient>
    <linearGradient id="liquid-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${mix(top, base, 0.55)}"/></linearGradient>
    <linearGradient id="deep-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${base}"/><stop offset="1" stop-color="${mix(base, OBSIDIAN, 0.3)}"/></linearGradient>
    <linearGradient id="sheen-${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/><stop offset="0.45" stop-color="#ffffff" stop-opacity="0.02"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.1"/></linearGradient>
    <clipPath id="glass-${id}"><path d="${glass}"/></clipPath>
  </defs>
  <g${mirror ? ` transform="translate(${CARD_WIDTH},0) scale(-1,1)"` : ''}>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bg-${id})"/>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#glow-${id})"/>
  <rect x="34" y="34" width="732" height="972" rx="26" fill="none" stroke="${GOLD}" stroke-opacity="0.6" stroke-width="2"/>
  <rect x="46" y="46" width="708" height="948" rx="20" fill="none" stroke="${GOLD}" stroke-opacity="0.22" stroke-width="1"/>
  <text x="400" y="118" text-anchor="middle" font-family="Didot, 'Bodoni 72', Georgia, serif" font-size="34" letter-spacing="6" fill="${GOLD}">N° ${number}</text>
  <text x="400" y="160" text-anchor="middle" font-family="Futura, 'Century Gothic', Arial, sans-serif" font-size="17" letter-spacing="9" fill="${IVORY}" fill-opacity="0.6">MAISON NECTAR</text>
  <ellipse cx="400" cy="878" rx="180" ry="20" fill="#000000" fill-opacity="0.38"/>
  <g transform="translate(462,215) rotate(13)">
    <rect x="-12" y="0" width="24" height="460" rx="12" fill="${GOLD}"/>
    ${[30, 90, 150].map((y) => `<rect x="-12" y="${y}" width="24" height="26" fill="${IVORY}" fill-opacity="0.85"/>`).join('')}
    <rect x="-12" y="0" width="7" height="460" rx="3" fill="#ffffff" fill-opacity="0.35"/>
  </g>
  <g clip-path="url(#glass-${id})">
    <rect x="200" y="392" width="400" height="500" fill="url(#liquid-${id})"/>
    <path d="M200,610 C290,578 360,640 430,606 S560,584 600,602 L600,900 L200,900 Z" fill="url(#deep-${id})"/>
    <path d="M200,598 C290,566 360,628 430,594 S560,572 600,590" fill="none" stroke="${accent}" stroke-opacity="0.25" stroke-width="5"/>
    <path d="M200,392 L600,392 L600,412 C540,430 470,404 400,420 S270,428 200,410 Z" fill="${accent}" fill-opacity="0.92"/>
    ${[[330, 470, 7], [455, 520, 5], [380, 700, 6], [320, 760, 4], [470, 790, 7], [420, 455, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${accent}" fill-opacity="0.32"/>`).join('')}
  </g>
  <path d="${glass}" fill="url(#sheen-${id})" stroke="#ffffff" stroke-opacity="0.38" stroke-width="4"/>
  <path d="M274,372 L304,820" stroke="#ffffff" stroke-opacity="0.24" stroke-width="14" stroke-linecap="round"/>
  <path d="M520,380 L506,560" stroke="#ffffff" stroke-opacity="0.14" stroke-width="8" stroke-linecap="round"/>
  <ellipse cx="400" cy="340" rx="150" ry="14" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3"/>
  <g transform="translate(548,334)">${garnish}</g>
  <text x="400" y="944" text-anchor="middle" font-family="Didot, 'Bodoni 72', Georgia, serif" font-style="italic" font-size="50" fill="${IVORY}">${escapeXml(item.name)}</text>
  <text x="400" y="984" text-anchor="middle" font-family="Futura, 'Century Gothic', Arial, sans-serif" font-size="19" letter-spacing="8" fill="${GOLD}">${escapeXml(item.category.toUpperCase())}</text>
  </g>
</svg>`;
}

export function smoothieArtUrl(item: ArtInput, mirror = false): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(smoothieSvg(item, mirror))}`;
}
