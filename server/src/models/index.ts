import { Character, initCharacterModel } from './Character';
import { Comment, initCommentModel } from './Comment';
import { Favorite, initFavoriteModel } from './Favorite';
import sequelize from '../config/database';

// ─── Initialize models ───────────────────────────────────────────────────────

initCharacterModel(sequelize);
initCommentModel(sequelize);
initFavoriteModel(sequelize);

// ─── Associations ────────────────────────────────────────────────────────────

Character.hasMany(Comment, { foreignKey: 'characterId', as: 'comments' });
Comment.belongsTo(Character, { foreignKey: 'characterId', as: 'character' });

Character.hasMany(Favorite, { foreignKey: 'characterId', as: 'favorites' });
Favorite.belongsTo(Character, { foreignKey: 'characterId', as: 'character' });

// ─── Exports ─────────────────────────────────────────────────────────────────

export { Character, Comment, Favorite, sequelize };
