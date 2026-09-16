import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 5432;
  const dbName = process.env.DB_NAME || 'pollen_afiliados';
  return `postgres://${user}:${password}@${host}:${port}/${dbName}`;
};

const postgresUrl = getDatabaseUrl();

const sequelize = new Sequelize(postgresUrl, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 10000,
    idle: 10000
  }
});

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso.');
    return sequelize;
  } catch (error) {
    console.error('❌ Falha ao conectar ao PostgreSQL:', error.message);
    throw error;
  }
};

export const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: false });
    console.log('✅ Modelos sincronizados com o PostgreSQL.');
  } catch (error) {
    console.error('Erro ao sincronizar tabelas no PostgreSQL:', error);
  }
};

export { sequelize };
export default sequelize;
