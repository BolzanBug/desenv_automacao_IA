import { Op } from 'sequelize';
import Empresa from '../models/EmpresaModel.js';
import FaturaFinanceira from '../models/FaturaFinanceiraModel.js';
import EspacoFisico from '../models/EspacoFisicoModel.js';

const getMetrics = async (req, res) => {
  try {
    const totalAtivos = await Empresa.count({ where: { status: 'ATIVO' } });
    
    const totalEmProcesso = await Empresa.count({
      where: {
        status: {
          [Op.in]: ['EM_ANALISE', 'MINUTA_GERADA', 'EM_ASSINATURA', 'AGUARDANDO_PAGAMENTO']
        }
      }
    });

    const totalInadimplentes = await Empresa.count({ where: { status: 'INADIMPLENTE' } });

    // Faturamento
    const faturasPendentes = await FaturaFinanceira.findAll({
      where: { status: 'PENDENTE' }
    });
    const faturamentoPendenteTotal = faturasPendentes.reduce((acc, f) => acc + parseFloat(f.valor || 0), 0);

    const faturasPagas = await FaturaFinanceira.findAll({
      where: { status: 'PAGO' }
    });
    const faturamentoRealizadoTotal = faturasPagas.reduce((acc, f) => acc + parseFloat(f.valorPago || f.valor_pago || f.valor || 0), 0);

    // Vigências vencendo nos próximos 60 dias
    const hoje = new Date();
    const em60Dias = new Date();
    em60Dias.setDate(hoje.getDate() + 60);

    const vigenciasVencendo = await Empresa.findAll({
      where: {
        dataVigenciaFim: {
          [Op.between]: [hoje.toISOString().split('T')[0], em60Dias.toISOString().split('T')[0]]
        }
      }
    });

    // Espaços físicos
    const totalEspacos = await EspacoFisico.count();
    const espacosOcupados = await EspacoFisico.count({ where: { status: 'OCUPADO' } });
    const taxaOcupacao = totalEspacos > 0 ? ((espacosOcupados / totalEspacos) * 100).toFixed(1) : 0;

    return res.status(200).send({
      message: 'Métricas executivas consolidadas com sucesso',
      data: {
        total_afiliados_ativos: totalAtivos,
        total_em_processo: totalEmProcesso,
        total_inadimplentes: totalInadimplentes,
        faturamento_pendente_total: faturamentoPendenteTotal,
        faturamento_realizado_total: faturamentoRealizadoTotal,
        vigencias_vencendo_60_dias: vigenciasVencendo.length,
        empresas_vigencia_alerta: vigenciasVencendo,
        total_espacos: totalEspacos,
        espacos_ocupados: espacosOcupados,
        taxa_ocupacao_percentual: parseFloat(taxaOcupacao),
        projecao_meta_anual: 50,
        meta_futura_ano_seguinte: 60
      }
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao consolidar métricas do dashboard', error: error.message });
  }
};

export default {
  getMetrics
};
