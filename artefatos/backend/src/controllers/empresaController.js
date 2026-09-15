import { Op } from 'sequelize';
import { Empresa, ProcessoJuridico, Documento, Cobranca, HistoricoEmail, EspacoFisico } from '../models/index.js';

export const create = async (req, res) => {
  try {
    const {
      razaoSocial,
      nomeFantasia,
      cnpj,
      tipoEmpresa,
      nomeContato,
      cargoContato,
      email,
      telefone,
      endereco,
      dataFimVigencia,
      observacoes
    } = req.body;

    if (!razaoSocial || !cnpj || !nomeContato || !email || !telefone || !endereco) {
      return res.status(400).send({
        message: 'Campos obrigatórios ausentes: razão social, CNPJ, contato, e-mail, telefone e endereço são indispensáveis.'
      });
    }

    const empresaExistente = await Empresa.findOne({ where: { cnpj } });
    if (empresaExistente) {
      return res.status(409).send({
        message: 'Já existe uma empresa cadastrada com este CNPJ / Identificador.'
      });
    }

    const empresa = await Empresa.create({
      razao_social: razaoSocial,
      nome_fantasia: nomeFantasia || null,
      cnpj,
      tipo_empresa: tipoEmpresa || 'PADRAO',
      nome_contato: nomeContato,
      cargo_contato: cargoContato || null,
      email,
      telefone,
      endereco,
      status_jornada: 'INSCRITA',
      data_inicio_vigencia: new Date(),
      data_fim_vigencia: dataFimVigencia || null,
      observacoes: observacoes || null
    });

    // Cria automaticamente o registro de trâmite na Procuradoria Jurídica
    await ProcessoJuridico.create({
      empresa_id: empresa.id,
      status_assinatura: 'AGUARDANDO_PROCURADORIA',
      observacoes: 'Processo aberto automaticamente via formulário de entrada.'
    });

    return res.status(201).send({
      message: 'Empresa cadastrada com sucesso e trâmite jurídico inicializado.',
      data: empresa
    });
  } catch (error) {
    console.error('Erro ao cadastrar empresa:', error);
    return res.status(500).send({
      message: 'Erro interno ao processar cadastro de empresa.',
      error: error.message
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const { search, status, tipo, expiringSoon } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { razao_social: { [Op.iLike]: `%${search}%` } },
        { nome_fantasia: { [Op.iLike]: `%${search}%` } },
        { cnpj: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status) {
      where.status_jornada = status;
    }

    if (tipo) {
      where.tipo_empresa = tipo;
    }

    if (expiringSoon === 'true') {
      const hoje = new Date();
      const limite = new Date();
      limite.setDate(hoje.getDate() + 60);
      where.data_fim_vigencia = {
        [Op.between]: [hoje.toISOString().split('T')[0], limite.toISOString().split('T')[0]]
      };
    }

    const empresas = await Empresa.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        { model: ProcessoJuridico, as: 'processoJuridico', attributes: ['status_assinatura', 'numero_chamado_procuradoria'] },
        { model: EspacoFisico, as: 'espacosFisicos', attributes: ['identificador', 'tipo'] }
      ]
    });

    // Calcula dias restantes de vigência para cada empresa
    const empresasFormatadas = empresas.map(emp => {
      const plain = emp.get({ plain: true });
      let diasRestantes = null;
      if (plain.data_fim_vigencia) {
        const fim = new Date(plain.data_fim_vigencia);
        const diffTime = fim.getTime() - new Date().getTime();
        diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      return {
        ...plain,
        diasRestantesVigencia: diasRestantes
      };
    });

    return res.status(200).send({
      message: 'Lista de empresas recuperada com sucesso.',
      count: empresasFormatadas.length,
      data: empresasFormatadas
    });
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    return res.status(500).send({
      message: 'Erro interno ao consultar empresas.',
      error: error.message
    });
  }
};

