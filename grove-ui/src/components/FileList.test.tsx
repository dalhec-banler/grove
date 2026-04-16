// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);
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

  it('calls onToggleStar when star button clicked', () => {
    const onToggleStar = vi.fn();
    render(<FileList files={files} activeId={null} onSelect={vi.fn()} onToggleStar={onToggleStar} onShare={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getAllByTitle('Unstar')[0]);
    expect(onToggleStar).toHaveBeenCalledWith('f1');
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(<FileList files={files} activeId={null} onSelect={vi.fn()} onToggleStar={vi.fn()} onShare={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getAllByText('Delete')[0]);
    expect(onDelete).toHaveBeenCalledWith('f1');
  });

  it('calls onSelect when row clicked', () => {
    const onSelect = vi.fn();
    render(<FileList files={files} activeId={null} onSelect={onSelect} onToggleStar={vi.fn()} onShare={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getAllByText('photo.png')[0]);
    expect(onSelect).toHaveBeenCalledWith('f1');
  });
});
