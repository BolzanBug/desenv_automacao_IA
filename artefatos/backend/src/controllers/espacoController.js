import { EspacoFisico, Empresa } from '../models/index.js';

export const getAll = async (req, res) => {
  try {
    const { status, tipo } = req.query;
    const where = {};
    if (status) where.status = status;
    if (tipo) where.tipo = tipo;

    const espacos = await EspacoFisico.findAll({
      where,
      include: [{ model: Empresa, as: 'empresa', attributes: ['id', 'razao_social', 'cnpj'] }],
      order: [['identificador', 'ASC']]
    });

    return res.status(200).send({
      message: 'Espaços físicos recuperados com sucesso.',
      count: espacos.length,
      data: espacos
    });
  } catch (error) {
    console.error('Erro ao listar espaços físicos:', error);
    return res.status(500).send({
      message: 'Erro interno ao consultar espaços físicos.',
      error: error.message
    });
  }
};

export const allocate = async (req, res) => {
  try {
    const { spaceId, empresaId, dataInicio, dataFim } = req.body;

    if (!spaceId) {
      return res.status(400).send({
        message: 'O identificador do espaço físico (spaceId) é obrigatório.'
      });
    }

    const espaco = await EspacoFisico.findByPk(spaceId);
    if (!espaco) {
      return res.status(404).send({
        message: 'Espaço físico não localizado no inventário.'
      });
    }

    if (empresaId) {
      const empresa = await Empresa.findByPk(empresaId);
      if (!empresa) {
        return res.status(404).send({
          message: 'Empresa selecionada para ocupação não encontrada.'
        });
      }

      espaco.empresa_id = empresaId;
      espaco.status = 'OCUPADO';
      espaco.data_inicio_ocupacao = dataInicio || new Date();
      espaco.data_fim_ocupacao = dataFim || null;
    } else {
      // Desocupar espaço
      espaco.empresa_id = null;
      espaco.status = 'DISPONIVEL';
      espaco.data_inicio_ocupacao = null;
      espaco.data_fim_ocupacao = null;
    }

    await espaco.save();

    return res.status(200).send({
      message: empresaId ? 'Espaço físico alocado com sucesso.' : 'Espaço físico liberado com sucesso.',
      data: espaco
    });
  } catch (error) {
    console.error('Erro ao alocar espaço físico:', error);
    return res.status(500).send({
      message: 'Erro interno ao alterar alocação do espaço físico.',
      error: error.message
    });
  }
};

export const create = async (req, res) => {
  try {
    const { identificador, tipo, capacidade } = req.body;

    if (!identificador || !tipo) {
      return res.status(400).send({
        message: 'Identificador e tipo do espaço físico são obrigatórios.'
      });
    }

    const espaco = await EspacoFisico.create({
      identificador,
      tipo,
      capacidade: capacidade || 1,
      status: 'DISPONIVEL'
    });

    return res.status(201).send({
      message: 'Espaço físico cadastrado no inventário com sucesso.',
      data: espaco
    });
  } catch (error) {
    console.error('Erro ao cadastrar espaço físico:', error);
    return res.status(500).send({
      message: 'Erro interno ao cadastrar espaço físico.',
      error: error.message
    });
  }
};

