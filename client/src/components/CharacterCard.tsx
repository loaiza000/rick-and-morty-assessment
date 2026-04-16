import type { Character } from '../types';
import HeartIcon from './HeartIcon';

interface CharacterCardProps {
  character: Character;
  isSelected: boolean;
  onSelect: (character: Character) => void;
  onToggleFavorite: (characterId: number) => void;
}

export default function CharacterCard({
  character,
  isSelected,
  onSelect,
  onToggleFavorite,
}: CharacterCardProps) {
  return (
    <div
      onClick={() => onSelect(character)}
      className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-purple-light border-l-2 border-l-purple'
          : 'hover:bg-gray-50 border-l-2 border-l-transparent'
      }`}
    >
      <img
        src={character.image}
        alt={character.name}
        className="w-9 h-9 rounded-full object-cover mr-3 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{character.name}</p>
        <p className="text-xs text-gray-400">{character.species}</p>
      </div>
      <HeartIcon
        filled={character.isFavorite}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(Number(character.id));
        }}
        size={20}
      />
    </div>
  );
}
