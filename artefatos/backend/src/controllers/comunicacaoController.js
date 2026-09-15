import { HistoricoEmail, Empresa } from '../models/index.js';

export const sendEmail = async (req, res) => {
  try {
    const { companyIds, assunto, conteudo, tipoEnvio, enviadoPor } = req.body;

    if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
      return res.status(400).send({
        message: 'A lista de empresas destinatárias (companyIds) é obrigatória e deve conter pelo menos um ID.'
      });
    }

    if (!assunto || !conteudo) {
      return res.status(400).send({
        message: 'Assunto e conteúdo do e-mail são obrigatórios.'
      });
    }

    const empresas = await Empresa.findAll({
      where: { id: companyIds },
      attributes: ['id', 'razao_social', 'email']
    });

    if (empresas.length === 0) {
      return res.status(404).send({
        message: 'Nenhuma empresa correspondente aos IDs fornecidos foi localizada.'
      });
    }

    const registrosHistorico = empresas.map(emp => ({
      empresa_id: emp.id,
      destinatarios: `${emp.razao_social} <${emp.email}>`,
      assunto,
      conteudo,
      tipo_envio: tipoEnvio || (companyIds.length > 1 ? 'MASSA' : 'INDIVIDUAL'),
      enviado_por: enviadoPor || 'equipe.pollen@instituicao.edu.br',
      enviado_em: new Date()
    }));

    await HistoricoEmail.bulkCreate(registrosHistorico);

    return res.status(200).send({
      message: 'Comunicação disparada e histórico preservado com sucesso no perfil dos afiliados.',
      totalEnviados: registrosHistorico.length
    });
  } catch (error) {
    console.error('Erro ao enviar comunicação:', error);
    return res.status(500).send({
      message: 'Erro interno ao processar disparo de e-mails.',
      error: error.message
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { empresaId } = req.query;
    const where = {};
    if (empresaId) where.empresa_id = empresaId;

    const historico = await HistoricoEmail.findAll({
      where,
      include: [{ model: Empresa, as: 'empresa', attributes: ['id', 'razao_social', 'email'] }],
      order: [['enviado_em', 'DESC']]
    });

    return res.status(200).send({
      message: 'Histórico de comunicações recuperado com sucesso.',
      count: historico.length,
      data: historico
    });
  } catch (error) {
    console.error('Erro ao consultar histórico de e-mails:', error);
    return res.status(500).send({
      message: 'Erro interno ao obter histórico de e-mails.',
      error: error.message
    });
  }
};
