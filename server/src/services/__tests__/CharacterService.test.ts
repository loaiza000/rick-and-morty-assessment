import { Op } from 'sequelize';
import { CharacterService } from '../CharacterService';
import { Character, Comment, Favorite } from '../../models';
import { CacheService } from '../../config/redis';
import { CharacterStatus, CharacterGender, SortOrder } from '../../types';

// Mock the models
jest.mock('../../models', () => ({
  Character: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
  Comment: {},
  Favorite: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock CacheService
const mockCache: jest.Mocked<CacheService> = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  invalidatePattern: jest.fn().mockResolvedValue(undefined),
  buildKey: jest.fn().mockReturnValue('test-key'),
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
} as unknown as jest.Mocked<CacheService>;

describe('CharacterService', () => {
  let service: CharacterService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CharacterService(mockCache);
  });

  describe('findAll', () => {
    const mockRows = [
      { id: 1, name: 'Rick Sanchez', status: 'Alive', species: 'Human', gender: 'Male', origin: 'Earth', image: 'url' },
      { id: 2, name: 'Morty Smith', status: 'Alive', species: 'Human', gender: 'Male', origin: 'Earth', image: 'url' },
    ];

    it('returns paginated characters from the database', async () => {
      (Character.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: mockRows,
        count: 2,
      });

      const result = await service.findAll(undefined, {
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: SortOrder.ASC,
      });

      expect(result.data).toEqual(mockRows);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.hasNextPage).toBe(false);
    });

    it('returns cached result when available', async () => {
      const cachedResult = { data: mockRows, total: 2, page: 1, totalPages: 1, hasNextPage: false };
      mockCache.get.mockResolvedValueOnce(cachedResult);

      const result = await service.findAll();

      expect(result).toEqual(cachedResult);
      expect(Character.findAndCountAll).not.toHaveBeenCalled();
    });

    it('caches the result after querying the database', async () => {
      (Character.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: mockRows,
        count: 2,
      });

      await service.findAll();

      expect(mockCache.set).toHaveBeenCalledTimes(1);
    });

    it('includes comments and favorites in the query', async () => {
      (Character.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: [],
        count: 0,
      });

      await service.findAll();

      const callArgs = (Character.findAndCountAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.include).toEqual([
        { model: Comment, as: 'comments', required: false },
        { model: Favorite, as: 'favorites', required: false },
      ]);
    });

    it('calculates pagination correctly', async () => {
      (Character.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: mockRows,
        count: 50,
      });

      const result = await service.findAll(undefined, {
        page: 2,
        limit: 10,
        sortBy: 'name',
        sortOrder: SortOrder.ASC,
      });

      expect(result.totalPages).toBe(5);
      expect(result.hasNextPage).toBe(true);
      expect(result.page).toBe(2);

      const callArgs = (Character.findAndCountAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.offset).toBe(10);
      expect(callArgs.limit).toBe(10);
    });
  });

  describe('findAll with filters', () => {
    beforeEach(() => {
      (Character.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: [],
        count: 0,
      });
    });

    it('filters by name using iLike', async () => {
      await service.findAll({ name: 'Rick' });

      const callArgs = (Character.findAndCountAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.where).toEqual(
        expect.objectContaining({
          name: { [Op.iLike]: '%Rick%' },
        }),
      );
    });

    it('filters by status with exact match', async () => {
      await service.findAll({ status: CharacterStatus.Alive });

      const callArgs = (Character.findAndCountAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.where).toEqual(
        expect.objectContaining({
          status: CharacterStatus.Alive,
        }),
      );
    });

    it('filters by species using iLike', async () => {
      await service.findAll({ species: 'Human' });

      const callArgs = (Character.findAndCountAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.where).toEqual(
        expect.objectContaining({
          species: { [Op.iLike]: '%Human%' },
        }),
      );
    });

    it('filters by gender with exact match', async () => {
      await service.findAll({ gender: CharacterGender.Male });

      const callArgs = (Character.findAndCountAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.where).toEqual(
        expect.objectContaining({
          gender: CharacterGender.Male,
        }),
      );
    });

    it('filters by origin using iLike', async () => {
      await service.findAll({ origin: 'Earth' });

      const callArgs = (Character.findAndCountAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.where).toEqual(
        expect.objectContaining({
          origin: { [Op.iLike]: '%Earth%' },
        }),
      );
    });

    it('applies multiple filters at once', async () => {
      await service.findAll({
        name: 'Rick',
        status: CharacterStatus.Alive,
        species: 'Human',
      });

      const callArgs = (Character.findAndCountAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.where).toEqual(
        expect.objectContaining({
          name: { [Op.iLike]: '%Rick%' },
          status: CharacterStatus.Alive,
          species: { [Op.iLike]: '%Human%' },
        }),
      );
    });

    it('passes an empty where clause when no filter is provided', async () => {
      await service.findAll();

      const callArgs = (Character.findAndCountAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.where).toEqual({});
    });
  });

  describe('findById', () => {
    it('returns the character from the database', async () => {
      const mockCharacter = { id: 1, name: 'Rick Sanchez' };
      (Character.findByPk as jest.Mock).mockResolvedValue(mockCharacter);

      const result = await service.findById(1);

      expect(result).toEqual(mockCharacter);
      expect(Character.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('returns null when character is not found', async () => {
      (Character.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });

    it('returns cached character when available', async () => {
      const cached = { id: 1, name: 'Rick Sanchez' };
      mockCache.get.mockResolvedValueOnce(cached);

      const result = await service.findById(1);

      expect(result).toEqual(cached);
      expect(Character.findByPk).not.toHaveBeenCalled();
    });
  });

  describe('findFavorites', () => {
    it('returns only favorited characters using INNER JOIN', async () => {
      const mockFavorites = [{ id: 1, name: 'Rick' }];
      (Character.findAll as jest.Mock).mockResolvedValue(mockFavorites);

      const result = await service.findFavorites();

      expect(result).toEqual(mockFavorites);
      const callArgs = (Character.findAll as jest.Mock).mock.calls[0][0];
      const favoriteInclude = callArgs.include.find((i: { as: string }) => i.as === 'favorites');
      expect(favoriteInclude.required).toBe(true);
    });
  });
});
