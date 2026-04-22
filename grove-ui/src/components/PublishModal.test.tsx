// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import PublishModal from './PublishModal';
import type { FileMeta, CatalogConfig } from '../types';

const file: FileMeta = {
  id: 'f1', name: 'doc.pdf', fileMark: 'pdf', size: 1024,
  tags: ['test'], created: '~2026.1.1', modified: '~2026.1.2',
  description: 'A document', starred: false, allowed: [], inCatalogs: [],
};

const catalogs = new Map<string, CatalogConfig>([
  ['music', { name: 'Music', description: '', mode: 'public', friends: [], groupFlag: null, files: [], created: '', modified: '' }],
]);

function renderModal(overrides: Partial<{ onClose: () => void; onPublish: (catalogId: string, args: { displayName: string; tags: string[]; description: string }) => void }> = {}) {
  const onClose = overrides.onClose ?? vi.fn();
  const onPublish = overrides.onPublish ?? vi.fn();
  render(<PublishModal file={file} catalogs={catalogs} onClose={onClose} onPublish={onPublish} />);
  return { onClose, onPublish };
}

describe('PublishModal', () => {
  afterEach(cleanup);

  it('renders with file name as default display name', () => {
    renderModal();
    expect(screen.getByDisplayValue('doc.pdf')).toBeTruthy();
  });

  it('shows existing tags', () => {
    renderModal();
    expect(screen.getAllByText('test').length).toBeGreaterThan(0);
  });

  it('renders heading', () => {
    renderModal();
    expect(screen.getAllByText('Add to catalog').length).toBeGreaterThan(0);
  });

  it('add button is disabled when display name is empty', () => {
    renderModal();
    const input = screen.getByDisplayValue('doc.pdf');
    fireEvent.change(input, { target: { value: '' } });
    const btn = screen.getByText('Add to Catalog');
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it('add button is enabled with display name', () => {
    renderModal();
    const btn = screen.getByText('Add to Catalog');
    expect((btn as HTMLButtonElement).disabled).toBe(false);
  });

  it('calls onPublish with catalog id and correct args', () => {
    const onPublish = vi.fn();
    renderModal({ onPublish });
    fireEvent.click(screen.getByText('Add to Catalog'));
    expect(onPublish).toHaveBeenCalledWith('music', {
      displayName: 'doc.pdf',
      tags: ['test'],
      description: 'A document',
    });
  });

  it('does not call onPublish when display name is empty', () => {
    const onPublish = vi.fn();
    renderModal({ onPublish });
    const input = screen.getByDisplayValue('doc.pdf');
    fireEvent.change(input, { target: { value: '  ' } });
    fireEvent.click(screen.getByText('Add to Catalog'));
    expect(onPublish).not.toHaveBeenCalled();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('adds a tag via Enter key', () => {
    const onPublish = vi.fn();
    renderModal({ onPublish });
    const tagInput = screen.getByPlaceholderText('Add tag...');
    fireEvent.change(tagInput, { target: { value: 'newtag' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    fireEvent.click(screen.getByText('Add to Catalog'));
    expect(onPublish).toHaveBeenCalledWith('music',
      expect.objectContaining({ tags: ['test', 'newtag'] }),
    );
  });

  it('removes a tag when × is clicked', () => {
    const onPublish = vi.fn();
    renderModal({ onPublish });
    const removeButtons = screen.getAllByText('×');
    const tagRemove = removeButtons.find((btn) => btn.closest('.flex.flex-wrap'));
    expect(tagRemove).toBeTruthy();
    fireEvent.click(tagRemove!);
    fireEvent.click(screen.getByText('Add to Catalog'));
    expect(onPublish).toHaveBeenCalledWith('music',
      expect.objectContaining({ tags: [] }),
    );
  });
});
