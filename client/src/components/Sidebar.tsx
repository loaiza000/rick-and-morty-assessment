import { useState, useMemo } from 'react';
import type { Character, CharacterFilterType, SpeciesFilter, SortOrder } from '../types';
import CharacterCard from './CharacterCard';
import FilterPanel from './FilterPanel';

interface SidebarProps {
  characters: Character[];
  selectedCharacter: Character | null;
  onSelectCharacter: (character: Character) => void;
  onToggleFavorite: (characterId: number) => void;
  sortOrder: SortOrder;
  onToggleSort: () => void;
}

export default function Sidebar({
  characters,
  selectedCharacter,
  onSelectCharacter,
  onToggleFavorite,
  sortOrder,
  onToggleSort,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [characterFilter, setCharacterFilter] = useState<CharacterFilterType>('All');
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>('All');

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

    result.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortOrder === 'ASC' ? cmp : -cmp;
    });

    return result;
  }, [characters, searchTerm, speciesFilter, sortOrder]);

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
    setCharacterFilter(cf);
    setSpeciesFilter(sf);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-gray-200">
      <div className="p-4 pb-2">
        <h1 className="text-lg font-bold text-gray-900 mb-3">Rick and Morty list</h1>

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
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple transition-colors"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border cursor-pointer transition-colors relative ${
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
            {activeFilterCount > 0 && !showFilters && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple text-white text-[10px] rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <FilterPanel
          onApplyFilters={handleApplyFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        {activeFilterCount > 0 && (
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs font-medium text-purple">{totalResults} Results</span>
            <span className="text-xs bg-purple-light text-purple px-2 py-0.5 rounded-full">
              {activeFilterCount} Filter{activeFilterCount > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {starred.length > 0 && characterFilter !== 'Others' && (
          <div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Starred Characters ({starred.length})
              </span>
              <button
                onClick={onToggleSort}
                className="text-xs text-gray-400 hover:text-purple cursor-pointer bg-transparent border-none"
                title={`Sort ${sortOrder === 'ASC' ? 'Z-A' : 'A-Z'}`}
              >
                {sortOrder === 'ASC' ? 'A-Z' : 'Z-A'}
              </button>
            </div>
            {starred.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                isSelected={selectedCharacter?.id === character.id}
                onSelect={onSelectCharacter}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}

        {others.length > 0 && characterFilter !== 'Starred' && (
          <div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Characters ({others.length})
              </span>
              {starred.length === 0 && (
                <button
                  onClick={onToggleSort}
                  className="text-xs text-gray-400 hover:text-purple cursor-pointer bg-transparent border-none"
                  title={`Sort ${sortOrder === 'ASC' ? 'Z-A' : 'A-Z'}`}
                >
                  {sortOrder === 'ASC' ? 'A-Z' : 'Z-A'}
                </button>
              )}
            </div>
            {others.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                isSelected={selectedCharacter?.id === character.id}
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
