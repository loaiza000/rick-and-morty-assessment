import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FilterPanel from '../FilterPanel';

describe('FilterPanel', () => {
  it('renders character filter options', () => {
    render(<FilterPanel onApplyFilters={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getAllByText('All')).toHaveLength(2);
    expect(screen.getByText('Starred')).toBeInTheDocument();
    expect(screen.getByText('Others')).toBeInTheDocument();
  });

  it('renders species filter options', () => {
    render(<FilterPanel onApplyFilters={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('Human')).toBeInTheDocument();
    expect(screen.getByText('Alien')).toBeInTheDocument();
  });

  it('renders the Filter button', () => {
    render(<FilterPanel onApplyFilters={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('calls onApplyFilters and onClose when Filter button is clicked', () => {
    const onApplyFilters = vi.fn();
    const onClose = vi.fn();
    render(<FilterPanel onApplyFilters={onApplyFilters} onClose={onClose} />);
    fireEvent.click(screen.getByText('Filter'));
    expect(onApplyFilters).toHaveBeenCalledWith('All', 'All');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies the selected character filter', () => {
    const onApplyFilters = vi.fn();
    render(<FilterPanel onApplyFilters={onApplyFilters} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Starred'));
    fireEvent.click(screen.getByText('Filter'));
    expect(onApplyFilters).toHaveBeenCalledWith('Starred', 'All');
  });

  it('applies the selected species filter', () => {
    const onApplyFilters = vi.fn();
    render(<FilterPanel onApplyFilters={onApplyFilters} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Alien'));
    fireEvent.click(screen.getByText('Filter'));
    expect(onApplyFilters).toHaveBeenCalledWith('All', 'Alien');
  });

  it('initializes with provided filter values', () => {
    const onApplyFilters = vi.fn();
    render(
      <FilterPanel
        onApplyFilters={onApplyFilters}
        onClose={vi.fn()}
        initialCharacterFilter="Starred"
        initialSpeciesFilter="Human"
      />,
    );
    fireEvent.click(screen.getByText('Filter'));
    expect(onApplyFilters).toHaveBeenCalledWith('Starred', 'Human');
  });
});
