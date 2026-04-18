import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import type { Character, CharacterFilterType, SpeciesFilter, SortOrder } from './types';
import type { GetCharactersData, GetCharactersVars, ToggleFavoriteData, SoftDeleteData } from './graphql/types';
import { GET_CHARACTERS } from './graphql/queries';
import { TOGGLE_FAVORITE, SOFT_DELETE_CHARACTER } from './graphql/mutations';
import { useIsMobile } from './hooks/useIsMobile';
import Sidebar from './components/Sidebar';
import CharacterDetail from './components/CharacterDetail';
import MobileDetailScreen from './components/MobileDetailScreen';
import MobileFilterScreen from './components/MobileFilterScreen';

type MobileView = 'list' | 'filters';

function CharacterPage() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>('list');
  const [characterFilter, setCharacterFilter] = useState<CharacterFilterType>('All');
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC');

  const { data, loading, refetch } = useQuery<GetCharactersData, GetCharactersVars>(GET_CHARACTERS, {
    variables: {
      page: 1,
      limit: 50,
      sortBy: 'name',
      sortOrder,
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
      navigate('/');
      refetch();
    },
  });

  const characters: Character[] = data?.characters?.data ?? [];

  // Sync selected character from URL param
  useEffect(() => {
    if (id && characters.length > 0) {
      const found = characters.find((c) => c.id === id);
      if (found) setSelectedCharacter(found);
    } else if (!id) {
      setSelectedCharacter(null);
    }
  }, [id, characters]);

  const handleSelectCharacter = useCallback((character: Character) => {
    setSelectedCharacter(character);
    navigate(`/character/${character.id}`);
  }, [navigate]);

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

  const handleToggleSort = useCallback(() => {
    setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
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

    if (id && selectedCharacter) {
      return (
        <MobileDetailScreen
          character={selectedCharacter}
          onBack={() => navigate('/')}
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
          sortOrder={sortOrder}
          onToggleSort={handleToggleSort}
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
          sortOrder={sortOrder}
          onToggleSort={handleToggleSort}
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CharacterPage />} />
      <Route path="/character/:id" element={<CharacterPage />} />
    </Routes>
  );
}
