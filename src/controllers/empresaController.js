import { Op } from 'sequelize';
import Empresa from '../models/EmpresaModel.js';
import ContratoMinuta from '../models/ContratoMinutaModel.js';
import AssinaturaContrato from '../models/AssinaturaContratoModel.js';
import FaturaFinanceira from '../models/FaturaFinanceiraModel.js';
import DocumentoAnexo from '../models/DocumentoAnexoModel.js';
import EspacoFisico from '../models/EspacoFisicoModel.js';
import AuditoriaLog from '../models/AuditoriaLogModel.js';
import { generateContractTemplate } from '../utils/contractGenerator.js';

const get = async (req, res) => {
  try {
    const { status, tipo, search, page = 1, limit = 20 } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }
    if (tipo) {
      where.tipo = tipo;
    }
    if (search) {
      where[Op.or] = [
        { razaoSocial: { [Op.like]: `%${search}%` } },
        { nomeFantasia: { [Op.like]: `%${search}%` } },
        { cnpj: { [Op.like]: `%${search}%` } },
        { representanteNome: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const { count, rows } = await Empresa.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).send({
      message: 'Empresas listadas com sucesso',
      data: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        items: rows
      }
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao listar empresas', error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await Empresa.findByPk(id, {
      include: [
        { model: ContratoMinuta, as: 'contratos' },
        { model: AssinaturaContrato, as: 'assinaturas' },
        { model: FaturaFinanceira, as: 'faturas' },
        { model: DocumentoAnexo, as: 'documentos' },
        { model: EspacoFisico, as: 'espacos' }
      ]
    });

    if (!empresa) {
      return res.status(404).send({ message: 'Empresa não encontrada', data: null });
    }

    return res.status(200).send({
      message: 'Empresa localizada com sucesso',
      data: empresa
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao obter dados da empresa', error: error.message });
  }
};

const persist = async (req, res) => {
  try {
    const razaoSocial = req.body.razaoSocial || req.body.razao_social;
    const nomeFantasia = req.body.nomeFantasia || req.body.nome_fantasia;
    const cnpj = req.body.cnpj;
    const identificadorInternacional = req.body.identificadorInternacional || req.body.identificador_internacional;
    const tipo = req.body.tipo || 'STARTUP';
    const statusAlteracaoContratual = req.body.statusAlteracaoContratual ?? req.body.status_alteracao_contratual ?? false;
    const emailContato = req.body.emailContato || req.body.email_contato;
    const telefone = req.body.telefone;
    const enderecoCompleto = req.body.enderecoCompleto || req.body.endereco_completo;
    const cidade = req.body.cidade;
    const estado = req.body.estado;
    const cep = req.body.cep;
    const pais = req.body.pais || 'Brasil';
    const representanteNome = req.body.representanteNome || req.body.representante_nome;
    const representanteCpf = req.body.representanteCpf || req.body.representante_cpf;
    const representanteEmail = req.body.representanteEmail || req.body.representante_email;
    const representanteTelefone = req.body.representanteTelefone || req.body.representante_telefone;
    const observacoes = req.body.observacoes;

    if (!razaoSocial || !emailContato || !representanteNome) {
      return res.status(400).send({
        message: 'Razão social, e-mail de contato e nome do representante são obrigatórios.',
        data: null
      });
    }

    if (tipo !== 'INTERNACIONAL' && !cnpj) {
      return res.status(400).send({
        message: 'CNPJ é obrigatório para empresas nacionais.',
        data: null
      });
    }

    if (tipo === 'INTERNACIONAL' && !identificadorInternacional) {
      return res.status(400).send({
        message: 'Identificador internacional é obrigatório para empresas internacionais.',
        data: null
      });
    }

    if (cnpj) {
      const existeCnpj = await Empresa.findOne({ where: { cnpj } });
      if (existeCnpj) {
        return res.status(400).send({
          message: 'Já existe uma empresa cadastrada com este CNPJ.',
          data: null
        });
      }
    }

    const novaEmpresa = await Empresa.create({
      razaoSocial,
      nomeFantasia,
      cnpj: cnpj || null,
      identificadorInternacional: identificadorInternacional || null,
      tipo,
      statusAlteracaoContratual: Boolean(statusAlteracaoContratual),
      status: 'EM_ANALISE',
      emailContato,
      telefone,
      enderecoCompleto,
      cidade,
      estado,
      cep,
      pais,
      representanteNome,
      representanteCpf,
      representanteEmail: representanteEmail || emailContato,
      representanteTelefone: representanteTelefone || telefone,
      observacoes
    });

    // Cria automaticamente o checklist das 5 assinaturas para a empresa
    const assinantesPadrao = [
      { tipo: 'REPRESENTANTE_LEGAL', nome: representanteNome, cargo: 'Representante Legal da Empresa', email: representanteEmail || emailContato },
      { tipo: 'INSTITUCIONAL_1', nome: 'Diretoria de Inovação Pollen', cargo: 'Diretor de Inovação', email: 'diretoria@pollenparque.org.br' },
      { tipo: 'INSTITUCIONAL_2', nome: 'Coordenação de Parcerias', cargo: 'Coordenador de Parcerias', email: 'coordenacao@pollenparque.org.br' },
      { tipo: 'INSTITUCIONAL_3', nome: 'Procuradoria Jurídica', cargo: 'Procurador-Chefe', email: 'procuradoria@pollenparque.org.br' },
      { tipo: 'REITOR', nome: 'Reitoria em Exercício', cargo: 'Reitor', email: 'reitoria@universidade.edu.br' }
    ];

    for (const a of assinantesPadrao) {
      await AssinaturaContrato.create({
        empresaId: novaEmpresa.id,
        signatarioTipo: a.tipo,
        nome: a.nome,
        cargo: a.cargo,
        email: a.email,
        assinado: false
      });
    }

    await AuditoriaLog.create({
      empresaId: novaEmpresa.id,
      acao: 'EMPRESA_CADASTRADA',
      usuario: 'OPERADOR_SISTEMA',
      detalhes: JSON.stringify({ razaoSocial, cnpj, tipo })
    });

    return res.status(201).send({
      message: 'Empresa cadastrada com sucesso',
      data: novaEmpresa
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao cadastrar empresa', error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await Empresa.findByPk(id);
    if (!empresa) {
      return res.status(404).send({ message: 'Empresa não encontrada', data: null });
    }

    const fieldMap = {
      razao_social: 'razaoSocial',
      nome_fantasia: 'nomeFantasia',
      identificador_internacional: 'identificadorInternacional',
      status_alteracao_contratual: 'statusAlteracaoContratual',
      email_contato: 'emailContato',
      endereco_completo: 'enderecoCompleto',
      representante_nome: 'representanteNome',
      representante_cpf: 'representanteCpf',
      representante_email: 'representanteEmail',
      representante_telefone: 'representanteTelefone',
      data_vigencia_inicio: 'dataVigenciaInicio',
      data_vigencia_fim: 'dataVigenciaFim'
    };

    const payload = {};
    for (const key of Object.keys(req.body)) {
      const camelKey = fieldMap[key] || key;
      payload[camelKey] = req.body[key];
    }

    await empresa.update(payload);

    await AuditoriaLog.create({
      empresaId: id,
      acao: 'EMPRESA_ATUALIZADA',
      usuario: 'OPERADOR_SISTEMA',
      detalhes: JSON.stringify(payload)
    });

    return res.status(200).send({
      message: 'Empresa atualizada com sucesso',
      data: empresa
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao atualizar empresa', error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, justificativa } = req.body;

    const empresa = await Empresa.findByPk(id);
    if (!empresa) {
      return res.status(404).send({ message: 'Empresa não encontrada', data: null });
    }

    const statusAntigo = empresa.status;
    empresa.status = status;

    // Se passou para ATIVO e não tem vigência definida, define 12 meses
    if (status === 'ATIVO' && !empresa.dataVigenciaFim) {
      const hoje = new Date();
      const fimVigencia = new Date();
      fimVigencia.setFullYear(hoje.getFullYear() + 1);
      empresa.dataVigenciaInicio = hoje.toISOString().split('T')[0];
      empresa.dataVigenciaFim = fimVigencia.toISOString().split('T')[0];
    }

    await empresa.save();

    await AuditoriaLog.create({
      empresaId: id,
      acao: 'STATUS_ALTERADO',
      usuario: 'OPERADOR_SISTEMA',
      detalhes: JSON.stringify({ statusAntigo, novoStatus: status, justificativa })
    });

    return res.status(200).send({
      message: 'Status atualizado com sucesso',
      data: empresa
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao atualizar status', error: error.message });
  }
};

const generateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const valorAnuidade = req.body.valorAnuidade || req.body.valor_anuidade;
    const clausulasAdicionais = req.body.clausulasAdicionais || req.body.clausulas_adicionais;

    const empresa = await Empresa.findByPk(id);
    if (!empresa) {
      return res.status(404).send({ message: 'Empresa não encontrada', data: null });
    }

    const contractData = generateContractTemplate(empresa, { valor_anuidade: valorAnuidade, clausulas_adicionais: clausulasAdicionais });

    const contrato = await ContratoMinuta.create({
      empresaId: empresa.id,
      numeroTermo: contractData.numeroTermo,
      titulo: contractData.titulo,
      conteudoGerado: contractData.conteudoGerado,
      valorAnuidade: contractData.valorAnuidade,
      status: 'GERADO'
    });

    // Atualiza status da empresa para MINUTA_GERADA
    if (empresa.status === 'EM_ANALISE') {
      empresa.status = 'MINUTA_GERADA';
      await empresa.save();
    }

    // Vincula assinaturas pendentes ao contrato gerado
    await AssinaturaContrato.update(
      { contratoId: contrato.id },
      { where: { empresaId: empresa.id } }
    );

    await AuditoriaLog.create({
      empresaId: empresa.id,
      acao: 'MINUTA_GERADA',
      usuario: 'OPERADOR_SISTEMA',
      detalhes: JSON.stringify({ contratoId: contrato.id, numeroTermo: contrato.numeroTermo })
    });

    return res.status(201).send({
      message: 'Minuta contratual gerada com sucesso a partir dos dados da empresa',
      data: contrato
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao gerar minuta contratual', error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await Empresa.findByPk(id);
    if (!empresa) {
      return res.status(404).send({ message: 'Empresa não encontrada', data: null });
    }

    await empresa.destroy();

    return res.status(200).send({
      message: 'Empresa excluída com sucesso',
      data: { id }
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao excluir empresa', error: error.message });
  }
};

export default {
  get,
  getById,
  persist,
  update,
  updateStatus,
  generateContract,
  remove
};
