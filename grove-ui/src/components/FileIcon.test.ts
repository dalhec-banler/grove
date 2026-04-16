import { describe, it, expect } from 'vitest';
import { category } from './FileIcon';

describe('category', () => {
  it('classifies image formats', () => {
    expect(category('png')).toBe('image');
    expect(category('jpg')).toBe('image');
    expect(category('gif')).toBe('image');
    expect(category('webp')).toBe('image');
    expect(category('svg')).toBe('image');
    expect(category('tiff')).toBe('image');
    expect(category('avif')).toBe('image');
    expect(category('bmp')).toBe('image');
  });

  it('classifies video formats', () => {
    expect(category('mp4')).toBe('video');
    expect(category('mov')).toBe('video');
    expect(category('webm')).toBe('video');
  });

  it('classifies audio formats', () => {
    expect(category('mp3')).toBe('audio');
    expect(category('wav')).toBe('audio');
    expect(category('flac')).toBe('audio');
  });

  it('classifies pdf', () => {
    expect(category('pdf')).toBe('pdf');
  });

  it('classifies text formats', () => {
    expect(category('txt')).toBe('text');
    expect(category('md')).toBe('text');
    expect(category('json')).toBe('text');
    expect(category('hoon')).toBe('text');
  });

  it('classifies archive formats', () => {
    expect(category('zip')).toBe('archive');
    expect(category('tar')).toBe('archive');
    expect(category('gz')).toBe('archive');
  });

  it('returns default for unknown marks', () => {
    expect(category('bin')).toBe('default');
    expect(category('xyz')).toBe('default');
  });

  it('is case-insensitive', () => {
    expect(category('PNG')).toBe('image');
    expect(category('Mp4')).toBe('video');
  });
});
