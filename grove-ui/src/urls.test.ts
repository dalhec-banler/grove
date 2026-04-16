import { describe, it, expect } from 'vitest';
import { fileUrl, remoteFileUrl } from './urls';

describe('fileUrl', () => {
  it('builds local file URL', () => {
    expect(fileUrl('abc123')).toBe('/grove-file/abc123');
  });
});

describe('remoteFileUrl', () => {
  it('normalizes owner with tilde', () => {
    expect(remoteFileUrl('~zod', 'abc')).toBe('/grove-remote-file/~zod/abc');
  });

  it('adds tilde to owner without one', () => {
    expect(remoteFileUrl('zod', 'abc')).toBe('/grove-remote-file/~zod/abc');
  });

  it('does not double-tilde', () => {
    expect(remoteFileUrl('~sampel-palnet', 'xyz')).toBe('/grove-remote-file/~sampel-palnet/xyz');
  });
});
