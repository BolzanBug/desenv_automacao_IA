import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sequelize } from './config/database.js';
import routes from './routes/index.js';
import { EspacoFisico } from './models/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Middlewares Globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos de upload estaticamente
app.use('/uploads', express.static(uploadsDir));

// Rotas da API Centralizadas (Suporte a /api/v1 e /api)
app.use('/api/v1', routes);
app.use('/api', routes);

// Health Check
app.get('/health', (req, res) => {
  return res.status(200).send({
    status: 'UP',
    system: 'Sistema de Gestão de Afiliados - Pollen Parque',
    version: '2.0.0',
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 3001;

export const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso.');
    
    // Sincroniza tabelas se em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: false });
      
      // Assegura colunas essenciais e seeds iniciais
      try {
        await sequelize.query('ALTER TABLE historico_emails ADD COLUMN IF NOT EXISTS destinatarios TEXT;');
        await sequelize.query("ALTER TABLE historico_emails ADD COLUMN IF NOT EXISTS tipo_envio VARCHAR(50) DEFAULT 'INDIVIDUAL';");
        await sequelize.query("ALTER TABLE historico_emails ADD COLUMN IF NOT EXISTS enviado_por VARCHAR(100) DEFAULT 'equipe.pollen@instituicao.edu.br';");
        
        const count = await EspacoFisico.count();
        if (count === 0) {
          await EspacoFisico.bulkCreate([
            { identificador: 'Sala Privativa 101', tipo: 'SALA_PRIVATIVA', capacidade: 6, status: 'DISPONIVEL' },
            { identificador: 'Sala Privativa 102', tipo: 'SALA_PRIVATIVA', capacidade: 8, status: 'DISPONIVEL' },
            { identificador: 'Bancada Coworking C-01', tipo: 'BANCADA_COWORKING', capacidade: 1, status: 'DISPONIVEL' },
            { identificador: 'Bancada Coworking C-02', tipo: 'BANCADA_COWORKING', capacidade: 1, status: 'DISPONIVEL' },
            { identificador: 'Módulo de Laboratório Biotech 01', tipo: 'MODULO_LAB', capacidade: 4, status: 'DISPONIVEL' }
          ]);
        }
      } catch (migrationErr) {
        console.warn('ℹ️ Aviso ao validar colunas/seeds:', migrationErr.message);
      }
      
      console.log('✅ Modelos e estruturas do banco de dados verificados.');
    }

    return app.listen(PORT, () => {
      console.log(`🚀 Servidor Pollen Backend rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.warn('⚠️ Não foi possível conectar ao banco PostgreSQL na inicialização:', error.message);
    console.log(`🚀 Servidor Pollen Backend rodando em modo desacoplado na porta ${PORT}`);
    return app.listen(PORT);
  }
};

// Inicia se executado diretamente
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
