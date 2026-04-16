import { characterResolvers } from './characterResolver';
import { GraphQLContext } from '../types';
import { CharacterService } from '../services/CharacterService';
import { CommentService } from '../services/CommentService';
import { cacheService } from '../config/redis';

export const resolvers = {
  ...characterResolvers,
};

const characterService = new CharacterService(cacheService);
const commentService = new CommentService(cacheService);

export const createGraphQLContext = (): GraphQLContext => ({
  services: {
    characterService,
    commentService,
  },
});
