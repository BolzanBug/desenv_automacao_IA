import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDatabase, syncDatabase } from './config/database.js';
import './models/EmpresaModel.js';
import Routes from './routes/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globais
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rota de Health Check
app.get('/health', (req, res) => {
  return res.status(200).send({
    status: 'ONLINE',
    system: 'Sistema Integrado de Gestão de Afiliados — Pollen Parque',
    timestamp: new Date()
  });
});

// Injeção de rotas RESTful
Routes(app);

// Middleware global para tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  return res.status(err.status || 500).send({
    message: err.message || 'Erro interno no servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Inicialização resiliente
let server;
export const startServer = async () => {
  await connectDatabase();
  await syncDatabase();
  return new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`🚀 Servidor Pollen API rodando com sucesso na porta ${PORT}`);
      resolve(server);
    });
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer().catch(err => {
    console.error('Falha ao iniciar servidor:', err);
  });
}

export default app;

