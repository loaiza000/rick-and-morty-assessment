import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import type { Character } from '../types';
import { ADD_COMMENT } from '../graphql/mutations';
import HeartIcon from './HeartIcon';

interface CharacterDetailProps {
  character: Character;
  onToggleFavorite: (characterId: number) => void;
  onCommentAdded: () => void;
}

export default function CharacterDetail({
  character,
  onToggleFavorite,
  onCommentAdded,
}: CharacterDetailProps) {
  const [commentText, setCommentText] = useState('');

  const [addComment, { loading: addingComment }] = useMutation(ADD_COMMENT, {
    onCompleted: () => {
      setCommentText('');
      onCommentAdded();
    },
  });

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment({
      variables: {
        input: {
          characterId: Number(character.id),
          content: commentText.trim(),
        },
      },
    });
  };

  return (
    <div className="p-8 pt-10">
      <div className="mb-4">
        <div className="relative inline-block">
          <img
            src={character.image}
            alt={character.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm">
            <HeartIcon
              filled={character.isFavorite}
              onClick={() => onToggleFavorite(Number(character.id))}
              size={16}
            />
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6">{character.name}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        <div className="py-4 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-900">Specie</p>
          <p className="text-sm text-gray-500 mt-0.5">{character.species}</p>
        </div>
        <div className="py-4 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-900">Status</p>
          <p className="text-sm text-gray-500 mt-0.5">{character.status}</p>
        </div>
        <div className="py-4 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-900">Gender</p>
          <p className="text-sm text-gray-500 mt-0.5">{character.gender}</p>
        </div>
        <div className="py-4 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-900">Origin</p>
          <p className="text-sm text-gray-500 mt-0.5">{character.origin || 'Unknown'}</p>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Comments</h3>

        {character.comments.length > 0 && (
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {character.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">{comment.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple transition-colors"
          />
          <button
            onClick={handleAddComment}
            disabled={addingComment || !commentText.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-purple rounded-lg hover:bg-purple-dark disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {addingComment ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
