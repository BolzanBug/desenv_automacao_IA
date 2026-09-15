import { Op } from 'sequelize';
import { Cobranca, Empresa } from '../models/index.js';

export const launch = async (req, res) => {
  try {
    const {
      empresaId,
      numeroNf,
      numeroBoleto,
      linhaDigitavel,
      chavePix,
      valor,
      dataVencimento,
      parcelaAtual,
      totalParcelas,
      observacao
    } = req.body;

    if (!empresaId || !numeroNf || !valor || !dataVencimento) {
      return res.status(400).send({
        message: 'Campos obrigatórios ausentes: empresaId, número da NF, valor e data de vencimento são obrigatórios.'
      });
    }

    const empresa = await Empresa.findByPk(empresaId);
    if (!empresa) {
      return res.status(404).send({
        message: 'Empresa destinatária da cobrança não encontrada.'
      });
    }

    const cobranca = await Cobranca.create({
      empresa_id: empresaId,
      numero_nf: numeroNf,
      numero_boleto: numeroBoleto || null,
      linha_digitavel: linhaDigitavel || null,
      chave_pix: chavePix || 'financeiro.pollen@instituicao.edu.br',
      valor: parseFloat(valor),
      parcela_atual: parcelaAtual || 1,
      total_parcelas: totalParcelas || 1,
      data_vencimento: dataVencimento,
      status: 'PENDENTE',
      observacao: observacao || null
    });

    return res.status(201).send({
      message: 'Cobrança lançada com sucesso no módulo financeiro.',
      invoiceId: cobranca.id,
      data: cobranca
    });
  } catch (error) {
    console.error('Erro ao lançar cobrança:', error);
    return res.status(500).send({
      message: 'Erro interno ao lançar cobrança contábil.',
      error: error.message
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const { empresaId, status, mes, ano } = req.query;
    const where = {};

    if (empresaId) where.empresa_id = empresaId;
    if (status) where.status = status;

    if (mes && ano) {
      const inicioMes = `${ano}-${String(mes).padStart(2, '0')}-01`;
      const fimMes = new Date(ano, mes, 0).toISOString().split('T')[0];
      where.data_vencimento = { [Op.between]: [inicioMes, fimMes] };
    }

    const cobrancas = await Cobranca.findAll({
      where,
      include: [{ model: Empresa, as: 'empresa', attributes: ['id', 'razao_social', 'cnpj'] }],
      order: [['data_vencimento', 'ASC']]
    });

    const hoje = new Date().toISOString().split('T')[0];
    let totalPendente = 0;
    let totalPago = 0;
    let totalAtrasado = 0;

    const formatadas = cobrancas.map(c => {
      const item = c.get({ plain: true });
      const val = parseFloat(item.valor) || 0;

      if (item.status === 'PENDENTE' && item.data_vencimento < hoje) {
        item.status = 'ATRASADO';
        Cobranca.update({ status: 'ATRASADO' }, { where: { id: item.id } }).catch(() => {});
      }

      if (item.status === 'PAGO') totalPago += val;
      else if (item.status === 'ATRASADO') totalAtrasado += val;
      else totalPendente += val;

      return item;
    });

    return res.status(200).send({
      message: 'Cobranças contábeis listadas com sucesso.',
      count: formatadas.length,
      data: formatadas,
      resumo: {
        totalPendente: Number(totalPendente.toFixed(2)),
        totalPago: Number(totalPago.toFixed(2)),
        totalAtrasado: Number(totalAtrasado.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Erro ao listar cobranças:', error);
    return res.status(500).send({
      message: 'Erro interno ao consultar cobranças.',
      error: error.message
    });
  }
};

export const pay = async (req, res) => {
  try {
    const id = req.params.id;
    const { dataPagamento, observacao } = req.body;

    const cobranca = await Cobranca.findByPk(id);
    if (!cobranca) {
      return res.status(404).send({
        message: 'Cobrança não encontrada para confirmação de baixa.'
      });
    }

    cobranca.status = 'PAGO';
    cobranca.data_pagamento = dataPagamento ? new Date(dataPagamento) : new Date();
    if (observacao) {
      cobranca.observacao = cobranca.observacao ? `${cobranca.observacao} | Baixa: ${observacao}` : observacao;
    }

    await cobranca.save();

    // Verifica se a empresa possui outras pendências atrasadas
    const pendencias = await Cobranca.count({
      where: {
        empresa_id: cobranca.empresa_id,
        status: { [Op.in]: ['PENDENTE', 'ATRASADO'] }
      }
    });

    if (pendencias === 0) {
      await Empresa.update(
        { status_jornada: 'ATIVA' },
        { where: { id: cobranca.empresa_id, status_jornada: 'INADIMPLENTE' } }
      );
    }

    return res.status(200).send({
      message: 'Pagamento confirmado e baixa financeira registrada com sucesso.',
      data: cobranca
    });
  } catch (error) {
    console.error('Erro ao dar baixa em cobrança:', error);
    return res.status(500).send({
      message: 'Erro interno ao confirmar liquidação financeira.',
      error: error.message
    });
  }
};
