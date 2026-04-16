import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import type { Character, SortOrder } from './types';
import type { GetCharactersData, GetCharactersVars, ToggleFavoriteData, SoftDeleteData } from './graphql/types';
import { GET_CHARACTERS } from './graphql/queries';
import { TOGGLE_FAVORITE, SOFT_DELETE_CHARACTER } from './graphql/mutations';
import Sidebar from './components/Sidebar';
import CharacterDetail from './components/CharacterDetail';

export default function App() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
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
      refetch();
    },
  });

  const characters: Character[] = data?.characters?.data ?? [];

  const handleSelectCharacter = useCallback((character: Character) => {
    setSelectedCharacter(character);
  }, []);

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

  const handleToggleSort = useCallback(() => {
    setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
  }, []);

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

  if (loading && characters.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading characters...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-white">
      <div className="w-full md:w-80 lg:w-96 h-64 md:h-full shrink-0 overflow-hidden">
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
