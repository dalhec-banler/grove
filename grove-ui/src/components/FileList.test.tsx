// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FileList from './FileList';
import type { FileMeta } from '../types';

const files: FileMeta[] = [
  { id: 'f1', name: 'photo.png', fileMark: 'png', size: 1024, tags: ['art'], created: '~2026.1.1', modified: '~2026.1.2', description: '', starred: true, allowed: [] },
];

describe('FileList', () => {
  it('renders file names', () => {
    render(<FileList files={files} activeId={null} onSelect={vi.fn()} onToggleStar={vi.fn()} onShare={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('photo.png')).toBeTruthy();
  });

  it('shows empty state when no files', () => {
    render(<FileList files={[]} activeId={null} onSelect={vi.fn()} onToggleStar={vi.fn()} onShare={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/No files here/)).toBeTruthy();
  });
});
