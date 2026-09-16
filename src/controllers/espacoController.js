import EspacoFisico from '../models/EspacoFisicoModel.js';
import Empresa from '../models/EmpresaModel.js';

const getSpaces = async (req, res) => {
  try {
    const { status, tipo } = req.query;
    const where = {};
    if (status) where.status = status;
    if (tipo) where.tipo = tipo;

    const espacos = await EspacoFisico.findAll({
      where,
      include: [{ model: Empresa, as: 'empresa', attributes: ['id', 'razaoSocial', 'nomeFantasia'] }],
      order: [['bloco', 'ASC'], ['nome', 'ASC']]
    });

    return res.status(200).send({
      message: 'Espaços físicos listados com sucesso',
      data: espacos
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao listar espaços físicos', error: error.message });
  }
};

const persistSpace = async (req, res) => {
  try {
    const { nome, tipo, bloco, capacidade = 1, status = 'DISPONIVEL', observacoes } = req.body;
    const empresaId = req.body.empresaId || req.body.empresa_id;

    if (!nome || !tipo) {
      return res.status(400).send({ message: 'Nome e tipo do espaço são obrigatórios.', data: null });
    }

    const espaco = await EspacoFisico.create({
      nome,
      tipo,
      bloco,
      capacidade: parseInt(capacidade),
      status: empresaId ? 'OCUPADO' : status,
      empresaId: empresaId || null,
      dataInicioOcupacao: empresaId ? new Date() : null,
      observacoes
    });

    return res.status(201).send({
      message: 'Espaço físico cadastrado com sucesso',
      data: espaco
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao cadastrar espaço físico', error: error.message });
  }
};

const updateSpace = async (req, res) => {
  try {
    const { id } = req.params;
    const espaco = await EspacoFisico.findByPk(id);
    if (!espaco) {
      return res.status(404).send({ message: 'Espaço não encontrado', data: null });
    }

    const empresaId = req.body.empresaId !== undefined ? req.body.empresaId : req.body.empresa_id;
    const status = req.body.status;

    if (empresaId !== undefined) {
      espaco.empresaId = empresaId;
      espaco.status = empresaId ? 'OCUPADO' : (status || 'DISPONIVEL');
      espaco.dataInicioOcupacao = empresaId ? new Date() : null;
    } else if (status !== undefined) {
      espaco.status = status;
    }

    if (req.body.nome) espaco.nome = req.body.nome;
    if (req.body.tipo) espaco.tipo = req.body.tipo;
    if (req.body.bloco) espaco.bloco = req.body.bloco;
    if (req.body.capacidade) espaco.capacidade = parseInt(req.body.capacidade);
    if (req.body.observacoes !== undefined) espaco.observacoes = req.body.observacoes;

    await espaco.save();

    return res.status(200).send({
      message: 'Espaço físico atualizado com sucesso',
      data: espaco
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao atualizar espaço', error: error.message });
  }
};

const deleteSpace = async (req, res) => {
  try {
    const { id } = req.params;
    const espaco = await EspacoFisico.findByPk(id);
    if (!espaco) {
      return res.status(404).send({ message: 'Espaço não encontrado', data: null });
    }

    await espaco.destroy();

    return res.status(200).send({
      message: 'Espaço excluído com sucesso',
      data: { id }
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao excluir espaço', error: error.message });
  }
};

export default {
  getSpaces,
  persistSpace,
  updateSpace,
  deleteSpace
};
