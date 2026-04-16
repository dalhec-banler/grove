import { describe, it, expect } from 'vitest';
import { GRID_STYLE } from './styles';

describe('GRID_STYLE', () => {
  it('defines a responsive grid template', () => {
    expect(GRID_STYLE.gridTemplateColumns).toBe('repeat(auto-fill, minmax(180px, 1fr))');
  });
});
