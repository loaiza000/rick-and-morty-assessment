import { Op, WhereOptions } from 'sequelize';
import { Character, Comment, Favorite } from '../models';
import { CacheService } from '../config/redis';
import {
  CharacterFilter,
  PaginationArgs,
  PaginatedResult,
  CharacterAttributes,
  SortOrder,
  ICharacterService,
} from '../types';

const CACHE_PREFIX = 'characters';
const CACHE_SINGLE_PREFIX = 'character';
const CACHE_FAVORITES_KEY = 'favorites:all';

export class CharacterService implements ICharacterService {
  constructor(private readonly cache: CacheService) {}

  // ─── Queries ─────────────────────────────────────────────────────────────

  async findAll(
    filter?: CharacterFilter,
    pagination: PaginationArgs = { page: 1, limit: 20, sortBy: 'name', sortOrder: SortOrder.ASC },
  ): Promise<PaginatedResult<Character>> {
    const cacheKey = this.cache.buildKey(CACHE_PREFIX, {
      ...filter,
      ...pagination,
    });

    const cached = await this.cache.get<PaginatedResult<Character>>(cacheKey);
    if (cached) return cached;

    const where = this.buildWhereClause(filter);
    const offset = (pagination.page - 1) * pagination.limit;

    const { rows, count } = await Character.findAndCountAll({
      where,
      limit: pagination.limit,
      offset,
      order: [[pagination.sortBy, pagination.sortOrder]],
      include: [
        { model: Comment, as: 'comments', required: false },
        { model: Favorite, as: 'favorite', required: false },
      ],
    });

    const totalPages = Math.ceil(count / pagination.limit);
    const result: PaginatedResult<Character> = {
      data: rows,
      total: count,
      page: pagination.page,
      totalPages,
      hasNextPage: pagination.page < totalPages,
    };

    await this.cache.set(cacheKey, result);
    return result;
  }

  async findById(id: number): Promise<Character | null> {
    const cacheKey = `${CACHE_SINGLE_PREFIX}:${id}`;

    const cached = await this.cache.get<Character>(cacheKey);
    if (cached) return cached;

    const character = await Character.findByPk(id, {
      include: [
        { model: Comment, as: 'comments', required: false },
        { model: Favorite, as: 'favorite', required: false },
      ],
    });

    if (character) {
      await this.cache.set(cacheKey, character);
    }

    return character;
  }

  async findFavorites(): Promise<Character[]> {
    const cached = await this.cache.get<Character[]>(CACHE_FAVORITES_KEY);
    if (cached) return cached;

    const characters = await Character.findAll({
      include: [
        { model: Comment, as: 'comments', required: false },
        {
          model: Favorite,
          as: 'favorite',
          required: true, // INNER JOIN — only characters with a favorite record
        },
      ],
    });

    await this.cache.set(CACHE_FAVORITES_KEY, characters);
    return characters;
  }

  // ─── Mutations ───────────────────────────────────────────────────────────

  async toggleFavorite(characterId: number): Promise<Character> {
    const character = await this.findByIdOrFail(characterId);

    const existing = await Favorite.findOne({ where: { characterId } });
    if (existing) {
      await existing.destroy();
    } else {
      await Favorite.create({ characterId });
    }

    await this.invalidateCharacterCache(characterId);

    return this.findByIdOrFail(characterId);
  }

  async softDelete(id: number): Promise<Character> {
    const character = await this.findByIdOrFail(id);
    await character.destroy(); // paranoid soft-delete
    await this.invalidateCharacterCache(id);
    return character;
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  async findByIdOrFail(id: number): Promise<Character> {
    const character = await this.findById(id);
    if (!character) {
      throw new Error(`Character with id ${id} not found`);
    }
    return character;
  }

  private buildWhereClause(filter?: CharacterFilter): WhereOptions<CharacterAttributes> {
    if (!filter) return {};

    const where: WhereOptions<CharacterAttributes> = {};

    if (filter.name) {
      (where as Record<string, unknown>).name = { [Op.iLike]: `%${filter.name}%` };
    }
    if (filter.status) {
      (where as Record<string, unknown>).status = filter.status;
    }
    if (filter.species) {
      (where as Record<string, unknown>).species = { [Op.iLike]: `%${filter.species}%` };
    }
    if (filter.gender) {
      (where as Record<string, unknown>).gender = filter.gender;
    }
    if (filter.origin) {
      (where as Record<string, unknown>).origin = {
        name: { [Op.iLike]: `%${filter.origin}%` },
      };
    }

    return where;
  }

  private async invalidateCharacterCache(characterId: number): Promise<void> {
    await this.cache.del(`${CACHE_SINGLE_PREFIX}:${characterId}`);
    await this.cache.invalidatePattern(`${CACHE_PREFIX}:*`);
    await this.cache.del(CACHE_FAVORITES_KEY);
  }
}
