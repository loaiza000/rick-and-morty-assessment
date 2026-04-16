import { useState } from 'react';
import type { CharacterFilterType, SpeciesFilter } from '../types';

interface FilterPanelProps {
  onApplyFilters: (characterFilter: CharacterFilterType, speciesFilter: SpeciesFilter) => void;
  onClose: () => void;
  initialCharacterFilter?: CharacterFilterType;
  initialSpeciesFilter?: SpeciesFilter;
}

export default function FilterPanel({ onApplyFilters, onClose, initialCharacterFilter = 'All', initialSpeciesFilter = 'All' }: FilterPanelProps) {
  const [characterFilter, setCharacterFilter] = useState<CharacterFilterType>(initialCharacterFilter);
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>(initialSpeciesFilter);

  const characterOptions: CharacterFilterType[] = ['All', 'Starred', 'Others'];
  const speciesOptions: SpeciesFilter[] = ['All', 'Human', 'Alien'];

  const hasActiveFilter = characterFilter !== 'All' || speciesFilter !== 'All';

  const handleApply = () => {
    onApplyFilters(characterFilter, speciesFilter);
    onClose();
  };

  return (
    <div className="px-4 py-3 border-b border-gray-200">
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-2">Character</p>
        <div className="flex gap-2">
          {characterOptions.map((option) => (
            <button
              key={option}
              onClick={() => setCharacterFilter(option)}
              className={`px-3 py-1.5 text-xs rounded-lg border cursor-pointer transition-colors ${
                characterFilter === option
                  ? 'bg-purple-light text-purple border-purple-light'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-purple-light'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-2">Specie</p>
        <div className="flex gap-2">
          {speciesOptions.map((option) => (
            <button
              key={option}
              onClick={() => setSpeciesFilter(option)}
              className={`px-3 py-1.5 text-xs rounded-lg border cursor-pointer transition-colors ${
                speciesFilter === option
                  ? 'bg-purple-light text-purple border-purple-light'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-purple-light'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleApply}
        className={`w-full py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
          hasActiveFilter
            ? 'bg-purple text-white hover:bg-purple-dark'
            : 'bg-gray-100 text-gray-500 border border-gray-200'
        }`}
      >
        Filter
      </button>
    </div>
  );
}
