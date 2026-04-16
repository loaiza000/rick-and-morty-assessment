import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import type { Character, CharacterFilterType, SpeciesFilter } from './types';
import type { GetCharactersData, GetCharactersVars, ToggleFavoriteData, SoftDeleteData } from './graphql/types';
import { GET_CHARACTERS } from './graphql/queries';
import { TOGGLE_FAVORITE, SOFT_DELETE_CHARACTER } from './graphql/mutations';
import { useIsMobile } from './hooks/useIsMobile';
import Sidebar from './components/Sidebar';
import CharacterDetail from './components/CharacterDetail';
import MobileDetailScreen from './components/MobileDetailScreen';
import MobileFilterScreen from './components/MobileFilterScreen';

type MobileView = 'list' | 'detail' | 'filters';

export default function App() {
  const isMobile = useIsMobile();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>('list');
  const [characterFilter, setCharacterFilter] = useState<CharacterFilterType>('All');
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>('All');

  const { data, loading, refetch } = useQuery<GetCharactersData, GetCharactersVars>(GET_CHARACTERS, {
    variables: {
      page: 1,
      limit: 50,
      sortBy: 'name',
      sortOrder: 'ASC',
    },
  });

  const [toggleFavorite] = useMutation<ToggleFavoriteData>(TOGGLE_FAVORITE, {
    onCompleted: () => {
      refetch();
    },
  });

  const [softDelete] = useMutation<SoftDeleteData>(SOFT_DELETE_CHARACTER, {
    onCompleted: () => {
      setSelectedCharacter(null);
      setMobileView('list');
      refetch();
    },
  });

  const characters: Character[] = data?.characters?.data ?? [];

  const handleSelectCharacter = useCallback((character: Character) => {
    setSelectedCharacter(character);
    if (isMobile) setMobileView('detail');
  }, [isMobile]);

  const handleToggleFavorite = useCallback(
    async (characterId: number) => {
      await toggleFavorite({ variables: { characterId } });
      if (selectedCharacter && Number(selectedCharacter.id) === characterId) {
        const updated = characters.find((c) => Number(c.id) === characterId);
        if (updated) {
          setSelectedCharacter({ ...updated, isFavorite: !updated.isFavorite });
        }
      }
    },
    [toggleFavorite, selectedCharacter, characters],
  );

  const handleCommentAdded = useCallback(() => {
    refetch().then(({ data: newData }) => {
      if (selectedCharacter && newData?.characters?.data) {
        const updated = newData.characters.data.find(
          (c: Character) => c.id === selectedCharacter.id,
        );
        if (updated) setSelectedCharacter(updated);
      }
    });
  }, [refetch, selectedCharacter]);

  const handleSoftDelete = useCallback(() => {
    if (selectedCharacter) {
      softDelete({ variables: { id: Number(selectedCharacter.id) } });
    }
  }, [selectedCharacter, softDelete]);

  const handleApplyMobileFilters = useCallback((cf: CharacterFilterType, sf: SpeciesFilter) => {
    setCharacterFilter(cf);
    setSpeciesFilter(sf);
    setMobileView('list');
  }, []);

  const handleClearFilters = useCallback(() => {
    setCharacterFilter('All');
    setSpeciesFilter('All');
  }, []);

  if (loading && characters.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading characters...</div>
      </div>
    );
  }

  // ─── Mobile layout ──────────────────────────────────────────────────────────
  if (isMobile) {
    if (mobileView === 'filters') {
      return (
        <MobileFilterScreen
          initialCharacterFilter={characterFilter}
          initialSpeciesFilter={speciesFilter}
          onApply={handleApplyMobileFilters}
          onBack={() => setMobileView('list')}
        />
      );
    }

    if (mobileView === 'detail' && selectedCharacter) {
      return (
        <MobileDetailScreen
          character={selectedCharacter}
          onBack={() => setMobileView('list')}
          onToggleFavorite={handleToggleFavorite}
          onCommentAdded={handleCommentAdded}
          onSoftDelete={handleSoftDelete}
        />
      );
    }

    return (
      <div className="h-screen">
        <Sidebar
          characters={characters}
          selectedCharacter={selectedCharacter}
          onSelectCharacter={handleSelectCharacter}
          onToggleFavorite={handleToggleFavorite}
          isMobile
          onOpenFilters={() => setMobileView('filters')}
          characterFilter={characterFilter}
          speciesFilter={speciesFilter}
          onClearFilters={handleClearFilters}
        />
      </div>
    );
  }

  // ─── Desktop layout ─────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex bg-white">
      <div className="w-80 lg:w-96 shrink-0 h-full overflow-hidden">
        <Sidebar
          characters={characters}
          selectedCharacter={selectedCharacter}
          onSelectCharacter={handleSelectCharacter}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>

      <div className="flex-1 overflow-y-auto border-l border-gray-100">
        {selectedCharacter ? (
          <div>
            <CharacterDetail
              character={selectedCharacter}
              onToggleFavorite={handleToggleFavorite}
              onCommentAdded={handleCommentAdded}
            />
            <div className="px-8 pb-8">
              <button
                onClick={handleSoftDelete}
                className="text-xs text-red-400 hover:text-red-600 cursor-pointer bg-transparent border-none underline"
              >
                Delete character
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-sm">Select a character to see details</p>
          </div>
        )}
      </div>
    </div>
  );
}