export const getById = async (req, res) => {
  try {
    const id = req.params.id;
    const empresa = await Empresa.findByPk(id, {
      include: [
        { model: ProcessoJuridico, as: 'processoJuridico' },
        { model: Documento, as: 'documentos' },
        { model: Cobranca, as: 'cobrancas' },
        { model: HistoricoEmail, as: 'historicoEmails' },
        { model: EspacoFisico, as: 'espacosFisicos' }
      ]
    });

    if (!empresa) {
      return res.status(404).send({
        message: 'Empresa afiliada não encontrada com o identificador fornecido.'
      });
    }

    return res.status(200).send({
      message: 'Ficha da empresa carregada com sucesso.',
      data: empresa
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes da empresa:', error);
    return res.status(500).send({
      message: 'Erro interno ao buscar dados da empresa.',
      error: error.message
    });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const empresa = await Empresa.findByPk(id);

    if (!empresa) {
      return res.status(404).send({
        message: 'Empresa não encontrada para atualização.'
      });
    }

    const {
      razaoSocial,
      nomeFantasia,
      nomeContato,
      cargoContato,
      email,
      telefone,
      endereco,
      statusJornada,
      dataInicioVigencia,
      dataFimVigencia,
      observacoes
    } = req.body;

    if (razaoSocial) empresa.razao_social = razaoSocial;
    if (nomeFantasia !== undefined) empresa.nome_fantasia = nomeFantasia;
    if (nomeContato) empresa.nome_contato = nomeContato;
    if (cargoContato !== undefined) empresa.cargo_contato = cargoContato;
    if (email) empresa.email = email;
    if (telefone) empresa.telefone = telefone;
    if (endereco) empresa.endereco = endereco;
    if (statusJornada) empresa.status_jornada = statusJornada;
    if (dataInicioVigencia) empresa.data_inicio_vigencia = dataInicioVigencia;
    if (dataFimVigencia !== undefined) empresa.data_fim_vigencia = dataFimVigencia;
    if (observacoes !== undefined) empresa.observacoes = observacoes;

    await empresa.save();

    return res.status(200).send({
      message: 'Dados cadastrais da empresa atualizados com sucesso.',
      data: empresa
    });
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    return res.status(500).send({
      message: 'Erro interno ao atualizar empresa.',
      error: error.message
    });
  }
};

export const remove = async (req, res) => {
  try {
    const id = req.params.id;
    const empresa = await Empresa.findByPk(id);

    if (!empresa) {
      return res.status(404).send({
        message: 'Empresa não encontrada para remoção.'
      });
    }

    await empresa.destroy();

    return res.status(200).send({
      message: 'Empresa e vínculos removidos com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao remover empresa:', error);
    return res.status(500).send({
      message: 'Erro interno ao excluir empresa.',
      error: error.message
    });
  }
};

export const updateLegalStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      numeroChamadoProcuradoria,
      assinadoRepLegal,
      assinadoInst1,
      assinadoInst2,
      assinadoInst3,
      assinadoReitor,
      observacoes
    } = req.body;

    let processo = await ProcessoJuridico.findOne({ where: { empresa_id: id } });
    if (!processo) {
      processo = await ProcessoJuridico.create({ empresa_id: id });
    }

    if (numeroChamadoProcuradoria !== undefined) processo.numero_chamado_procuradoria = numeroChamadoProcuradoria;
    if (assinadoRepLegal !== undefined) processo.assinado_rep_legal = assinadoRepLegal;
    if (assinadoInst1 !== undefined) processo.assinado_inst_1 = assinadoInst1;
    if (assinadoInst2 !== undefined) processo.assinado_inst_2 = assinadoInst2;
    if (assinadoInst3 !== undefined) processo.assinado_inst_3 = assinadoInst3;
    if (assinadoReitor !== undefined) processo.assinado_reitor = assinadoReitor;
    if (observacoes !== undefined) processo.observacoes = observacoes;

    // Se todas as 5 assinaturas estiverem coletadas, conclui o processo
    const todasAssinadas =
      processo.assinado_rep_legal &&
      processo.assinado_inst_1 &&
      processo.assinado_inst_2 &&
      processo.assinado_inst_3 &&
      processo.assinado_reitor;

    if (todasAssinadas) {
      processo.status_assinatura = 'ASSINADO_CONCLUIDO';
      processo.data_conclusao = new Date();
      // Atualiza status da empresa para ATIVA
      await Empresa.update({ status_jornada: 'ATIVA' }, { where: { id } });
    } else if (processo.numero_chamado_procuradoria) {
      processo.status_assinatura = 'ASSINATURAS_PENDENTES';
      await Empresa.update({ status_jornada: 'ASSINATURA' }, { where: { id } });
    }

    await processo.save();

    return res.status(200).send({
      message: 'Status do processo jurídico e assinaturas atualizado com sucesso.',
      data: processo
    });
  } catch (error) {
    console.error('Erro ao atualizar status jurídico:', error);
    return res.status(500).send({
      message: 'Erro interno ao atualizar processo jurídico.',
      error: error.message
    });
  }
};
