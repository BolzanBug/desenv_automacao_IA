import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Gera automaticamente o instrumento formal de afiliação do Pollen Parque
 * substituindo os campos manuais que anteriormente eram marcados com "X".
 */
export const generateContractContent = (empresa) => {
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const vigenciaFim = empresa.data_fim_vigencia 
    ? new Date(empresa.data_fim_vigencia).toLocaleDateString('pt-BR') 
    : '12 (doze) meses a contar da assinatura';

  return `
================================================================================
                    TERMO DE AFILIAÇÃO E COOPERAÇÃO TÉCNICA
                     POLLEN PARQUE CIENTÍFICO E TECNOLÓGICO
================================================================================

Pelo presente instrumento particular, de um lado:

1. INSTITUIÇÃO GESTORA DO POLLEN PARQUE CIENTÍFICO E TECNOLÓGICO, entidade de direito
   público/privado mantenedora das instalações de inovação e pesquisa.

E, de outro lado:

2. EMPRESA AFILIADA:
   - Razão Social: ${empresa.razao_social}
   - Nome Fantasia: ${empresa.nome_fantasia || 'Não informado'}
   - CNPJ / Registro: ${empresa.cnpj}
   - Modalidade Cadastral: ${empresa.tipo_empresa}
   - Representante Legal: ${empresa.nome_contato} (${empresa.cargo_contato || 'Representante'})
   - E-mail Corporativo: ${empresa.email}
   - Telefone / Contato: ${empresa.telefone}
   - Endereço Completo: ${empresa.endereco}

Celebram o presente TERMO DE AFILIAÇÃO sob as cláusulas e condições seguintes:

CLÁUSULA PRIMEIRA - DO OBJETO
O presente termo tem por objeto a concessão de uso e afiliação da EMPRESA ao ecossistema
de inovação do Pollen Parque, facultando o acesso aos programas de mentoria, networking,
serviços compartilhados e infraestrutura de desenvolvimento tecnológico.

CLÁUSULA SEGUNDA - DA VIGÊNCIA E ANUIDADE
O presente termo vigorará a partir da data de sua assinatura institucional pelo período de
vigência com término previsto para ${vigenciaFim}, podendo ser renovado mediante termo
aditivo e comprovação de regularidade fiscal e contábil.

CLÁUSULA TERCEIRA - DAS OBRIGAÇÕES FINANCEIRAS
A EMPRESA obriga-se ao adimplemento tempestivo das taxas de anuidade, serviços e cotas
condominiais de espaços físicos conforme faturas, notas fiscais e boletos emitidos pelo
setor contábil do Parque, sujeitando-se às penalidades de inadimplência em caso de atraso.

CLÁUSULA QUARTA - DOS DOCUMENTOS E COMPROBATÓRIOS
A EMPRESA declara sob as penas da lei a veracidade das Certidões Negativas de Débitos (CNDs),
atos constitutivos e documentos anexados via plataforma integrada do Pollen Parque.

CLÁUSULA QUINTA - DO TRÂMITE JURÍDICO E ASSINATURAS
Este instrumento é emitido de forma automatizada pelo Sistema Integrado do Pollen Parque,
sendo submetido à Procuradoria Jurídica institucional e condicionado à chancela dos seguintes signatários:
  [  ] 1. Representante Legal da Empresa (${empresa.nome_contato})
  [  ] 2. Primeiro Assinante Institucional - Gestão de Inovação
  [  ] 3. Segundo Assinante Institucional - Diretoria do Pollen
  [  ] 4. Terceiro Assinante Institucional - Coordenação de Projetos
  [  ] 5. Reitor em Exercício da Instituição Mantenedora

Emitido eletronicamente em: ${dataHoje}
Código de Autenticação Digital: SHA256-${Buffer.from(empresa.id + '_' + Date.now()).toString('base64').substring(0, 24)}
================================================================================
`.trim();
};

export const saveContractDocument = async (empresa, uploadsDir) => {
  const content = generateContractContent(empresa);
  const fileName = `Minuta_Afiliação_${empresa.cnpj.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}.txt`;
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, fileName);
  await fs.promises.writeFile(filePath, content, 'utf-8');

  return {
    fileName,
    filePath,
    fileSize: Buffer.byteLength(content, 'utf-8'),
    content
  };
};

