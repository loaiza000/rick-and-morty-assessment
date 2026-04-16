import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('characters', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: false,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Alive', 'Dead', 'unknown'),
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
      type: DataTypes.ENUM('Female', 'Male', 'Genderless', 'unknown'),
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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  await queryInterface.addIndex('characters', ['name']);
  await queryInterface.addIndex('characters', ['status']);
  await queryInterface.addIndex('characters', ['species']);
  await queryInterface.addIndex('characters', ['gender']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('characters');
}
