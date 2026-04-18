import { useState, useMemo } from 'react';
import type { Character, CharacterFilterType, SpeciesFilter, SortOrder } from '../types';
import CharacterCard from './CharacterCard';
import FilterPanel from './FilterPanel';

interface SidebarProps {
  characters: Character[];
  selectedCharacter: Character | null;
  onSelectCharacter: (character: Character) => void;
  onToggleFavorite: (characterId: number) => void;
  isMobile?: boolean;
  onOpenFilters?: () => void;
  characterFilter?: CharacterFilterType;
  speciesFilter?: SpeciesFilter;
  onClearFilters?: () => void;
  sortOrder?: SortOrder;
  onToggleSort?: () => void;
}

export default function Sidebar({
  characters,
  selectedCharacter,
  onSelectCharacter,
  onToggleFavorite,
  isMobile = false,
  onOpenFilters,
  characterFilter: externalCharacterFilter,
  speciesFilter: externalSpeciesFilter,
  onClearFilters,
  sortOrder = 'ASC',
  onToggleSort,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [internalCharacterFilter, setInternalCharacterFilter] = useState<CharacterFilterType>('All');
  const [internalSpeciesFilter, setInternalSpeciesFilter] = useState<SpeciesFilter>('All');

  const characterFilter = externalCharacterFilter ?? internalCharacterFilter;
  const speciesFilter = externalSpeciesFilter ?? internalSpeciesFilter;

  const activeFilterCount =
    (characterFilter !== 'All' ? 1 : 0) + (speciesFilter !== 'All' ? 1 : 0);

  const filteredCharacters = useMemo(() => {
    let result = [...characters];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.species.toLowerCase().includes(term),
      );
    }

    if (speciesFilter !== 'All') {
      result = result.filter((c) => c.species === speciesFilter);
    }

    return result;
  }, [characters, searchTerm, speciesFilter]);

  const starred = useMemo(() => {
    if (characterFilter === 'Others') return [];
    return filteredCharacters.filter((c) => c.isFavorite);
  }, [filteredCharacters, characterFilter]);

  const others = useMemo(() => {
    if (characterFilter === 'Starred') return [];
    return filteredCharacters.filter((c) => !c.isFavorite);
  }, [filteredCharacters, characterFilter]);

  const totalResults = starred.length + others.length;

  const handleApplyFilters = (cf: CharacterFilterType, sf: SpeciesFilter) => {
    setInternalCharacterFilter(cf);
    setInternalSpeciesFilter(sf);
  };

  const handleFilterClick = () => {
    if (isMobile && onOpenFilters) {
      onOpenFilters();
    } else {
      setShowFilters(!showFilters);
    }
  };

  const isAdvancedSearch = isMobile && activeFilterCount > 0;

  return (
    <div className="w-full h-full flex flex-col bg-white md:border-r md:border-gray-200">
      <div className="p-4 pb-2">
        {isAdvancedSearch ? (
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onClearFilters}
              className="p-1 cursor-pointer bg-transparent border-none"
              aria-label="Back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F2937" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-base font-semibold text-gray-900">Advanced search</h1>
            <button
              onClick={onClearFilters}
              className="text-sm font-medium text-purple cursor-pointer bg-transparent border-none"
            >
              Done
            </button>
          </div>
        ) : (
          <h1 className="text-xl font-bold text-gray-900 mb-4">Rick and Morty list</h1>
        )}

        {!isAdvancedSearch && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search or filter results"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple transition-colors"
              />
            </div>

            <button
              onClick={onToggleSort}
              className="p-2.5 rounded-lg border cursor-pointer transition-colors bg-white text-gray-500 border-gray-200 hover:border-purple"
              aria-label={sortOrder === 'ASC' ? 'Sort Z to A' : 'Sort A to Z'}
              title={sortOrder === 'ASC' ? 'Sort Z to A' : 'Sort A to Z'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {sortOrder === 'ASC' ? (
                  <>
                    <path d="M3 6h10" />
                    <path d="M3 12h7" />
                    <path d="M3 18h4" />
                    <path d="M17 6v12" />
                    <path d="M21 15l-4 4-4-4" />
                  </>
                ) : (
                  <>
                    <path d="M3 6h4" />
                    <path d="M3 12h7" />
                    <path d="M3 18h10" />
                    <path d="M17 18V6" />
                    <path d="M21 9l-4-4-4 4" />
                  </>
                )}
              </svg>
            </button>

            <button
              onClick={handleFilterClick}
              className={`p-2.5 rounded-lg border cursor-pointer transition-colors relative ${
                showFilters
                  ? 'bg-purple text-white border-purple'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-purple'
              }`}
              aria-label="Toggle filters"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <circle cx="9" cy="6" r="2" fill="currentColor" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <circle cx="15" cy="12" r="2" fill="currentColor" />
                <line x1="4" y1="18" x2="20" y2="18" />
                <circle cx="9" cy="18" r="2" fill="currentColor" />
              </svg>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple text-white text-[10px] rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {showFilters && !isMobile && (
        <FilterPanel
          onApplyFilters={handleApplyFilters}
          onClose={() => setShowFilters(false)}
          initialCharacterFilter={characterFilter}
          initialSpeciesFilter={speciesFilter}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        {activeFilterCount > 0 && (
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm font-medium text-green">{totalResults} Results</span>
            <span className="text-xs bg-purple-light text-purple px-2.5 py-0.5 rounded-full font-medium">
              {activeFilterCount} Filter{activeFilterCount > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {starred.length > 0 && characterFilter !== 'Others' && (
          <div>
            <div className="px-4 pt-4 pb-2">
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
                Starred Characters ({starred.length})
              </span>
            </div>
            {starred.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                isSelected={!isMobile && selectedCharacter?.id === character.id}
                onSelect={onSelectCharacter}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}

        {others.length > 0 && characterFilter !== 'Starred' && (
          <div>
            <div className="px-4 pt-4 pb-2">
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
                Characters ({others.length})
              </span>
            </div>
            {others.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                isSelected={!isMobile && selectedCharacter?.id === character.id}
                onSelect={onSelectCharacter}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}

        {totalResults === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No characters found
          </div>
        )}
      </div>
    </div>
  );
}
