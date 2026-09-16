import Empresa from '../models/EmpresaModel.js';
import AssinaturaContrato from '../models/AssinaturaContratoModel.js';
import AuditoriaLog from '../models/AuditoriaLogModel.js';

const publicRegister = async (req, res) => {
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
        message: 'Razão social, e-mail de contato e nome do representante são campos obrigatórios.',
        data: null
      });
    }

    if (cnpj) {
      const existe = await Empresa.findOne({ where: { cnpj } });
      if (existe) {
        return res.status(400).send({
          message: 'Uma proposta com este CNPJ já foi registrada anteriormente.',
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

    // Cria checklist das 5 assinaturas
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
      acao: 'AUTOATENDIMENTO_INSCRICAO_PUBLIC',
      usuario: 'CANDIDATO_EXTERNO',
      detalhes: JSON.stringify({ razaoSocial, cnpj, email: emailContato })
    });

    return res.status(201).send({
      message: 'Inscrição submetida com sucesso ao Pollen Parque! Nossa equipe analisará os dados em breve.',
      data: {
        id: novaEmpresa.id,
        protocolo: `POL-${novaEmpresa.id.substring(0, 8).toUpperCase()}`,
        status: novaEmpresa.status,
        createdAt: novaEmpresa.createdAt
      }
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao processar inscrição pública', error: error.message });
  }
};

export default {
  publicRegister
};
