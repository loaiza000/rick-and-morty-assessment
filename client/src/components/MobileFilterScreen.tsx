import { useState } from 'react';
import type { CharacterFilterType, SpeciesFilter } from '../types';

interface MobileFilterScreenProps {
  initialCharacterFilter: CharacterFilterType;
  initialSpeciesFilter: SpeciesFilter;
  onApply: (characterFilter: CharacterFilterType, speciesFilter: SpeciesFilter) => void;
  onBack: () => void;
}

export default function MobileFilterScreen({
  initialCharacterFilter,
  initialSpeciesFilter,
  onApply,
  onBack,
}: MobileFilterScreenProps) {
  const [characterFilter, setCharacterFilter] = useState<CharacterFilterType>(initialCharacterFilter);
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>(initialSpeciesFilter);

  const characterOptions: CharacterFilterType[] = ['All', 'Starred', 'Others'];
  const speciesOptions: SpeciesFilter[] = ['All', 'Human', 'Alien'];

  const hasActiveFilter = characterFilter !== 'All' || speciesFilter !== 'All';

  const handleApply = () => {
    onApply(characterFilter, speciesFilter);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="flex items-center px-4 pt-6 pb-4">
        <button
          onClick={onBack}
          className="p-1 cursor-pointer bg-transparent border-none"
          aria-label="Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F2937" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-base font-semibold text-gray-900 pr-8">Filters</h1>
      </div>

      <div className="flex-1 px-6">
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-3">Characters</p>
          <div className="flex gap-2">
            {characterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setCharacterFilter(option)}
                className={`flex-1 py-2 text-sm rounded-lg border cursor-pointer transition-colors ${
                  characterFilter === option
                    ? 'bg-purple-light text-purple border-purple-light font-medium'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-3">Specie</p>
          <div className="flex gap-2">
            {speciesOptions.map((option) => (
              <button
                key={option}
                onClick={() => setSpeciesFilter(option)}
                className={`flex-1 py-2 text-sm rounded-lg border cursor-pointer transition-colors ${
                  speciesFilter === option
                    ? 'bg-purple-light text-purple border-purple-light font-medium'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 pb-8">
        <button
          onClick={handleApply}
          className={`w-full py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${
            hasActiveFilter
              ? 'bg-purple text-white'
              : 'bg-gray-100 text-gray-400 border border-gray-200'
          }`}
        >
          Filter
        </button>
      </div>
    </div>
  );
}
