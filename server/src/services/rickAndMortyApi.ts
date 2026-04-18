import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  RickAndMortyApiCharacter,
  RickAndMortyApiResponse,
  CharacterAttributes,
  CharacterStatus,
  CharacterGender,
} from '../types';

const API_TIMEOUT = 10_000; // 10 seconds

export class RickAndMortyApiService {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: process.env.RICK_AND_MORTY_API_URL,
      timeout: API_TIMEOUT,
      headers: { Accept: 'application/json' },
    });
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  async getCharacters(page = 1): Promise<CharacterAttributes[]> {
    const response = await this.request<RickAndMortyApiResponse>('/character', { page });
    return response.results.map(this.transformCharacter);
  }

  async getCharacterById(id: number): Promise<CharacterAttributes> {
    const raw = await this.request<RickAndMortyApiCharacter>(`/character/${id}`);
    return this.transformCharacter(raw);
  }

  async getMultipleCharacters(ids: number[]): Promise<CharacterAttributes[]> {
    if (ids.length === 0) return [];
    const raw = await this.request<RickAndMortyApiCharacter | RickAndMortyApiCharacter[]>(
      `/character/${ids.join(',')}`,
    );
    const list = Array.isArray(raw) ? raw : [raw];
    return list.map(this.transformCharacter);
  }

  async filterCharacters(filters: {
    name?: string;
    status?: string;
    species?: string;
    gender?: string;
    page?: number;
  }): Promise<RickAndMortyApiResponse> {
    return this.request<RickAndMortyApiResponse>('/character', filters);
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  private async request<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.http.get<T>(path, { params });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, path);
      throw error; // unreachable, handleError always throws
    }
  }

  private handleError(error: AxiosError, path: string): never {
    if (error.code === 'ECONNABORTED') {
      console.error(`[RickMortyAPI] Timeout on ${path}`);
      throw new Error(`External API timeout on ${path}`);
    }

    const status = error.response?.status;
    if (status === 404) {
      console.error(`[RickMortyAPI] Not found: ${path}`);
      throw new Error(`Resource not found: ${path}`);
    }

    console.error(`[RickMortyAPI] Error ${status || 'unknown'} on ${path}:`, error.message);
    throw new Error(`External API error on ${path}: ${error.message}`);
  }

  private transformCharacter = (raw: RickAndMortyApiCharacter): CharacterAttributes => ({
    id: raw.id,
    name: raw.name,
    status: raw.status as CharacterStatus,
    species: raw.species,
    gender: raw.gender as CharacterGender,
    origin: raw.origin.name || '',
    image: raw.image,
  });
}
