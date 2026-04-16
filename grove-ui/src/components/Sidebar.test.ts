import { describe, it, expect } from 'vitest';
import { shortShip } from './Sidebar';

describe('shortShip', () => {
  it('returns galaxy unchanged', () => {
    expect(shortShip('~zod')).toBe('~zod');
  });

  it('returns star unchanged', () => {
    expect(shortShip('~marzod')).toBe('~marzod');
  });

  it('returns planet unchanged', () => {
    expect(shortShip('~sampel-palnet')).toBe('~sampel-palnet');
  });

  it('truncates moon to first two parts', () => {
    expect(shortShip('~midlut-sarseb-palrum-roclur')).toBe('~midlut-sarseb-palrum-roclur');
  });

  it('truncates comet (8+ parts) to first two parts', () => {
    expect(shortShip('~dozryt-parvex-modzod-finlux-nopfed-rivnyx-sapbur-nopfed')).toBe('~dozryt-parvex');
  });

  it('handles input without tilde', () => {
    expect(shortShip('zod')).toBe('~zod');
  });
});
