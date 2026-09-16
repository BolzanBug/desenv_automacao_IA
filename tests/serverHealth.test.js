import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

describe('Bateria de Testes QA: Integridade da Infraestrutura, Docker e Servidor', () => {
  test('Arquivos de Infraestrutura e Docker devem existir obrigatoriamente na raiz', () => {
    const requiredRootFiles = [
      'Dockerfile',
      'docker-compose.yml',
      '.dockerignore',
      '.env.example',
      '.env',
      'package.json',
      'README.md',
      'schema.sql'
    ];

    for (const file of requiredRootFiles) {
      const filePath = path.join(rootDir, file);
      assert.ok(fs.existsSync(filePath), `Arquivo ${file} deve existir na raiz do backend`);
    }
  });

  test('docker-compose.yml deve conter as credenciais alinhadas com .env.example e schema.sql correto', () => {
    const composeContent = fs.readFileSync(path.join(rootDir, 'docker-compose.yml'), 'utf8');
    assert.ok(composeContent.includes('pollen_postgres'), 'Deve definir o container pollen_postgres');
    assert.ok(composeContent.includes('image: postgres:16-alpine'), 'Deve utilizar imagem postgres:16-alpine');
    assert.ok(composeContent.includes('POSTGRES_USER:'), 'Deve configurar POSTGRES_USER');
    assert.ok(composeContent.includes('POSTGRES_PASSWORD:'), 'Deve configurar POSTGRES_PASSWORD');
    assert.ok(composeContent.includes('POSTGRES_DB:'), 'Deve configurar POSTGRES_DB');
    assert.ok(composeContent.includes('./schema.sql:/docker-entrypoint-initdb.d/init.sql'), 'Volume de schema deve apontar para ./schema.sql');
    assert.ok(composeContent.includes('pollen_api'), 'Deve definir o container da api backend');
  });

  test('Dockerfile deve estar configurado com Node.js e expor a porta 3001', () => {
    const dockerfileContent = fs.readFileSync(path.join(rootDir, 'Dockerfile'), 'utf8');
    assert.ok(dockerfileContent.includes('node:'), 'Deve basear-se em imagem oficial Node.js');
    assert.ok(dockerfileContent.includes('EXPOSE 3001'), 'Deve expor a porta 3001');
    assert.ok(dockerfileContent.includes('CMD ["npm", "start"]'), 'Deve definir comando de inicialização npm start');
  });

  test('Rotas da API devem estar mapeadas nas 3 bases (/api/v1, /api e raiz /)', async () => {
    const routesContent = fs.readFileSync(path.join(rootDir, 'src/routes/index.js'), 'utf8');
    assert.ok(routesContent.includes("app.use('/api/v1', router)"), 'Deve conter rota /api/v1');
    assert.ok(routesContent.includes("app.use('/api', router)"), 'Deve conter alias /api');
    assert.ok(routesContent.includes("app.use('/', router)"), 'Deve conter alias /');
  });

  test('Servidor Express e Health Check devem estar definidos corretamente', async () => {
    const serverContent = fs.readFileSync(path.join(rootDir, 'src/server.js'), 'utf8');
    assert.ok(serverContent.includes("app.get('/health'"), 'Deve conter rota GET /health');
    assert.ok(serverContent.includes('export const startServer'), 'Deve exportar função startServer');
    assert.ok(serverContent.includes('export default app'), 'Deve exportar app Express como default');
  });
});

