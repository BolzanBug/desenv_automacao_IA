import { Op } from 'sequelize';
import { Empresa, Cobranca, EspacoFisico } from '../models/index.js';

export const getMetrics = async (req, res) => {
  try {
    const totalEmpresas = await Empresa.count();
    const empresasAtivas = await Empresa.count({ where: { status_jornada: 'ATIVA' } });
    const empresasEmProcesso = await Empresa.count({
      where: {
        status_jornada: { [Op.in]: ['INSCRITA', 'EM_ANALISE', 'JURIDICO', 'ASSINATURA'] }
      }
    });

    const hoje = new Date();
    const em30Dias = new Date();
    em30Dias.setDate(hoje.getDate() + 30);

    const contratosVencendo30Dias = await Empresa.count({
      where: {
        data_fim_vigencia: {
          [Op.between]: [hoje.toISOString().split('T')[0], em30Dias.toISOString().split('T')[0]]
        }
      }
    });

    const cobrancasPagas = await Cobranca.findAll({
      where: { status: 'PAGO' },
      attributes: ['valor']
    });
    const cobrancasPendentes = await Cobranca.findAll({
      where: { status: 'PENDENTE' },
      attributes: ['valor']
    });
    const cobrancasAtrasadas = await Cobranca.findAll({
      where: { status: 'ATRASADO' },
      attributes: ['valor']
    });

    const totalReceitaLiquida = cobrancasPagas.reduce((acc, cur) => acc + (parseFloat(cur.valor) || 0), 0);
    const totalPendente = cobrancasPendentes.reduce((acc, cur) => acc + (parseFloat(cur.valor) || 0), 0);
    const totalAtrasado = cobrancasAtrasadas.reduce((acc, cur) => acc + (parseFloat(cur.valor) || 0), 0);

    const totalEspacos = await EspacoFisico.count();
    const espacosOcupados = await EspacoFisico.count({ where: { status: 'OCUPADO' } });
    const taxaOcupacaoEspacos = totalEspacos > 0 ? Math.round((espacosOcupados / totalEspacos) * 100) : 0;

    return res.status(200).send({
      message: 'Métricas executivas do Pollen Parque consolidadas com sucesso.',
      data: {
        totalEmpresas,
        empresasAtivas,
        empresasEmProcesso,
        contratosVencendo30Dias,
        totalReceitaLiquida: Number(totalReceitaLiquida.toFixed(2)),
        totalPendente: Number(totalPendente.toFixed(2)),
        totalAtrasado: Number(totalAtrasado.toFixed(2)),
        totalEspacos,
        espacosOcupados,
        taxaOcupacaoEspacos
      }
    });
  } catch (error) {
    console.error('Erro ao calcular métricas do dashboard:', error);
    return res.status(500).send({
      message: 'Erro interno ao consolidar indicadores.',
      error: error.message
    });
  }
};

