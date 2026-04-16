import type { Character } from '../types';
import CharacterDetail from './CharacterDetail';

interface MobileDetailScreenProps {
  character: Character;
  onBack: () => void;
  onToggleFavorite: (characterId: number) => void;
  onCommentAdded: () => void;
  onSoftDelete: () => void;
}

export default function MobileDetailScreen({
  character,
  onBack,
  onToggleFavorite,
  onCommentAdded,
  onSoftDelete,
}: MobileDetailScreenProps) {
  return (
    <div className="h-screen flex flex-col bg-white overflow-y-auto">
      <div className="px-4 pt-6 pb-2">
        <button
          onClick={onBack}
          className="p-1 cursor-pointer bg-transparent border-none"
          aria-label="Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F2937" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="flex-1">
        <CharacterDetail
          character={character}
          onToggleFavorite={onToggleFavorite}
          onCommentAdded={onCommentAdded}
        />
        <div className="px-8 pb-8">
          <button
            onClick={onSoftDelete}
            className="text-xs text-red-400 hover:text-red-600 cursor-pointer bg-transparent border-none underline"
          >
            Delete character
          </button>
        </div>
      </div>
    </div>
  );
}
