import { GraphQLContext, CharacterFilter, SortOrder } from '../types';
import { Favorite } from '../models';

// ─── Resolver type helpers ───────────────────────────────────────────────────

export interface CharactersArgs {
  filter?: CharacterFilter;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: SortOrder;
}

export interface CommentInput {
  characterId: number;
  content: string;
}

// ─── Resolvers ───────────────────────────────────────────────────────────────

export const characterResolvers = {
  Query: {
    characters: (
      _parent: unknown,
      { filter, page, limit, sortBy, sortOrder }: CharactersArgs,
      { services }: GraphQLContext,
    ) => {
      return services.characterService.findAll(filter, { page, limit, sortBy, sortOrder });
    },

    character: (
      _parent: unknown,
      { id }: { id: number },
      { services }: GraphQLContext,
    ) => {
      return services.characterService.findById(id);
    },

    favorites: (
      _parent: unknown,
      _args: unknown,
      { services }: GraphQLContext,
    ) => {
      return services.characterService.findFavorites();
    },
  },

  Mutation: {
    addComment: async (
      _parent: unknown,
      { input }: { input: CommentInput },
      { services }: GraphQLContext,
    ) => {
      await services.characterService.findByIdOrFail(input.characterId);
      return services.commentService.addComment(input.characterId, input.content);
    },

    toggleFavorite: (
      _parent: unknown,
      { characterId }: { characterId: number },
      { services }: GraphQLContext,
    ) => {
      return services.characterService.toggleFavorite(characterId);
    },

    softDeleteCharacter: (
      _parent: unknown,
      { id }: { id: number },
      { services }: GraphQLContext,
    ) => {
      return services.characterService.softDelete(id);
    },
  },

  // ─── Field resolvers ────────────────────────────────────────────────────

  Character: {
    isFavorite: async (parent: { id: number; favorites?: unknown[] }) => {
      if (parent.favorites !== undefined) {
        return Array.isArray(parent.favorites) && parent.favorites.length > 0;
      }
      const fav = await Favorite.findOne({ where: { characterId: parent.id } });
      return fav !== null;
    },

    comments: async (
      parent: { id: number; comments?: unknown[] },
      _args: unknown,
      { services }: GraphQLContext,
    ) => {
      if (parent.comments) return parent.comments;
      return services.commentService.getCommentsByCharacterId(parent.id);
    },
  },
};
