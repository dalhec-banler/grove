import { describe, it, expect } from 'vitest';
import { inferMark } from './format';
import { fileUrl, remoteFileUrl } from './urls';

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

describe('fileUrl', () => {
  it('builds local file URL', () => {
    expect(fileUrl('abc123')).toBe('/grove-file/abc123');
  });
});

describe('remoteFileUrl', () => {
  it('builds remote file URL with tilde', () => {
    expect(remoteFileUrl('~zod', 'abc')).toBe('/grove-remote-file/~zod/abc');
  });

  it('handles owner without tilde', () => {
    expect(remoteFileUrl('zod', 'abc')).toBe('/grove-remote-file/~zod/abc');
  });

  it('does not double-tilde', () => {
    expect(remoteFileUrl('~sampel-palnet', 'xyz')).toBe('/grove-remote-file/~sampel-palnet/xyz');
  });
});
