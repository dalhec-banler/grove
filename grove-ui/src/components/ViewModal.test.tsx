// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);
import ViewModal from './ViewModal';

describe('ViewModal', () => {
  it('renders new view form when initial is null', () => {
    render(<ViewModal initial={null} allTags={['photo', 'doc']} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByText('New view')).toBeTruthy();
  });

  it('renders edit form when initial view is provided', () => {
    const view = { name: 'Photos', tags: ['photo'], color: '#3A6BC5' };
    render(<ViewModal initial={view} allTags={['photo', 'doc']} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByText('Edit view')).toBeTruthy();
    expect(screen.getByDisplayValue('Photos')).toBeTruthy();
  });

  it('renders save button', () => {
    render(<ViewModal initial={null} allTags={[]} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getAllByText('Save').length).toBeGreaterThan(0);
  });

  it('calls onSave with name, tags, and color when form submitted', () => {
    const onSave = vi.fn();
    render(<ViewModal initial={null} allTags={['photo', 'doc']} onClose={vi.fn()} onSave={onSave} />);
    fireEvent.change(screen.getByPlaceholderText('photos'), { target: { value: 'My Photos' } });
    fireEvent.click(screen.getByText('+ photo'));
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledWith('My Photos', ['photo'], '#3A6BC5');
  });

  it('calls onClose when cancel clicked', () => {
    const onClose = vi.fn();
    render(<ViewModal initial={null} allTags={[]} onClose={onClose} onSave={vi.fn()} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('disables save when name is empty', () => {
    render(<ViewModal initial={null} allTags={['photo']} onClose={vi.fn()} onSave={vi.fn()} />);
    fireEvent.click(screen.getByText('+ photo'));
    const saveBtn = screen.getAllByText('Save').find((el) => el.tagName === 'BUTTON') as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(true);
  });
});
