import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Bateria de Testes QA: Validação do Schema SQL (Passo 2)', () => {
  const schemaPath = path.join(__dirname, '../schema.sql');

  test('Arquivo backend/schema.sql deve existir', () => {
    assert.ok(fs.existsSync(schemaPath));
  });

  test('Deve conter extensão uuid-ossp e chaves primárias UUID', () => {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    assert.ok(sql.includes('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'));
    assert.ok(sql.includes('UUID PRIMARY KEY DEFAULT uuid_generate_v4()'));
  });

  test('Deve conter as 8 tabelas relacionais do ecossistema Pollen', () => {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    const tabelas = [
      'empresas',
      'contratos_minutas',
      'assinaturas_contrato',
      'faturas_financeiras',
      'documentos_anexos',
      'espacos_fisicos',
      'comunicacoes_historico',
      'auditoria_logs'
    ];

    for (const tab of tabelas) {
      assert.ok(sql.includes(`CREATE TABLE IF NOT EXISTS ${tab}`), `Tabela ${tab} deve ser criada no schema`);
    }
  });

  test('Deve conter constraint de integridade referencial ON DELETE CASCADE nas tabelas dependentes', () => {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    assert.ok(sql.includes('REFERENCES empresas(id) ON DELETE CASCADE'));
  });

  test('Deve conter triggers de atualização automática de updated_at', () => {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    assert.ok(sql.includes('trigger_set_timestamp()'));
    assert.ok(sql.includes('CREATE TRIGGER set_timestamp_empresas'));
  });
});

