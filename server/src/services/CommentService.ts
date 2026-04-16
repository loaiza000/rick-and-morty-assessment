import { Comment } from '../models';
import { CacheService } from '../config/redis';
import { ICommentService } from '../types';

const CACHE_CHARACTER_PREFIX = 'character';
const CACHE_CHARACTERS_PREFIX = 'characters';
const CACHE_FAVORITES_KEY = 'favorites:all';

export class CommentService implements ICommentService {
  constructor(private readonly cache: CacheService) {}

  async addComment(characterId: number, content: string): Promise<Comment> {
    if (!content || content.trim().length === 0) {
      throw new Error('Comment content cannot be empty');
    }

    const comment = await Comment.create({ characterId, content: content.trim() });

    await this.invalidateRelatedCache(characterId);

    return comment;
  }

  async getCommentsByCharacterId(characterId: number): Promise<Comment[]> {
    return Comment.findAll({
      where: { characterId },
      order: [['createdAt', 'DESC']],
    });
  }

  async deleteComment(commentId: number): Promise<void> {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      throw new Error(`Comment with id ${commentId} not found`);
    }

    const { characterId } = comment;
    await comment.destroy();
    await this.invalidateRelatedCache(characterId);
  }

  private async invalidateRelatedCache(characterId: number): Promise<void> {
    await this.cache.del(`${CACHE_CHARACTER_PREFIX}:${characterId}`);
    await this.cache.invalidatePattern(`${CACHE_CHARACTERS_PREFIX}:*`);
    await this.cache.del(CACHE_FAVORITES_KEY);
  }
}
