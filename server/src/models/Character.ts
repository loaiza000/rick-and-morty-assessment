import { DataTypes, Model, Sequelize } from 'sequelize';
import {
  CharacterAttributes,
  CharacterStatus,
  CharacterGender,
  OriginLocation,
} from '../types';

interface CharacterCreationAttributes extends Omit<CharacterAttributes, 'id'> {
  id?: number;
}

export class Character extends Model<CharacterAttributes, CharacterCreationAttributes> {
  declare id: number;
  declare name: string;
  declare status: CharacterStatus;
  declare species: string;
  declare type: string;
  declare gender: CharacterGender;
  declare origin: OriginLocation;
  declare location: OriginLocation;
  declare image: string;
  declare episode: string[];
  declare url: string;
  declare created: string;

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
      type: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: '',
      },
      gender: {
        type: DataTypes.ENUM(...Object.values(CharacterGender)),
        allowNull: false,
      },
      origin: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: { name: '', url: '' },
      },
      location: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: { name: '', url: '' },
      },
      image: {
        type: DataTypes.STRING(512),
        allowNull: false,
        validate: { isUrl: true },
      },
      episode: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      url: {
        type: DataTypes.STRING(512),
        allowNull: false,
      },
      created: {
        type: DataTypes.STRING,
        allowNull: false,
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
