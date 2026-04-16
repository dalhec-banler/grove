// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
