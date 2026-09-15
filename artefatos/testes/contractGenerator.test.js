import { generateContractContent } from '../backend/src/utils/contractGenerator.js';

describe('Contract Generator Utility - Minuta Oficial do Pollen Parque', () => {
  it('deve gerar texto da minuta preenchendo todos os campos sem deixar marcações manuais X', () => {
    const mockEmpresa = {
      id: 'uuid-12345678',
      razao_social: 'Biotecnologia do Futuro S.A.',
      nome_fantasia: 'BioFuturo',
      cnpj: '99.888.777/0001-66',
      tipo_empresa: 'PADRAO',
      nome_contato: 'Dra. Helena Souza',
      cargo_contato: 'Diretora Científica',
      email: 'helena@biofuturo.com.br',
      telefone: '(49) 3333-2222',
      endereco: 'Parque Científico Pollen, Módulo 04, Chapecó - SC',
      data_fim_vigencia: '2027-12-31'
    };

    const content = generateContractContent(mockEmpresa);

    expect(content).toContain('TERMO DE AFILIAÇÃO E COOPERAÇÃO TÉCNICA');
    expect(content).toContain('Biotecnologia do Futuro S.A.');
    expect(content).toContain('99.888.777/0001-66');
    expect(content).toContain('Dra. Helena Souza');
    expect(content).toContain('31/12/2027');
    expect(content).toContain('Reitor em Exercício');
    // Garante que não sobraram marcadores de substituição vazios
    expect(content).not.toContain('undefined');
    expect(content).not.toContain('null');
  });
});

