import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HeartIcon from '../HeartIcon';

describe('HeartIcon', () => {
  it('renders with the correct aria-label when not filled', () => {
    render(<HeartIcon filled={false} />);
    expect(screen.getByLabelText('Add to favorites')).toBeInTheDocument();
  });

  it('renders with the correct aria-label when filled', () => {
    render(<HeartIcon filled={true} />);
    expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<HeartIcon filled={false} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders the SVG with the correct fill when filled', () => {
    const { container } = render(<HeartIcon filled={true} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', '#63D838');
  });

  it('renders the SVG with no fill when not filled', () => {
    const { container } = render(<HeartIcon filled={false} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'none');
  });

  it('applies the custom size prop', () => {
    const { container } = render(<HeartIcon filled={false} size={32} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });
});
