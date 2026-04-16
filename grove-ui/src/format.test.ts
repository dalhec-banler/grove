import { describe, it, expect } from 'vitest';
import { formatBytes, formatDate, IMAGE_MARKS, inferMark, normalizeShip, addTag } from './format';

describe('formatBytes', () => {
  it('formats bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
    expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });

  it('formats gigabytes', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
  });
});

describe('formatDate', () => {
  it('returns original string for non-Urbit dates', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });

  it('parses Urbit @da format', () => {
    const result = formatDate('~2023.6.15..14.30.00..abcd');
    expect(result).toBeTruthy();
    expect(result).not.toBe('~2023.6.15..14.30.00..abcd');
  });
});

describe('inferMark', () => {
  it('returns extension as mark', () => {
    expect(inferMark('photo.png')).toBe('png');
    expect(inferMark('document.pdf')).toBe('pdf');
    expect(inferMark('archive.tar.gz')).toBe('gz');
  });

  it('lowercases the extension', () => {
    expect(inferMark('PHOTO.PNG')).toBe('png');
    expect(inferMark('file.JPG')).toBe('jpg');
  });

  it('returns bin for files without extension', () => {
    expect(inferMark('noext')).toBe('bin');
    expect(inferMark('')).toBe('bin');
  });
});

describe('IMAGE_MARKS', () => {
  it('includes common image types', () => {
    expect(IMAGE_MARKS.has('png')).toBe(true);
    expect(IMAGE_MARKS.has('jpg')).toBe(true);
    expect(IMAGE_MARKS.has('gif')).toBe(true);
    expect(IMAGE_MARKS.has('webp')).toBe(true);
    expect(IMAGE_MARKS.has('svg')).toBe(true);
  });

  it('excludes non-image types', () => {
    expect(IMAGE_MARKS.has('pdf')).toBe(false);
    expect(IMAGE_MARKS.has('mp4')).toBe(false);
    expect(IMAGE_MARKS.has('txt')).toBe(false);
  });
});

describe('normalizeShip', () => {
  it('normalizes valid ship names', () => {
    expect(normalizeShip('~zod')).toBe('~zod');
    expect(normalizeShip('zod')).toBe('~zod');
    expect(normalizeShip('  ~sampel-palnet  ')).toBe('~sampel-palnet');
  });

  it('rejects invalid ship names', () => {
    expect(normalizeShip('')).toBeNull();
    expect(normalizeShip('   ')).toBeNull();
    expect(normalizeShip('ab')).toBeNull();
    expect(normalizeShip('123')).toBeNull();
    expect(normalizeShip('UPPER')).toBe('~upper');
  });

  it('handles case normalization', () => {
    expect(normalizeShip('~ZOD')).toBe('~zod');
    expect(normalizeShip('Sampel-Palnet')).toBe('~sampel-palnet');
  });
});

describe('addTag', () => {
  it('adds a new tag', () => {
    expect(addTag([], 'photo')).toEqual(['photo']);
    expect(addTag(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('trims and lowercases', () => {
    expect(addTag([], '  Photo  ')).toEqual(['photo']);
  });

  it('returns null for duplicates', () => {
    expect(addTag(['photo'], 'photo')).toBeNull();
    expect(addTag(['photo'], '  PHOTO  ')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(addTag([], '')).toBeNull();
    expect(addTag([], '   ')).toBeNull();
  });
});
