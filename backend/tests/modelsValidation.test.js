import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Bateria de Testes QA: Validação dos Models Refatorados (Regras da Skill)', () => {
  const modelsDir = path.join(__dirname, '../src/models');

  const expectedModels = [
    'EmpresaModel.js',
    'ContratoMinutaModel.js',
    'AssinaturaContratoModel.js',
    'FaturaFinanceiraModel.js',
    'DocumentoAnexoModel.js',
    'EspacoFisicoModel.js',
    'ComunicacaoHistoricoModel.js',
    'AuditoriaLogModel.js'
  ];

  test('Regra 4: Todos os arquivos de models devem seguir o padrão PascalCase + Model.js', () => {
    for (const modelFile of expectedModels) {
      const filePath = path.join(modelsDir, modelFile);
      assert.ok(fs.existsSync(filePath), `Model ${modelFile} deve existir`);
    }

    // Não deve restar nenhum arquivo antigo sem o sufixo Model.js
    const oldFiles = [
      'Empresa.js',
      'ContratoMinuta.js',
      'AssinaturaContrato.js',
      'FaturaFinanceira.js',
      'DocumentoAnexo.js',
      'EspacoFisico.js',
      'ComunicacaoHistorico.js',
      'AuditoriaLog.js'
    ];

    for (const old of oldFiles) {
      assert.strictEqual(fs.existsSync(path.join(modelsDir, old)), false, `Arquivo antigo ${old} deve ter sido removido`);
    }
  });

  test('Regra 2: Todos os models devem conter { freezeTableName: true, timestamps: false }', () => {
    for (const modelFile of expectedModels) {
      const content = fs.readFileSync(path.join(modelsDir, modelFile), 'utf8');
      assert.ok(content.includes('freezeTableName: true'), `${modelFile} deve conter freezeTableName: true`);
      assert.ok(content.includes('timestamps: false'), `${modelFile} deve conter timestamps: false`);
    }
  });

  test('Regra 1: Propriedades devem usar field com mapeamento snake_case', () => {
    const empresaContent = fs.readFileSync(path.join(modelsDir, 'EmpresaModel.js'), 'utf8');
    assert.ok(empresaContent.includes("field: 'razao_social'"));
    assert.ok(empresaContent.includes("field: 'nome_fantasia'"));
    assert.ok(empresaContent.includes("field: 'email_contato'"));
    assert.ok(empresaContent.includes("field: 'representante_nome'"));
    assert.ok(empresaContent.includes("field: 'status_alteracao_contratual'"));
    assert.ok(empresaContent.includes("razaoSocial:"));
    assert.ok(empresaContent.includes("nomeFantasia:"));
    assert.ok(empresaContent.includes("emailContato:"));
    assert.ok(empresaContent.includes("representanteNome:"));

    const faturaContent = fs.readFileSync(path.join(modelsDir, 'FaturaFinanceiraModel.js'), 'utf8');
    assert.ok(faturaContent.includes("field: 'numero_nf'"));
    assert.ok(faturaContent.includes("field: 'numero_boleto'"));
    assert.ok(faturaContent.includes("field: 'chave_pix'"));
    assert.ok(faturaContent.includes("field: 'data_vencimento'"));
    assert.ok(faturaContent.includes("numeroNf:"));
    assert.ok(faturaContent.includes("chavePix:"));
    assert.ok(faturaContent.includes("dataVencimento:"));
  });

  test('Regra 3: Relacionamentos devem estar declarados dentro do próprio arquivo do Model', () => {
    const empresaContent = fs.readFileSync(path.join(modelsDir, 'EmpresaModel.js'), 'utf8');
    assert.ok(empresaContent.includes("Empresa.hasMany(ContratoMinuta"));
    assert.ok(empresaContent.includes("Empresa.hasMany(AssinaturaContrato"));
    assert.ok(empresaContent.includes("Empresa.hasMany(FaturaFinanceira"));
    assert.ok(empresaContent.includes("Empresa.hasMany(DocumentoAnexo"));
    assert.ok(empresaContent.includes("Empresa.hasMany(EspacoFisico"));

    const contratoContent = fs.readFileSync(path.join(modelsDir, 'ContratoMinutaModel.js'), 'utf8');
    assert.ok(contratoContent.includes("ContratoMinuta.hasMany(AssinaturaContrato"));
    assert.ok(contratoContent.includes("ContratoMinuta.belongsTo(Empresa"));

    const faturaContent = fs.readFileSync(path.join(modelsDir, 'FaturaFinanceiraModel.js'), 'utf8');
    assert.ok(faturaContent.includes("FaturaFinanceira.belongsTo(Empresa"));

    const documentoContent = fs.readFileSync(path.join(modelsDir, 'DocumentoAnexoModel.js'), 'utf8');
    assert.ok(documentoContent.includes("DocumentoAnexo.belongsTo(Empresa"));

    const espacoContent = fs.readFileSync(path.join(modelsDir, 'EspacoFisicoModel.js'), 'utf8');
    assert.ok(espacoContent.includes("EspacoFisico.belongsTo(Empresa"));

    const comunicacaoContent = fs.readFileSync(path.join(modelsDir, 'ComunicacaoHistoricoModel.js'), 'utf8');
    assert.ok(comunicacaoContent.includes("ComunicacaoHistorico.belongsTo(Empresa"));

    const auditoriaContent = fs.readFileSync(path.join(modelsDir, 'AuditoriaLogModel.js'), 'utf8');
    assert.ok(auditoriaContent.includes("AuditoriaLog.belongsTo(Empresa"));
  });

  test('Regra 4 - Proibido Centralizar Relações: backend/src/models/index.js NÃO deve existir', () => {
    const indexFile = path.join(modelsDir, 'index.js');
    assert.strictEqual(fs.existsSync(indexFile), false, 'backend/src/models/index.js não deve existir');
  });
});

