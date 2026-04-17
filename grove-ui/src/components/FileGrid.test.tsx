// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import FileGrid from './FileGrid';
import type { FileMeta } from '../types';

const files: FileMeta[] = [
  { id: 'f1', name: 'photo.png', fileMark: 'png', size: 2048, tags: ['vacation'], created: '~2026.1.1', modified: '~2026.1.2', description: '', starred: false, allowed: [] },
  { id: 'f2', name: 'doc.pdf', fileMark: 'pdf', size: 4096, tags: [], created: '~2026.1.1', modified: '~2026.1.2', description: '', starred: true, allowed: [] },
];

function renderGrid(overrides = {}) {
  const props = {
    files,
    activeId: null,
    selectedIds: new Set<string>(),
    onSelect: vi.fn(),
    onToggleSelect: vi.fn(),
    onRangeSelect: vi.fn(),
    onBatchSelect: vi.fn(),
    onToggleStar: vi.fn(),
    onShare: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  };
  render(<FileGrid {...props} />);
  return props;
}

describe('FileGrid', () => {
  afterEach(cleanup);

  it('renders file names', () => {
    renderGrid();
    expect(screen.getByText('photo.png')).toBeTruthy();
    expect(screen.getByText('doc.pdf')).toBeTruthy();
  });

  it('shows empty state when no files', () => {
    renderGrid({ files: [] });
    expect(screen.getByText(/No files here/)).toBeTruthy();
  });

  it('calls onSelect when a card is clicked', () => {
    const props = renderGrid();
    fireEvent.click(screen.getByText('photo.png'));
    expect(props.onSelect).toHaveBeenCalledWith('f1');
  });

  it('calls onToggleStar with the correct file id', () => {
    const props = renderGrid();
    const stars = screen.getAllByText('☆');
    fireEvent.click(stars[0]);
    expect(props.onToggleStar).toHaveBeenCalledWith('f1');
  });

  it('calls onDelete with the correct file id', () => {
    const props = renderGrid();
    const deleteButtons = screen.getAllByText('×');
    fireEvent.click(deleteButtons[0]);
    expect(props.onDelete).toHaveBeenCalledWith('f1');
  });

  it('calls onShare with the correct file id', () => {
    const props = renderGrid();
    const shareButtons = screen.getAllByText('Share');
    fireEvent.click(shareButtons[0]);
    expect(props.onShare).toHaveBeenCalledWith('f1');
  });

  it('shows tags on cards that have them', () => {
    renderGrid();
    expect(screen.getByText('vacation')).toBeTruthy();
  });

  it('shows starred indicator for starred files', () => {
    renderGrid();
    expect(screen.getByText('★')).toBeTruthy();
  });
});
