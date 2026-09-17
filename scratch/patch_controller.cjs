const fs = require('fs');

const path = 'src/controllers/empresaController.js';
let content = fs.readFileSync(path, 'utf8');

// Adiciona import do gerador DOCX
if (!content.includes('generateContractPdf')) {
  content = content.replace(
    "import { generateContractTemplate } from '../utils/contractGenerator.js';",
    "import { generateContractTemplate } from '../utils/contractGenerator.js';\nimport { generateContractPdf } from '../utils/docxContractGenerator.js';"
  );
}

// Cria método registerNonResident
const registerNonResident = `
const registerNonResident = async (req, res) => {
  try {
    const {
      razaoSocial, nomeFantasia, cnpj, identificadorInternacional,
      emailContato, telefone, enderecoCompleto, cidade, estado, cep, pais,
      representanteNome, representanteCpf, representanteEmail, representanteTelefone,
      representanteEndereco, representanteCargo, anoFundacao, areaAtuacao, emailCobranca, site
    } = req.body;

    if (!razaoSocial || !emailContato || !representanteNome) {
      return res.status(400).send({
        message: 'Razão social, email de contato e nome do representante são obrigatórios.',
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
      residente: false, // Flag crucial
      razaoSocial,
      nomeFantasia,
      cnpj: cnpj || null,
      identificadorInternacional: identificadorInternacional || null,
      tipo: 'EXTERNA',
      statusAlteracaoContratual: false,
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
      representanteEndereco,
      representanteCargo,
      anoFundacao,
      areaAtuacao,
      emailCobranca,
      site
    });

    const assinantesPadrao = [
      { tipo: 'REPRESENTANTE_LEGAL', nome: representanteNome, cargo: representanteCargo || 'Representante Legal da Empresa', email: representanteEmail || emailContato },
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
      acao: 'EMPRESA_NAO_RESIDENTE_CADASTRADA',
      usuario: 'PUBLICO',
      detalhes: JSON.stringify({ razaoSocial, cnpj })
    });

    return res.status(201).send({
      message: 'Empresa não residente cadastrada com sucesso',
      data: novaEmpresa
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao cadastrar empresa', error: error.message });
  }
};
`;

if (!content.includes('registerNonResident = async')) {
  content = content.replace(
    'const update = async (req, res) => {',
    registerNonResident + '\nconst update = async (req, res) => {'
  );
}

// Atualiza exports
if (!content.includes('registerNonResident,')) {
  content = content.replace(
    'export default {',
    'export default {\n  registerNonResident,'
  );
}

// Atualiza o generateContract para verificar residente
const newGenerateContract = `
const generateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const valorAnuidade = req.body.valorAnuidade || req.body.valor_anuidade;
    const clausulasAdicionais = req.body.clausulasAdicionais || req.body.clausulas_adicionais;

    const empresa = await Empresa.findByPk(id);
    if (!empresa) {
      return res.status(404).send({ message: 'Empresa não encontrada', data: null });
    }

    let contrato;

    // Se for não residente, usa o motor DOCX -> PDF
    if (empresa.residente === false) {
      const pdfData = await generateContractPdf(empresa, { valor_anuidade: valorAnuidade });
      
      contrato = await ContratoMinuta.create({
        empresaId: empresa.id,
        numeroTermo: \`TERMO-EXTERNO/\${new Date().getFullYear()}/\${empresa.id.split('-')[0]}\`,
        titulo: \`Contrato de Afiliação Não Residente — \${empresa.razaoSocial}\`,
        conteudoGerado: \`[PDF GERADO] \${pdfData.caminho_arquivo}\`, // Referência ao arquivo PDF real
        valorAnuidade: valorAnuidade || 3600.00,
        status: 'GERADO'
      });

      // Se existir a tabela de anexos, registra o PDF nela (opcional)
      // await DocumentoAnexo.create(...)
      
    } else {
      // Se residente, usa o motor Markdown antigo
      const contractData = generateContractTemplate(empresa, { valor_anuidade: valorAnuidade, clausulas_adicionais: clausulasAdicionais });

      contrato = await ContratoMinuta.create({
        empresaId: empresa.id,
        numeroTermo: contractData.numeroTermo,
        titulo: contractData.titulo,
        conteudoGerado: contractData.conteudoGerado,
        valorAnuidade: contractData.valorAnuidade,
        status: 'GERADO'
      });
    }

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
      detalhes: JSON.stringify({ contratoId: contrato.id, numeroTermo: contrato.numeroTermo || 'EXTERNO' })
    });

    return res.status(201).send({
      message: 'Minuta contratual gerada com sucesso a partir dos dados da empresa',
      data: contrato
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao gerar minuta contratual', error: error.message });
  }
};
`;

// Substitui a função generateContract velha
const regex = /const generateContract = async \(req, res\) => {[\s\S]*?(?=const remove = async)/;
content = content.replace(regex, newGenerateContract);

fs.writeFileSync(path, content, 'utf8');
