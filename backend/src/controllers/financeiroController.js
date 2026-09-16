import FaturaFinanceira from '../models/FaturaFinanceiraModel.js';
import Empresa from '../models/EmpresaModel.js';
import AuditoriaLog from '../models/AuditoriaLogModel.js';

const getInvoices = async (req, res) => {
  try {
    const empresaId = req.query.empresaId || req.query.empresa_id;
    const { status } = req.query;
    const where = {};
    if (empresaId) where.empresaId = empresaId;
    if (status) where.status = status;

    const faturas = await FaturaFinanceira.findAll({
      where,
      include: [{ model: Empresa, as: 'empresa', attributes: ['id', 'razaoSocial', 'nomeFantasia', 'cnpj', 'status'] }],
      order: [['dataVencimento', 'ASC']]
    });

    return res.status(200).send({
      message: 'Faturas listadas com sucesso',
      data: faturas
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao listar faturas', error: error.message });
  }
};

const getByEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    const faturas = await FaturaFinanceira.findAll({
      where: { empresaId: id },
      order: [['numeroParcela', 'ASC']]
    });

    return res.status(200).send({
      message: 'Extrato financeiro da empresa retornado com sucesso',
      data: faturas
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao consultar faturas da empresa', error: error.message });
  }
};

const persistInvoice = async (req, res) => {
  try {
    const empresaId = req.body.empresaId || req.body.empresa_id;
    const numeroNf = req.body.numeroNf || req.body.numero_nf;
    const numeroBoleto = req.body.numeroBoleto || req.body.numero_boleto;
    const chavePix = req.body.chavePix || req.body.chave_pix;
    const pixCopiaCola = req.body.pixCopiaCola || req.body.pix_copia_cola;
    const valor = req.body.valor;
    const numeroParcela = req.body.numeroParcela || req.body.numero_parcela || 1;
    const totalParcelas = req.body.totalParcelas || req.body.total_parcelas || 1;
    const dataVencimento = req.body.dataVencimento || req.body.data_vencimento;
    const observacoes = req.body.observacoes;

    if (!empresaId || !valor || !dataVencimento) {
      return res.status(400).send({
        message: 'Empresa, valor e data de vencimento são obrigatórios.',
        data: null
      });
    }

    const fatura = await FaturaFinanceira.create({
      empresaId,
      numeroNf,
      numeroBoleto,
      chavePix: chavePix || 'financeiro@pollenparque.org.br',
      pixCopiaCola,
      valor: parseFloat(valor),
      numeroParcela: parseInt(numeroParcela),
      totalParcelas: parseInt(totalParcelas),
      dataVencimento,
      status: 'PENDENTE',
      observacoes
    });

    await AuditoriaLog.create({
      empresaId,
      acao: 'FATURA_EMITIDA',
      usuario: 'CONTABILIDADE_OPERADOR',
      detalhes: JSON.stringify({ faturaId: fatura.id, valor, numeroNf })
    });

    return res.status(201).send({
      message: 'Fatura cadastrada com sucesso',
      data: fatura
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao cadastrar fatura', error: error.message });
  }
};

const registerPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const valorPago = req.body.valorPago || req.body.valor_pago;
    const dataPagamento = req.body.dataPagamento || req.body.data_pagamento || new Date().toISOString().split('T')[0];
    const formaPagamento = req.body.formaPagamento || req.body.forma_pagamento || 'PIX';
    const comprovanteUrl = req.body.comprovanteUrl || req.body.comprovante_url;
    const operador = req.body.operador || 'CONTABILIDADE';

    const fatura = await FaturaFinanceira.findByPk(id);
    if (!fatura) {
      return res.status(404).send({ message: 'Fatura não encontrada', data: null });
    }

    fatura.status = 'PAGO';
    fatura.valorPago = valorPago ? parseFloat(valorPago) : fatura.valor;
    fatura.dataPagamento = dataPagamento;
    fatura.formaPagamento = formaPagamento;
    fatura.comprovanteUrl = comprovanteUrl;
    fatura.operadorBaixa = operador;

    await fatura.save();

    // Se a empresa vinculada estiver em AGUARDANDO_PAGAMENTO, atualiza para ATIVO
    const empresa = await Empresa.findByPk(fatura.empresaId);
    if (empresa && empresa.status === 'AGUARDANDO_PAGAMENTO') {
      empresa.status = 'ATIVO';
      const hoje = new Date();
      const fimVigencia = new Date();
      fimVigencia.setFullYear(hoje.getFullYear() + 1);
      empresa.dataVigenciaInicio = hoje.toISOString().split('T')[0];
      empresa.dataVigenciaFim = fimVigencia.toISOString().split('T')[0];
      await empresa.save();
    }

    await AuditoriaLog.create({
      empresaId: fatura.empresaId,
      acao: 'BAIXA_CONTABIL_EFETUADA',
      usuario: operador,
      detalhes: JSON.stringify({ faturaId: fatura.id, valorPago: fatura.valorPago, formaPagamento })
    });

    return res.status(200).send({
      message: 'Baixa contábil confirmada com sucesso',
      data: fatura
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao registrar pagamento', error: error.message });
  }
};

export default {
  getInvoices,
  getByEmpresa,
  persistInvoice,
  registerPayment
};
