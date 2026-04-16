// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PublishModal from './PublishModal';
import type { FileMeta } from '../types';

const file: FileMeta = {
  id: 'f1', name: 'doc.pdf', fileMark: 'pdf', size: 1024,
  tags: ['test'], created: '~2026.1.1', modified: '~2026.1.2',
  description: 'A document', starred: false, allowed: [],
};

describe('PublishModal', () => {
  it('renders with file name as default display name', () => {
    render(<PublishModal file={file} onClose={vi.fn()} onPublish={vi.fn()} />);
    expect(screen.getByDisplayValue('doc.pdf')).toBeTruthy();
  });

  it('shows existing tags', () => {
    render(<PublishModal file={file} onClose={vi.fn()} onPublish={vi.fn()} />);
    expect(screen.getAllByText('test').length).toBeGreaterThan(0);
  });

  it('renders heading', () => {
    render(<PublishModal file={file} onClose={vi.fn()} onPublish={vi.fn()} />);
    expect(screen.getAllByText('Publish to canopy').length).toBeGreaterThan(0);
  });
});
