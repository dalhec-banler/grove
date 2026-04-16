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
