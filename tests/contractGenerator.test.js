import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateContractTemplate } from '../src/utils/contractGenerator.js';

describe('Bateria de Testes QA: Gerador de Minutas Contratuais', () => {
  test('Deve gerar minuta para empresa nacional com CNPJ e substituir todas as variáveis', () => {
    const mockEmpresa = {
      id: '11111111-1111-1111-1111-111111111101',
      razao_social: 'AgroTech Soluções Sustentáveis Ltda',
      nome_fantasia: 'AgroTech',
      cnpj: '12.345.678/0001-01',
      tipo: 'STARTUP',
      status_alteracao_contratual: false,
      endereco_completo: 'Rua das Palmeiras, 100',
      cidade: 'Chapecó',
      estado: 'SC',
      cep: '89800-000',
      pais: 'Brasil',
      representante_nome: 'Marcos Vinicius',
      representante_cpf: '123.456.789-00'
    };

    const resultado = generateContractTemplate(mockEmpresa, { valor_anuidade: 3600.00 });

    assert.ok(resultado.numero_termo.startsWith('TERMO-POLLEN/'));
    assert.ok(resultado.titulo.includes('AgroTech Soluções Sustentáveis Ltda'));
    assert.ok(resultado.conteudo_gerado.includes('12.345.678/0001-01'));
    assert.ok(resultado.conteudo_gerado.includes('Marcos Vinicius'));
    assert.ok(resultado.conteudo_gerado.includes('R$ 3600,00'));

    // Garante que não existem campos provisórios com 'X' ou placeholders vazios
    assert.strictEqual(resultado.conteudo_gerado.includes('XXXXX'), false);
    assert.strictEqual(resultado.conteudo_gerado.includes('__X__'), false);
    assert.strictEqual(resultado.conteudo_gerado.includes('{{'), false);
  });

  test('Deve incluir cláusula especial para empresa internacional com identificador fiscal estrangeiro', () => {
    const mockEmpresaInternacional = {
      id: '11111111-1111-1111-1111-111111111104',
      razao_social: 'Global Analytics Holding B.V.',
      cnpj: null,
      identificador_internacional: 'NL-884920491',
      tipo: 'INTERNACIONAL',
      status_alteracao_contratual: false,
      endereco_completo: 'Keizersgracht 421',
      cidade: 'Amsterdam',
      estado: 'NH',
      cep: '1016 EK',
      pais: 'Holanda',
      representante_nome: 'Jean Dupont'
    };

    const resultado = generateContractTemplate(mockEmpresaInternacional);

    assert.ok(resultado.conteudo_gerado.includes('NL-884920491'));
    assert.ok(resultado.conteudo_gerado.includes('domicílio societário internacional'));
    assert.ok(resultado.conteudo_gerado.includes('Holanda'));
    assert.ok(resultado.conteudo_gerado.includes('Jean Dupont'));
  });

  test('Deve incluir cláusula de tolerância de 60 dias para empresa em alteração contratual', () => {
    const mockEmpresaAlteracao = {
      id: '11111111-1111-1111-1111-111111111105',
      razao_social: 'Indústria Alimentícia Chapecó S/A',
      cnpj: '45.678.901/0001-05',
      tipo: 'GRANDE_PORTE',
      status_alteracao_contratual: true,
      representante_nome: 'Beatriz Fontana'
    };

    const resultado = generateContractTemplate(mockEmpresaAlteracao);

    assert.ok(resultado.conteudo_gerado.includes('processo formal de alteração estatutária/contratual'));
    assert.ok(resultado.conteudo_gerado.includes('prazo improrrogável de até 60 (sessenta) dias'));
  });

  test('Deve conter a previsão dos 5 signatários oficiais do processo', () => {
    const mockEmpresa = {
      razao_social: 'Teste Signatários Ltda',
      representante_nome: 'Roberto Dias'
    };

    const resultado = generateContractTemplate(mockEmpresa);

    assert.ok(resultado.conteudo_gerado.includes('Roberto Dias'));
    assert.ok(resultado.conteudo_gerado.includes('Diretoria Executiva / Coordenação Institucional 1'));
    assert.ok(resultado.conteudo_gerado.includes('Coordenação de Parcerias e Negócios / Institucional 2'));
    assert.ok(resultado.conteudo_gerado.includes('PROCURADORIA JURÍDICA'));
    assert.ok(resultado.conteudo_gerado.includes('REITORIA EM EXERCÍCIO'));
  });
});

