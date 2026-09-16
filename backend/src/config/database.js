import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

let sequelize;

const postgresUrl = process.env.DATABASE_URL;

if (process.env.DB_DIALECT === 'sqlite' || !postgresUrl) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './pollen_database.sqlite',
    logging: false
  });
} else {
  sequelize = new Sequelize(postgresUrl, {
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 10000,
      idle: 10000
    }
  });
}

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso.');
    return sequelize;
  } catch (error) {
    console.warn('⚠️ Falha ao conectar ao PostgreSQL (' + error.message + '). Ativando fallback resiliente SQLite...');
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: './pollen_database.sqlite',
      logging: false
    });
    await sequelize.authenticate();
    console.log('✅ Fallback SQLite conectado com sucesso.');
    return sequelize;
  }
};

export const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: false });
    console.log('✅ Modelos sincronizados com o banco de dados.');
  } catch (error) {
    console.error('Erro ao sincronizar tabelas:', error);
  }
};

export { sequelize };
export default sequelize;

