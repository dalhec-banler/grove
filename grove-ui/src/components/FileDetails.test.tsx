// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FileDetails from './FileDetails';
import type { FileMeta } from '../types';

const file: FileMeta = {
  id: 'f1', name: 'report.pdf', fileMark: 'pdf', size: 5120,
  tags: ['work'], created: '~2026.1.1..10.30.00..0000', modified: '~2026.1.2..14.00.00..0000',
  description: '', starred: false, allowed: ['~zod'],
};

describe('FileDetails', () => {
  const props = {
    file,
    share: null,
    published: false,
    onClose: vi.fn(),
    onRename: vi.fn(),
    onAddTags: vi.fn(),
    onRemoveTags: vi.fn(),
    onShare: vi.fn(),
    onUnshare: vi.fn(),
    onShowShare: vi.fn(),
    onSetAllowed: vi.fn(),
    onPublish: vi.fn(),
    onUnpublish: vi.fn(),
  };

  it('shows file name', () => {
    render(<FileDetails {...props} />);
    expect(screen.getByText('report.pdf')).toBeTruthy();
  });

  it('shows file type in metadata', () => {
    render(<FileDetails {...props} />);
    expect(screen.getAllByText('pdf').length).toBeGreaterThan(0);
  });

  it('shows tags', () => {
    render(<FileDetails {...props} />);
    expect(screen.getAllByText('work').length).toBeGreaterThan(0);
  });

  it('shows allowed ships', () => {
    render(<FileDetails {...props} />);
    expect(screen.getAllByText('~zod').length).toBeGreaterThan(0);
  });
});
