import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Bateria de Testes QA: Regras de Negócio e Transições de Estado', () => {
  test('Regra de 5 Assinaturas: quando todas são confirmadas, status deve mudar para AGUARDANDO_PAGAMENTO', () => {
    const assinaturas = [
      { signatario_tipo: 'REPRESENTANTE_LEGAL', assinado: true },
      { signatario_tipo: 'INSTITUCIONAL_1', assinado: true },
      { signatario_tipo: 'INSTITUCIONAL_2', assinado: true },
      { signatario_tipo: 'INSTITUCIONAL_3', assinado: true },
      { signatario_tipo: 'REITOR', assinado: true }
    ];

    const todasAssinadas = assinaturas.length === 5 && assinaturas.every(a => a.assinado);
    assert.strictEqual(todasAssinadas, true);

    const calcularNovoStatus = (statusAtual, assinadas) => {
      if (assinadas) return 'AGUARDANDO_PAGAMENTO';
      return statusAtual;
    };

    assert.strictEqual(calcularNovoStatus('EM_ASSINATURA', todasAssinadas), 'AGUARDANDO_PAGAMENTO');
  });

  test('Regra de 5 Assinaturas: se faltar o Reitor ou Procuradoria, não pode liberar pagamento', () => {
    const assinaturas = [
      { signatario_tipo: 'REPRESENTANTE_LEGAL', assinado: true },
      { signatario_tipo: 'INSTITUCIONAL_1', assinado: true },
      { signatario_tipo: 'INSTITUCIONAL_2', assinado: true },
      { signatario_tipo: 'INSTITUCIONAL_3', assinado: true },
      { signatario_tipo: 'REITOR', assinado: false } // Reitor pendente
    ];

    const todasAssinadas = assinaturas.length === 5 && assinaturas.every(a => a.assinado);
    assert.strictEqual(todasAssinadas, false);
  });

  test('Regra Financeira: Baixa contábil de empresa em AGUARDANDO_PAGAMENTO deve transicionar para ATIVO com vigência de 12 meses', () => {
    let empresa = {
      status: 'AGUARDANDO_PAGAMENTO',
      data_vigencia_inicio: null,
      data_vigencia_fim: null
    };

    const simularBaixaContabil = (emp) => {
      if (emp.status === 'AGUARDANDO_PAGAMENTO') {
        const hoje = new Date();
        const fim = new Date();
        fim.setFullYear(hoje.getFullYear() + 1);
        return {
          ...emp,
          status: 'ATIVO',
          data_vigencia_inicio: hoje.toISOString().split('T')[0],
          data_vigencia_fim: fim.toISOString().split('T')[0]
        };
      }
      return emp;
    };

    const empresaAtivada = simularBaixaContabil(empresa);
    assert.strictEqual(empresaAtivada.status, 'ATIVO');
    assert.ok(empresaAtivada.data_vigencia_inicio);
    assert.ok(empresaAtivada.data_vigencia_fim);
    assert.ok(new Date(empresaAtivada.data_vigencia_fim) > new Date(empresaAtivada.data_vigencia_inicio));
  });

  test('Regra de Alerta de Vigência: deve identificar empresa com vencimento inferior a 60 dias', () => {
    const hoje = new Date();
    const vencimentoEm30Dias = new Date();
    vencimentoEm30Dias.setDate(hoje.getDate() + 30);

    const vencimentoEm90Dias = new Date();
    vencimentoEm90Dias.setDate(hoje.getDate() + 90);

    const calcularAlerta = (dataFim) => {
      const diferencaDias = Math.ceil((new Date(dataFim) - hoje) / (1000 * 60 * 60 * 24));
      return diferencaDias <= 60 && diferencaDias >= 0;
    };

    assert.strictEqual(calcularAlerta(vencimentoEm30Dias), true);
    assert.strictEqual(calcularAlerta(vencimentoEm90Dias), false);
  });

  test('Regra de Identificação: Empresa internacional não exige CNPJ mas exige identificador estrangeiro', () => {
    const validarCadastro = (empresa) => {
      if (empresa.tipo === 'INTERNACIONAL') {
        return Boolean(empresa.identificador_internacional && empresa.pais);
      }
      return Boolean(empresa.cnpj);
    };

    assert.strictEqual(validarCadastro({ tipo: 'INTERNACIONAL', cnpj: null, identificador_internacional: 'NL-999', pais: 'Holanda' }), true);
    assert.strictEqual(validarCadastro({ tipo: 'INTERNACIONAL', cnpj: null, identificador_internacional: null, pais: 'Holanda' }), false);
    assert.strictEqual(validarCadastro({ tipo: 'STARTUP', cnpj: '12.345.678/0001-00' }), true);
    assert.strictEqual(validarCadastro({ tipo: 'STARTUP', cnpj: null }), false);
  });
});

