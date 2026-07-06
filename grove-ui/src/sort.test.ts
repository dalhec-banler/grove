import { describe, it, expect } from 'vitest';
import { sortByKey, parseSortKey } from './sort';

const ACC = {
  name: (x: { n: string }) => x.n,
  date: (x: { d: string }) => x.d,
  size: (x: { s: number }) => x.s,
  type: (x: { t: string }) => x.t,
};

function items() {
  return [
    { n: 'beta', d: '2024-02-01', s: 200, t: 'png' },
    { n: 'alpha', d: '2024-03-01', s: 100, t: 'txt' },
    { n: 'gamma', d: '2024-01-01', s: 300, t: 'png' },
  ];
}

describe('sortByKey', () => {
  it('sorts newest first', () => {
    const r = sortByKey(items(), 'newest', ACC);
    expect(r.map((x) => x.n)).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('sorts oldest first', () => {
    const r = sortByKey(items(), 'oldest', ACC);
    expect(r.map((x) => x.n)).toEqual(['gamma', 'beta', 'alpha']);
  });

  it('sorts name ascending', () => {
    const r = sortByKey(items(), 'name-asc', ACC);
    expect(r.map((x) => x.n)).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('sorts name descending', () => {
    const r = sortByKey(items(), 'name-desc', ACC);
    expect(r.map((x) => x.n)).toEqual(['gamma', 'beta', 'alpha']);
  });

  it('sorts largest first', () => {
    const r = sortByKey(items(), 'largest', ACC);
    expect(r.map((x) => x.s)).toEqual([300, 200, 100]);
  });

  it('sorts smallest first', () => {
    const r = sortByKey(items(), 'smallest', ACC);
    expect(r.map((x) => x.s)).toEqual([100, 200, 300]);
  });

  it('sorts by type then name', () => {
    const r = sortByKey(items(), 'type', ACC);
    expect(r.map((x) => x.n)).toEqual(['beta', 'gamma', 'alpha']);
  });

  // Locks H8: raw Urbit @da is NOT zero-padded, so a lexicographic compare puts
  // "Apr 15" before "Apr 9" and December before September. Uses a 2-digit day and
  // a 2-digit month vs 1-digit to catch exactly that (single-digit-only tests missed it).
  it('sorts @da dates numerically, not lexicographically', () => {
    const list = [
      { n: 'apr9',  d: '~2026.4.9..00.00.00',  s: 1, t: 'x' },
      { n: 'apr15', d: '~2026.4.15..00.00.00', s: 1, t: 'x' },
      { n: 'dec1',  d: '~2026.12.1..00.00.00', s: 1, t: 'x' },
      { n: 'sep1',  d: '~2026.9.1..00.00.00',  s: 1, t: 'x' },
    ];
    // Chronological: Apr 9 < Apr 15 < Sep 1 < Dec 1.
    expect(sortByKey(list, 'newest', ACC).map((x) => x.n)).toEqual(['dec1', 'sep1', 'apr15', 'apr9']);
    expect(sortByKey(list, 'oldest', ACC).map((x) => x.n)).toEqual(['apr9', 'apr15', 'sep1', 'dec1']);
  });

  it('does not mutate input', () => {
    const orig = items();
    sortByKey(orig, 'newest', ACC);
    expect(orig.map((x) => x.n)).toEqual(['beta', 'alpha', 'gamma']);
  });
});

describe('parseSortKey', () => {
  it('returns valid keys', () => {
    expect(parseSortKey('newest')).toBe('newest');
    expect(parseSortKey('name-asc')).toBe('name-asc');
    expect(parseSortKey('type')).toBe('type');
  });

  it('defaults to newest for invalid keys', () => {
    expect(parseSortKey('invalid')).toBe('newest');
    expect(parseSortKey('')).toBe('newest');
  });
});
