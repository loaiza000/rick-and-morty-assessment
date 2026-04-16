import { DataTypes, Model, Sequelize } from 'sequelize';
import { CommentAttributes } from '../types';

interface CommentCreationAttributes extends Omit<CommentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Comment extends Model<CommentAttributes, CommentCreationAttributes> {
  declare id: number;
  declare characterId: number;
  declare content: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export const initCommentModel = (sequelize: Sequelize): typeof Comment => {
  Comment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      characterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'characterId',
        references: {
          model: 'characters',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true, len: [1, 5000] },
      },
    },
    {
      sequelize,
      modelName: 'Comment',
      tableName: 'comments',
      timestamps: true,
    },
  );

  return Comment;
};
