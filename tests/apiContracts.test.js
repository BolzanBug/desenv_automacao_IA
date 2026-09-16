import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Bateria de Testes QA: Validação dos Contratos de API (Passo 1)', () => {
  const apiJsonPath = path.join(__dirname, '../docs/api.json');

  test('Arquivo api.json deve existir e ser um JSON válido', () => {
    assert.ok(fs.existsSync(apiJsonPath), 'backend/docs/api.json deve existir');
    const rawData = fs.readFileSync(apiJsonPath, 'utf8');
    const parsed = JSON.parse(rawData);
    assert.ok(parsed.system, 'Deve possuir chave system');
    assert.ok(Array.isArray(parsed.userStories), 'Deve possuir userStories');
    assert.ok(Array.isArray(parsed.apiContracts), 'Deve possuir apiContracts');
    assert.ok(Array.isArray(parsed.actors), 'Deve possuir actors');
  });

  test('Deve cobrir os 4 atores do Pollen Parque', () => {
    const rawData = fs.readFileSync(apiJsonPath, 'utf8');
    const { actors } = JSON.parse(rawData);
    const actorIds = actors.map(a => a.id);
    assert.ok(actorIds.includes('EQUIPE_PROGRAMA'));
    assert.ok(actorIds.includes('EMPRESA_AFILIADA'));
    assert.ok(actorIds.includes('SETOR_CONTABIL_FINANCEIRO'));
    assert.ok(actorIds.includes('PROCURADORIA_REITORIA'));
  });

  test('Todas as Histórias de Usuário devem conter critérios de aceite e regras de negócio', () => {
    const rawData = fs.readFileSync(apiJsonPath, 'utf8');
    const { userStories } = JSON.parse(rawData);
    assert.ok(userStories.length >= 10, 'Deve conter pelo menos 10 Histórias de Usuário');

    for (const us of userStories) {
      assert.ok(us.id, 'US deve ter ID');
      assert.ok(us.title, 'US deve ter título');
      assert.ok(us.actor, 'US deve ter ator');
      assert.ok(us.description, 'US deve ter descrição');
      assert.ok(Array.isArray(us.acceptanceCriteria) && us.acceptanceCriteria.length > 0, `US ${us.id} deve ter critérios de aceite`);
      assert.ok(Array.isArray(us.businessRules) && us.businessRules.length > 0, `US ${us.id} deve ter regras de negócio`);
    }
  });

  test('Contratos de API devem mapear os endpoints essenciais', () => {
    const rawData = fs.readFileSync(apiJsonPath, 'utf8');
    const { apiContracts } = JSON.parse(rawData);
    const endpoints = apiContracts.map(c => `${c.method} ${c.endpoint}`);

    assert.ok(endpoints.includes('GET /api/v1/companies'));
    assert.ok(endpoints.includes('POST /api/v1/companies'));
    assert.ok(endpoints.includes('GET /api/v1/companies/:id'));
    assert.ok(endpoints.includes('POST /api/v1/companies/:id/contract/generate'));
    assert.ok(endpoints.includes('GET /api/v1/companies/:id/signatures'));
    assert.ok(endpoints.includes('GET /api/v1/financial/invoices'));
    assert.ok(endpoints.includes('PATCH /api/v1/financial/invoices/:id/payment'));
    assert.ok(endpoints.includes('GET /api/v1/dashboard/metrics'));
    assert.ok(endpoints.includes('POST /api/v1/public/register'));
  });
});

