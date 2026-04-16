import { Sequelize, Options } from 'sequelize';

const buildDatabaseConfig = (): Options => ({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  dialect: (process.env.DB_DIALECT as 'postgres' | 'mysql') || 'postgres',
  logging: process.env.NODE_ENV === 'development'
    ? (msg: string) => console.log(`[DB] ${msg}`)
    : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: false,
    timestamps: true,
  },
});

const sequelize = new Sequelize(buildDatabaseConfig());

export default sequelize;
