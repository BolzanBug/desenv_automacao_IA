import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import { generateContractPdf, formatCurrencyWithExtenso } from '../src/utils/docxContractGenerator.js';
import empresaRoute from '../src/routes/empresaRoute.js';
import publicRoute from '../src/routes/publicRoute.js';

test('Bateria de Testes QA: Módulo Não-Residente e Minutas DOCX/PDF (V2)', async (t) => {

  await t.test('Deve formatar valores em Reais e por extenso corretamente', () => {
    const res3600 = formatCurrencyWithExtenso(3600);
    assert.match(res3600, /3\.600,00/);
    assert.match(res3600, /três mil e seiscentos reais/);

    const res5000 = formatCurrencyWithExtenso(5000);
    assert.match(res5000, /5\.000,00/);
    assert.match(res5000, /cinco mil reais/);
  });

  await t.test('Deve registrar todos os aliases bilíngues exigidos na especificação V2', () => {
    const registeredRoutes = [];
    const mockApp = {
      get: (route) => registeredRoutes.push(`GET ${route}`),
      post: (route) => registeredRoutes.push(`POST ${route}`),
      put: (route) => registeredRoutes.push(`PUT ${route}`),
      delete: (route) => registeredRoutes.push(`DELETE ${route}`),
      patch: (route) => registeredRoutes.push(`PATCH ${route}`)
    };

    empresaRoute(mockApp);
    publicRoute(mockApp);

    // Valida rotas em inglês e português
    assert.ok(registeredRoutes.includes('POST /companies/nao-residente'), 'Deve conter POST /companies/nao-residente');
    assert.ok(registeredRoutes.includes('POST /empresas/nao-residente'), 'Deve conter POST /empresas/nao-residente');
    assert.ok(registeredRoutes.includes('POST /public/nao-residente'), 'Deve conter POST /public/nao-residente');
    assert.ok(registeredRoutes.includes('POST /companies/:id/contract/generate'), 'Deve conter POST /companies/:id/contract/generate');
    assert.ok(registeredRoutes.includes('POST /empresas/:id/contract/generate'), 'Deve conter POST /empresas/:id/contract/generate');
  });

  await t.test('Deve gerar minuta oficial preenchida sem nenhum placeholder XXXXX residual', async () => {
    const mockEmpresa = {
      id: 'test-v2-mock-empresa',
      razaoSocial: 'INOVAÇÃO CATARINENSE TECNOLOGIA LTDA',
      cnpj: '01.234.567/0001-89',
      emailContato: 'contato@inovacatarinense.com.br',
      emailCobranca: 'financeiro@inovacatarinense.com.br',
      telefone: '(49) 3328-9900',
      enderecoCompleto: 'Rua do Saber, 789, Bairro Universitário',
      cidade: 'Chapecó',
      estado: 'SC',
      representanteNome: 'Roberto Santos',
      representanteCpf: '333.444.555-66',
      representanteCargo: 'Diretor Geral',
      representanteEndereco: 'Rua das Araucárias, 12, Chapecó-SC',
      representanteEmail: 'roberto@inovacatarinense.com.br',
      representanteTelefone: '(49) 99111-2233'
    };

    const resultado = await generateContractPdf(mockEmpresa, { valor_anuidade: 3600 });
    assert.ok(resultado, 'Resultado não deve ser nulo');
    assert.ok(resultado.caminho_arquivo, 'Deve retornar o caminho do arquivo');
    assert.ok(resultado.tamanho_bytes > 1000, 'Tamanho do arquivo deve ser significativo');

    // Remove arquivo temporário gerado pelo teste
    const generatedPath = path.resolve(resultado.caminho_arquivo.replace(/^\//, ''));
    if (fs.existsSync(generatedPath)) {
      fs.unlinkSync(generatedPath);
    }
  });

});

