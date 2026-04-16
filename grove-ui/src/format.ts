export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

// Urbit @da format: ~2026.4.15..19.16.25..9c77
export function formatDate(da: string): string {
  const m = da.match(/^~(\d+)\.(\d+)\.(\d+)\.\.(\d+)\.(\d+)/);
  if (!m) return da;
  const [, y, mo, d, h, mi] = m;
  const now = new Date();
  const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));
  const sameDay = dt.toDateString() === now.toDateString();
  if (sameDay) return dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const sameYear = dt.getFullYear() === now.getFullYear();
  return dt.toLocaleDateString([], sameYear
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' });
}

export const IMAGE_MARKS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'avif', 'tiff']);

export function inferMark(filename: string): string {
  if (!filename) return 'bin';
  const parts = filename.split('.');
  if (parts.length === 1) return 'bin';
  return parts.pop()!.toLowerCase() || 'bin';
}

const VIEW_MODES: Set<string> = new Set(['list', 'grid']);

export function parseViewMode(v: string): 'list' | 'grid' {
  return VIEW_MODES.has(v) ? v as 'list' | 'grid' : 'grid';
}

const SHIP_RX = /^~?[a-z]{3,}(-[a-z]{3,})*$/;

export function normalizeShip(s: string): string | null {
  const t = s.trim().toLowerCase().replace(/^~/, '');
  if (!t || !SHIP_RX.test(`~${t}`)) return null;
  return `~${t}`;
}

export function addTag(tags: string[], raw: string): string[] | null {
  const t = raw.trim().toLowerCase();
  if (!t || tags.includes(t)) return null;
  return [...tags, t];
}

export function shortShip(ship: string): string {
  const s = ship.replace(/^~/, '');
  const parts = s.split('-');
  if (parts.length >= 8) return '~' + parts.slice(0, 2).join('-');
  return '~' + s;
}
