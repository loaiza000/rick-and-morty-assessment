import type { Character } from '../types';

export interface GetCharactersData {
  characters: {
    data: Character[];
    total: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export interface GetCharactersVars {
  filter?: {
    name?: string;
    status?: string;
    species?: string;
    gender?: string;
    origin?: string;
  };
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetCharacterData {
  character: Character | null;
}

export interface GetFavoritesData {
  favorites: Character[];
}

export interface ToggleFavoriteData {
  toggleFavorite: Character;
}

export interface AddCommentData {
  addComment: {
    id: string;
    characterId: number;
    content: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface SoftDeleteData {
  softDeleteCharacter: {
    id: string;
    name: string;
  };
}
