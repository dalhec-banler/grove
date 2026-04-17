// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import BulkTagModal from './BulkTagModal';
import type { FileMeta } from '../types';

const files: FileMeta[] = [
  { id: 'f1', name: 'a.png', fileMark: 'png', size: 100, tags: [], created: '~2026.1.1', modified: '~2026.1.1', description: '', starred: false, allowed: [] },
  { id: 'f2', name: 'b.pdf', fileMark: 'pdf', size: 200, tags: [], created: '~2026.1.1', modified: '~2026.1.1', description: '', starred: false, allowed: [] },
];

function renderModal(overrides = {}) {
  const props = {
    files,
    allTags: [] as string[],
    onClose: vi.fn(),
    onApply: vi.fn(),
    ...overrides,
  };
  render(<BulkTagModal {...props} />);
  return props;
}

describe('BulkTagModal', () => {
  afterEach(cleanup);

  it('renders file count in header', () => {
    renderModal();
    expect(screen.getByText('Tag 2 uploads')).toBeTruthy();
  });

  it('lists uploaded files', () => {
    renderModal();
    expect(screen.getAllByText('a.png').length).toBeGreaterThan(0);
    expect(screen.getAllByText('b.pdf').length).toBeGreaterThan(0);
  });

  it('adds a tag via Enter key and enables Apply button', () => {
    const props = renderModal();
    const input = screen.getByPlaceholderText('type a tag and press Enter');
    fireEvent.change(input, { target: { value: 'photos' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('photos')).toBeTruthy();
    // Apply button should now be enabled
    const applyBtn = screen.getByText(/Apply to 2/);
    expect((applyBtn as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(applyBtn);
    expect(props.onApply).toHaveBeenCalledWith({ tags: ['photos'], makePublic: false });
  });

  it('calls onClose when Skip is clicked', () => {
    const props = renderModal();
    fireEvent.click(screen.getByText('Skip'));
    expect(props.onClose).toHaveBeenCalled();
  });

  it('disables Apply when no tags and makePublic is false', () => {
    renderModal();
    const applyBtn = screen.getByText(/Apply to 2/);
    expect((applyBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows suggested tags from allTags', () => {
    renderModal({ allTags: ['work', 'personal'] });
    expect(screen.getByText('+ work')).toBeTruthy();
    expect(screen.getByText('+ personal')).toBeTruthy();
  });

  it('adds a suggested tag when clicked', () => {
    renderModal({ allTags: ['work'] });
    fireEvent.click(screen.getByText('+ work'));
    expect(screen.getByText('work')).toBeTruthy();
  });
});
