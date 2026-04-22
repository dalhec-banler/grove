// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import FileDetails from './FileDetails';
import type { FileMeta, CatalogConfig } from '../types';

const file: FileMeta = {
  id: 'f1', name: 'report.pdf', fileMark: 'pdf', size: 5120,
  tags: ['work'], created: '~2026.1.1..10.30.00..0000', modified: '~2026.1.2..14.00.00..0000',
  description: '', starred: false, allowed: ['~zod'], inCatalogs: ['music'],
};

const catalogs = new Map<string, CatalogConfig>([
  ['music', { name: 'Music', description: '', mode: 'public', friends: [], groupFlag: null, files: ['f1'], created: '', modified: '' }],
]);

function renderDetails(overrides = {}) {
  const props = {
    file,
    share: null,
    catalogs,
    onClose: vi.fn(),
    onRename: vi.fn(),
    onAddTags: vi.fn(),
    onRemoveTags: vi.fn(),
    onShare: vi.fn(),
    onUnshare: vi.fn(),
    onShowShare: vi.fn(),
    onSetAllowed: vi.fn(),
    onPublish: vi.fn(),
    onRemoveFromCatalog: vi.fn(),
    ...overrides,
  };
  render(<FileDetails {...props} />);
  return props;
}

describe('FileDetails', () => {
  afterEach(cleanup);

  it('shows file name', () => {
    renderDetails();
    expect(screen.getByText('report.pdf')).toBeTruthy();
  });

  it('shows file type in metadata', () => {
    renderDetails();
    expect(screen.getAllByText('pdf').length).toBeGreaterThan(0);
  });

  it('shows tags', () => {
    renderDetails();
    expect(screen.getAllByText('work').length).toBeGreaterThan(0);
  });

  it('shows allowed ships', () => {
    renderDetails();
    expect(screen.getAllByText('~zod').length).toBeGreaterThan(0);
  });

  it('calls onClose when close button is clicked', () => {
    const props = renderDetails();
    const closeButtons = screen.getAllByText('×');
    fireEvent.click(closeButtons[0]);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('calls onRemoveTags when tag remove button is clicked', () => {
    const props = renderDetails();
    const tagChip = screen.getByText('work').closest('span');
    const removeBtn = tagChip!.querySelector('button')!;
    fireEvent.click(removeBtn);
    expect(props.onRemoveTags).toHaveBeenCalledWith(['work']);
  });

  it('enters rename mode and calls onRename on Enter', () => {
    const props = renderDetails();
    fireEvent.click(screen.getByText('Rename'));
    const input = screen.getByDisplayValue('report.pdf');
    fireEvent.change(input, { target: { value: 'new-name.pdf' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(props.onRename).toHaveBeenCalledWith('new-name.pdf');
  });

  it('adds a tag via Enter key', () => {
    const props = renderDetails();
    const input = screen.getByPlaceholderText('Add tag…');
    fireEvent.change(input, { target: { value: 'urgent' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(props.onAddTags).toHaveBeenCalledWith(['urgent']);
  });

  it('shows catalog membership', () => {
    renderDetails();
    expect(screen.getByText('Music')).toBeTruthy();
  });

  it('calls onPublish when add to catalog button is clicked', () => {
    const props = renderDetails();
    fireEvent.click(screen.getByText('Add to catalog...'));
    expect(props.onPublish).toHaveBeenCalled();
  });

  it('toggles public link checkbox and calls onShare', () => {
    const props = renderDetails();
    const checkbox = screen.getByLabelText('Public link');
    fireEvent.click(checkbox);
    expect(props.onShare).toHaveBeenCalled();
  });
});
