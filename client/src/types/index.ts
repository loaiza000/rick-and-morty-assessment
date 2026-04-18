export interface Comment {
  id: string;
  characterId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  name: string;
  status: string;
  species: string;
  gender: string;
  origin: string;
  image: string;
  isFavorite: boolean;
  comments: Comment[];
}

export interface PaginatedCharacters {
  data: Character[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
}

export type CharacterFilterType = 'All' | 'Starred' | 'Others';
export type SpeciesFilter = 'All' | 'Human' | 'Alien';
export type SortOrder = 'ASC' | 'DESC';
