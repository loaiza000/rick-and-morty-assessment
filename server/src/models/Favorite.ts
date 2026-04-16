import { DataTypes, Model, Sequelize } from 'sequelize';
import { FavoriteAttributes } from '../types';

interface FavoriteCreationAttributes extends Omit<FavoriteAttributes, 'id' | 'createdAt'> {}

export class Favorite extends Model<FavoriteAttributes, FavoriteCreationAttributes> {
  declare id: number;
  declare characterId: number;

  declare readonly createdAt: Date;
}

export const initFavoriteModel = (sequelize: Sequelize): typeof Favorite => {
  Favorite.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      characterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'characters',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'Favorite',
      tableName: 'favorites',
      timestamps: true,
      updatedAt: false,
    },
  );

  return Favorite;
};
