export interface OriginLocation {
  name: string;
  url: string;
}

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
  type: string;
  gender: string;
  origin: OriginLocation;
  location: OriginLocation;
  image: string;
  episode: string[];
  url: string;
  created: string;
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
