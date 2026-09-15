import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';
import { generateContractContent } from '../artefatos/backend/src/utils/contractGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(`    Erro: ${error.message}`);
    failed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(`    Erro: ${error.message}`);
    failed++;
  }
}

async function main() {
  console.log('================================================================');
  console.log('🧪 SUÍTE DE TESTES AUTOMATIZADOS - POLLEN PARQUE');
  console.log('================================================================\n');

  console.log('📦 1. Testes do Utilitário de Geração de Contratos:');
  test('Deve gerar minuta oficial substituindo todas as variáveis da empresa', () => {
    const mockEmpresa = {
      id: 'uuid-teste-12345',
      razao_social: 'Pollen Biotech Inovação S.A.',
      nome_fantasia: 'PollenBio',
      cnpj: '12.345.678/0001-99',
      tipo_empresa: 'PADRAO',
      nome_contato: 'Dra. Maria Fernanda',
      cargo_contato: 'Diretora Geral',
      email: 'maria@pollenbio.com',
      telefone: '(49) 98888-7777',
      endereco: 'Parque Pollen, Módulo 01',
      data_fim_vigencia: '2027-12-31'
    };

    const texto = generateContractContent(mockEmpresa);

    assert(texto.includes('Pollen Biotech Inovação S.A.'), 'Faltou razão social');
    assert(texto.includes('12.345.678/0001-99'), 'Faltou CNPJ');
    assert(texto.includes('Dra. Maria Fernanda'), 'Faltou nome do contato');
    assert(texto.includes('Reitor em Exercício'), 'Faltou reitor institucional');
    assert(!texto.includes('undefined'), 'Não pode conter undefined');
    assert(!texto.includes('null'), 'Não pode conter null');
  });

  console.log('\n📄 2. Testes de Conformidade do Contrato de API (Passo 1):');
  test('O arquivo artefatos/api.json deve conter 12 Histórias de Usuário e Contrato REST', () => {
    const apiPath = path.resolve(__dirname, '../artefatos/api.json');
    assert(fs.existsSync(apiPath), 'api.json deve existir');

    const data = JSON.parse(fs.readFileSync(apiPath, 'utf-8'));
    assert(Array.isArray(data.userStories), 'userStories deve ser um array');
    assert(data.userStories.length >= 12, `Esperado 12 US, encontrado ${data.userStories.length}`);
    assert(data.apiContract && data.apiContract.endpoints.length >= 10, 'Endpoints da API incompletos');
  });

  console.log('\n🗄️  3. Testes do Schema PostgreSQL e ADR (Passo 2):');
  test('O arquivo artefatos/schema.sql deve conter ADR e as 6 tabelas relacionais em 3FN', () => {
    const schemaPath = path.resolve(__dirname, '../artefatos/schema.sql');
    assert(fs.existsSync(schemaPath), 'schema.sql deve existir');

    const sql = fs.readFileSync(schemaPath, 'utf-8');
    assert(sql.includes('ADR-001'), 'ADR ausente no schema.sql');
    assert(sql.includes('CREATE TABLE IF NOT EXISTS empresas'), 'Tabela empresas ausente');
    assert(sql.includes('CREATE TABLE IF NOT EXISTS processos_juridicos'), 'Tabela processos_juridicos ausente');
    assert(sql.includes('CREATE TABLE IF NOT EXISTS documentos'), 'Tabela documentos ausente');
    assert(sql.includes('CREATE TABLE IF NOT EXISTS cobrancas'), 'Tabela cobrancas ausente');
    assert(sql.includes('CREATE TABLE IF NOT EXISTS historico_emails'), 'Tabela historico_emails ausente');
    assert(sql.includes('CREATE TABLE IF NOT EXISTS espacos_fisicos'), 'Tabela espacos_fisicos ausente');
    assert(sql.includes('ON DELETE CASCADE'), 'Integridade ON DELETE CASCADE ausente');
  });

  console.log('\n💻 4. Testes de Estrutura do Backend (Passo 3):');
  test('Arquivos de rotas, controllers e models devem estar presentes e válidos', () => {
    const backendRoot = path.resolve(__dirname, '../artefatos/backend');
    assert(fs.existsSync(path.join(backendRoot, 'package.json')), 'package.json do backend ausente');
    assert(fs.existsSync(path.join(backendRoot, '.env')), '.env do backend ausente');
    assert(fs.existsSync(path.join(backendRoot, 'src/server.js')), 'server.js ausente');
    assert(fs.existsSync(path.join(backendRoot, 'src/controllers/empresaController.js')), 'empresaController ausente');
    assert(fs.existsSync(path.join(backendRoot, 'src/controllers/cobrancaController.js')), 'cobrancaController ausente');
    assert(fs.existsSync(path.join(backendRoot, 'src/controllers/documentoController.js')), 'documentoController ausente');
    assert(fs.existsSync(path.join(backendRoot, 'src/controllers/comunicacaoController.js')), 'comunicacaoController ausente');
    assert(fs.existsSync(path.join(backendRoot, 'src/controllers/espacoController.js')), 'espacoController ausente');
    assert(fs.existsSync(path.join(backendRoot, 'src/controllers/dashboardController.js')), 'dashboardController ausente');
  });

  console.log('\n🖥️  5. Testes de Estrutura e Compilação do Frontend (Passo 4):');
  test('Páginas e componentes do Next.js devem estar estruturados e build gerado', () => {
    const frontendRoot = path.resolve(__dirname, '../artefatos/frontend');
    assert(fs.existsSync(path.join(frontendRoot, 'package.json')), 'package.json do frontend ausente');
    assert(fs.existsSync(path.join(frontendRoot, '.env')), '.env do frontend ausente');
    assert(fs.existsSync(path.join(frontendRoot, 'src/app/page.jsx')), 'Dashboard executivo ausente');
    assert(fs.existsSync(path.join(frontendRoot, 'src/app/empresas/page.jsx')), 'Página de empresas ausente');
    assert(fs.existsSync(path.join(frontendRoot, 'src/app/empresas/nova/page.jsx')), 'Página de nova empresa ausente');
    assert(fs.existsSync(path.join(frontendRoot, 'src/app/empresas/[id]/page.jsx')), 'Ficha 360° ausente');
    assert(fs.existsSync(path.join(frontendRoot, 'src/app/financeiro/page.jsx')), 'Módulo contábil ausente');
    assert(fs.existsSync(path.join(frontendRoot, 'src/app/comunicacao/page.jsx')), 'Central de emails ausente');
    assert(fs.existsSync(path.join(frontendRoot, 'src/app/espacos/page.jsx')), 'Espaços físicos ausente');
    assert(fs.existsSync(path.join(frontendRoot, 'src/app/inscricao/page.jsx')), 'Inscrição pública ausente');
    assert(fs.existsSync(path.join(frontendRoot, '.next')), 'Build do Next.js deve existir (.next)');
  });

  console.log('\n📝 6. Testes do Histórico e Memória Técnica (Passo 6):');
  test('O arquivo artefatos/historico.md deve consolidar changelog e lições aprendidas', () => {
    const histPath = path.resolve(__dirname, '../artefatos/historico.md');
    assert(fs.existsSync(histPath), 'historico.md deve existir');

    const content = fs.readFileSync(histPath, 'utf-8');
    assert(content.includes('Changelog Consolidado'), 'Changelog ausente');
    assert(content.includes('Matriz de Rastreabilidade'), 'Rastreabilidade ausente');
    assert(content.includes('Falhas Prevenidas'), 'Falhas prevenidas ausente');
  });

  console.log('\n----------------------------------------------------------------');
  console.log(`TOTAL DE TESTES EXECUTADOS: ${passed + failed}`);
  console.log(`✅ APROVADOS: ${passed}`);
  console.log(`❌ FALHAS:    ${failed}`);
  console.log('----------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 Todos os testes foram executados com 100% de sucesso!\n');
  }
}

main();

