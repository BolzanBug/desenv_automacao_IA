import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../artefatos/backend/src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log('================================================================');
  console.log('🌱 POLLEN PARQUE - INICIALIZAÇÃO DE BANCO DE DADOS POSTGRESQL');
  console.log('================================================================');

  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso!');

    const schemaPath = path.resolve(__dirname, '../artefatos/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Arquivo de schema não encontrado em: ${schemaPath}`);
    }

    const sqlContent = fs.readFileSync(schemaPath, 'utf-8');
    console.log('📜 Executando script DDL/DML de artefatos/schema.sql...');

    await sequelize.query(sqlContent);

    console.log('✅ Tabelas, índices, triggers e seeds iniciais criados com sucesso!');
    console.log('   - empresas');
    console.log('   - processos_juridicos');
    console.log('   - documentos');
    console.log('   - cobrancas');
    console.log('   - historico_emails');
    console.log('   - espacos_fisicos');
    console.log('\n🎉 Banco de dados pronto para operação!\n');
    process.exit(0);
  } catch (error) {
    console.warn('\n⚠️ Aviso na conexão com o banco de dados:', error.message);
    console.log('\n💡 DICA DE INICIALIZAÇÃO RÁPIDA:');
    console.log('   Você pode subir o PostgreSQL instantaneamente via Docker com:');
    console.log('   $ docker compose up -d\n');
    console.log('   Em seguida, execute novamente:');
    console.log('   $ npm run db:setup\n');
    process.exit(1);
  }
}

setupDatabase();

