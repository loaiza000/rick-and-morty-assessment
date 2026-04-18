import { DataTypes, Model, Sequelize } from 'sequelize';
import {
  CharacterAttributes,
  CharacterStatus,
  CharacterGender,
} from '../types';

interface CharacterCreationAttributes extends Omit<CharacterAttributes, 'id'> {
  id?: number;
}

export class Character extends Model<CharacterAttributes, CharacterCreationAttributes> {
  declare id: number;
  declare name: string;
  declare status: CharacterStatus;
  declare species: string;
  declare gender: CharacterGender;
  declare origin: string;
  declare image: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

export const initCharacterModel = (sequelize: Sequelize): typeof Character => {
  Character.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      status: {
        type: DataTypes.ENUM(...Object.values(CharacterStatus)),
        allowNull: false,
      },
      species: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      gender: {
        type: DataTypes.ENUM(...Object.values(CharacterGender)),
        allowNull: false,
      },
      origin: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: '',
      },
      image: {
        type: DataTypes.STRING(512),
        allowNull: false,
        validate: { isUrl: true },
      },
    },
    {
      sequelize,
      modelName: 'Character',
      tableName: 'characters',
      timestamps: true,
      paranoid: true,
    },
  );

  return Character;
};
