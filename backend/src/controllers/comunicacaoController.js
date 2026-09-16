import ComunicacaoHistorico from '../models/ComunicacaoHistoricoModel.js';
import Empresa from '../models/EmpresaModel.js';

const getHistory = async (req, res) => {
  try {
    const historico = await ComunicacaoHistorico.findAll({
      include: [{ model: Empresa, as: 'empresa', attributes: ['id', 'razaoSocial', 'emailContato'] }],
      order: [['enviadoEm', 'DESC']]
    });

    return res.status(200).send({
      message: 'Histórico de comunicações listado com sucesso',
      data: historico
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao consultar histórico', error: error.message });
  }
};

const sendEmail = async (req, res) => {
  try {
    const empresaIds = req.body.empresaIds || req.body.empresa_ids;
    const filtroStatus = req.body.filtroStatus || req.body.filtro_status;
    const { assunto, mensagem } = req.body;
    const templateTipo = req.body.templateTipo || req.body.template_tipo || 'GERAL';

    if (!assunto || !mensagem) {
      return res.status(400).send({ message: 'Assunto e mensagem são obrigatórios.', data: null });
    }

    let destinatarios = [];

    if (empresaIds && Array.isArray(empresaIds) && empresaIds.length > 0) {
      destinatarios = await Empresa.findAll({
        where: { id: empresaIds }
      });
    } else if (filtroStatus) {
      destinatarios = await Empresa.findAll({
        where: { status: filtroStatus }
      });
    } else {
      destinatarios = await Empresa.findAll();
    }

    const disparados = [];
    for (const emp of destinatarios) {
      const registro = await ComunicacaoHistorico.create({
        empresaId: emp.id,
        destinatarioEmail: emp.emailContato || emp.email_contato,
        destinatarioNome: emp.razaoSocial || emp.razao_social,
        assunto,
        mensagem,
        templateTipo,
        statusEnvio: 'ENVIADO'
      });
      disparados.push(registro);
    }

    return res.status(200).send({
      message: `Comunicação disparada para ${disparados.length} destinatário(s) com sucesso.`,
      data: {
        total_enviados: disparados.length,
        disparos: disparados
      }
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao consultar histórico', error: error.message });
  }
};

export default {
  getHistory,
  sendEmail
};
