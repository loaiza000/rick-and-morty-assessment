import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CharacterCard from '../CharacterCard';
import type { Character } from '../../types';

const mockCharacter: Character = {
  id: '1',
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  gender: 'Male',
  origin: 'Earth (C-137)',
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  isFavorite: false,
  comments: [],
};

describe('CharacterCard', () => {
  it('renders the character name and species', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        isSelected={false}
        onSelect={vi.fn()}
        onToggleFavorite={vi.fn()}
      />,
    );
    expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    expect(screen.getByText('Human')).toBeInTheDocument();
  });

  it('renders the character image with correct alt text', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        isSelected={false}
        onSelect={vi.fn()}
        onToggleFavorite={vi.fn()}
      />,
    );
    const img = screen.getByAltText('Rick Sanchez');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockCharacter.image);
  });

  it('calls onSelect when the card is clicked', () => {
    const onSelect = vi.fn();
    render(
      <CharacterCard
        character={mockCharacter}
        isSelected={false}
        onSelect={onSelect}
        onToggleFavorite={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Rick Sanchez'));
    expect(onSelect).toHaveBeenCalledWith(mockCharacter);
  });

  it('calls onToggleFavorite when the heart icon is clicked without triggering onSelect', () => {
    const onSelect = vi.fn();
    const onToggleFavorite = vi.fn();
    render(
      <CharacterCard
        character={mockCharacter}
        isSelected={false}
        onSelect={onSelect}
        onToggleFavorite={onToggleFavorite}
      />,
    );
    fireEvent.click(screen.getByLabelText('Add to favorites'));
    expect(onToggleFavorite).toHaveBeenCalledWith(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('shows a filled heart when the character is a favorite', () => {
    const favoriteCharacter = { ...mockCharacter, isFavorite: true };
    render(
      <CharacterCard
        character={favoriteCharacter}
        isSelected={false}
        onSelect={vi.fn()}
        onToggleFavorite={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument();
  });
});
