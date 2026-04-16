// ─── Enums ───────────────────────────────────────────────────────────────────

export enum CharacterStatus {
  Alive = 'Alive',
  Dead = 'Dead',
  Unknown = 'unknown',
}

export enum CharacterGender {
  Female = 'Female',
  Male = 'Male',
  Genderless = 'Genderless',
  Unknown = 'unknown',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

// ─── Value Objects ───────────────────────────────────────────────────────────

export interface OriginLocation {
  name: string;
  url: string;
}

// ─── Domain Interfaces ───────────────────────────────────────────────────────

export interface CharacterAttributes {
  id: number;
  name: string;
  status: CharacterStatus;
  species: string;
  type: string;
  gender: CharacterGender;
  origin: OriginLocation;
  location: OriginLocation;
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface CommentAttributes {
  id: number;
  characterId: number;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FavoriteAttributes {
  id: number;
  characterId: number;
  createdAt?: Date;
}

// ─── Filter / Pagination ─────────────────────────────────────────────────────

export interface CharacterFilter {
  name?: string;
  status?: CharacterStatus;
  species?: string;
  gender?: CharacterGender;
  origin?: string;
}

export interface PaginationArgs {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: SortOrder;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
}

// ─── External API ────────────────────────────────────────────────────────────

export interface RickAndMortyApiCharacter {
  id: number;
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
}

export interface RickAndMortyApiResponse {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: RickAndMortyApiCharacter[];
}

// ─── Service Contracts ──────────────────────────────────────────────────────

export interface ICharacterService {
  findAll(filter?: CharacterFilter, pagination?: PaginationArgs): Promise<PaginatedResult<unknown>>;
  findById(id: number): Promise<unknown | null>;
  findByIdOrFail(id: number): Promise<unknown>;
  findFavorites(): Promise<unknown[]>;
  toggleFavorite(characterId: number): Promise<unknown>;
  softDelete(id: number): Promise<unknown>;
}

export interface ICommentService {
  addComment(characterId: number, content: string): Promise<unknown>;
  getCommentsByCharacterId(characterId: number): Promise<unknown[]>;
  deleteComment(commentId: number): Promise<void>;
}

// ─── GraphQL Context ─────────────────────────────────────────────────────────

export interface GraphQLContext {
  services: {
    characterService: ICharacterService;
    commentService: ICommentService;
  };
}
