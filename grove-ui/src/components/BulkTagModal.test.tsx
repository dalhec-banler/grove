// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BulkTagModal from './BulkTagModal';
import type { FileMeta } from '../types';

const files: FileMeta[] = [
  { id: 'f1', name: 'a.png', fileMark: 'png', size: 100, tags: [], created: '~2026.1.1', modified: '~2026.1.1', description: '', starred: false, allowed: [] },
  { id: 'f2', name: 'b.pdf', fileMark: 'pdf', size: 200, tags: [], created: '~2026.1.1', modified: '~2026.1.1', description: '', starred: false, allowed: [] },
];

describe('BulkTagModal', () => {
  it('renders file count in header', () => {
    render(<BulkTagModal files={files} allTags={[]} onClose={vi.fn()} onApply={vi.fn()} />);
    expect(screen.getByText('Tag 2 uploads')).toBeTruthy();
  });

  it('lists uploaded files', () => {
    render(<BulkTagModal files={files} allTags={[]} onClose={vi.fn()} onApply={vi.fn()} />);
    expect(screen.getAllByText('a.png').length).toBeGreaterThan(0);
    expect(screen.getAllByText('b.pdf').length).toBeGreaterThan(0);
  });
});
