import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import PizZip from 'pizzip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Converte valor numérico em string formatada em Reais com valor por extenso básico
 */
export function formatCurrencyWithExtenso(valor) {
  const num = typeof valor === 'number' ? valor : parseFloat(String(valor).replace(',', '.')) || 3600;
  const formatado = num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  let extenso = 'três mil e seiscentos reais';
  if (num === 3600) extenso = 'três mil e seiscentos reais';
  else if (num === 1200) extenso = 'um mil e duzentos reais';
  else if (num === 1800) extenso = 'um mil e oitocentos reais';
  else if (num === 2400) extenso = 'dois mil e quatrocentos reais';
  else if (num === 4800) extenso = 'quatro mil e oitocentos reais';
  else if (num === 5000) extenso = 'cinco mil reais';
  else if (num === 6000) extenso = 'seis mil reais';
  else if (num === 7200) extenso = 'sete mil e duzentos reais';
  else {
    extenso = `${num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} reais`;
  }

  return `${formatado} (${extenso})`;
}

/**
 * Localiza o caminho do modelo DOCX de forma resiliente e absoluta
 */
function getTemplatePath() {
  const candidatePaths = [
    path.resolve(__dirname, '../templates/modelo_minuta_afiliados.docx'),
    path.resolve(__dirname, '../../erros-logica/Modelo minuta Programa de Afiliados (1).docx'),
    path.resolve('src/templates/modelo_minuta_afiliados.docx'),
    path.resolve('erros-logica/Modelo minuta Programa de Afiliados (1).docx')
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error(`Arquivo modelo DOCX não encontrado em nenhum dos caminhos previstos: ${candidatePaths.join(', ')}`);
}

/**
 * Converte um buffer DOCX para PDF utilizando o LibreOffice nativo de forma direta e resiliente
 */
function convertDocxBufferToPdf(docxBuffer) {
  return new Promise((resolve) => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pollen_contract_'));
    const sourceDocx = path.join(tmpDir, 'documento.docx');
    const expectedPdf = path.join(tmpDir, 'documento.pdf');

    try {
      fs.writeFileSync(sourceDocx, docxBuffer);
    } catch (writeErr) {
      console.warn('[CONVERSOR-MINUTA] Erro ao gravar arquivo temporário:', writeErr.message);
      return resolve(null);
    }

    const binaryCandidates = ['soffice', 'libreoffice', '/usr/bin/soffice', '/usr/bin/libreoffice'];
    
    // Tenta encontrar e executar o primeiro binário viável
    const tryBinary = (index) => {
      if (index >= binaryCandidates.length) {
        // Limpa diretório temporário
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
        return resolve(null);
      }

      const bin = binaryCandidates[index];
      execFile(bin, ['--headless', '--convert-to', 'pdf', sourceDocx, '--outdir', tmpDir], (err) => {
        if (fs.existsSync(expectedPdf)) {
          try {
            const pdfBuffer = fs.readFileSync(expectedPdf);
            fs.rmSync(tmpDir, { recursive: true, force: true });
            return resolve(pdfBuffer);
          } catch (readErr) {
            console.warn('[CONVERSOR-MINUTA] Erro ao ler PDF gerado:', readErr.message);
          }
        }
        // Se falhou com este binário, tenta o próximo
        tryBinary(index + 1);
      });
    };

    tryBinary(0);
  });
}

/**
 * Gera um contrato substituindo todos os marcadores do modelo DOCX oficial
 * e converte para PDF usando LibreOffice (com fallback resiliente para DOCX).
 */
export async function generateContractPdf(empresa, options = {}) {
  const templatePath = getTemplatePath();
  const content = fs.readFileSync(templatePath, 'binary');

  // Abre o DOCX no buffer do PizZip
  const zip = new PizZip(content);

  // Extrai o XML principal do documento
  let xml = zip.file('word/document.xml').asText();

  // Dados da empresa e do representante normalizados
  const razaoSocial = (empresa.razaoSocial || empresa.razao_social || '').toUpperCase().trim();
  const cnpj = empresa.cnpj || 'NÃO INFORMADO';
  const emailContato = empresa.emailContato || empresa.email_contato || 'contato@empresa.com.br';
  const emailCobranca = empresa.emailCobranca || empresa.email_cobranca || emailContato;
  const telefoneEmpresa = empresa.telefone || '(49) 3321-0000';
  const enderecoCompleto = empresa.enderecoCompleto || empresa.endereco_completo || 'Endereço da sede da empresa';
  const cidade = empresa.cidade || 'Chapecó';
  const estado = empresa.estado || 'SC';

  const representanteNome = empresa.representanteNome || empresa.representante_nome || 'Representante Legal';
  const representanteCpf = empresa.representanteCpf || empresa.representante_cpf || '000.000.000-00';
  const representanteEmail = empresa.representanteEmail || empresa.representante_email || emailContato;
  const representanteTelefone = empresa.representanteTelefone || empresa.representante_telefone || telefoneEmpresa;
  const representanteCargo = empresa.representanteCargo || empresa.representante_cargo || 'Representante Legal';

  const valorAnuidadeNum = options.valor_anuidade || options.valorAnuidade || empresa.valorAnuidade || 3600;
  const valorAnuidadeTexto = formatCurrencyWithExtenso(valorAnuidadeNum);

  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const mes = meses[hoje.getMonth()];
  const ano = hoje.getFullYear();

  // 1. Título do preâmbulo (XXXXXXXXXXXXXX isolado na tag)
  xml = xml.replace('>XXXXXXXXXXXXXX</w:t>', `>${razaoSocial}</w:t>`);

  // 2. Qualificação da empresa
  xml = xml.replace('XXXXXXXXXXXXXXXXXXXXXXX,', `${razaoSocial},`);
  xml = xml.replace('XX.XXX.XXX/XXXX-XX', cnpj);
  xml = xml.replace('XXXXXXXXXXXXXXXXXXXX, nº XXX, complemento X, bairro XXXXXXXXXXXXX', enderecoCompleto);
  xml = xml.replace('na cidade de XXXXXXXXXXXXXX, estado de ', `na cidade de ${cidade}, estado de `);
  xml = xml.replace('>XXXXXXXXXXXXXX,  telefone<', `>${estado},  telefone<`);
  xml = xml.replace('(XX) XXXXXXXXXXXXX, neste ato representado pelo (a)', `${telefoneEmpresa}, neste ato representado pelo (a)`);

  // 3. Representante legal
  xml = xml.replace('(a). XXXXXXXXXXXXXX, inscrito(a)', `(a). ${representanteNome}, inscrito(a)`);
  xml = xml.replace('XXX.XXX.XXX-XX', representanteCpf);
  xml = xml.replace('e-mail XXXXXXXXXXXXXXXXX, telefone (XX) XXXXXXXXX,', `e-mail ${representanteEmail}, telefone ${representanteTelefone},`);

  // 4. Cláusula Terceira (Valor e Cobrança)
  xml = xml.replace('R$ XXXXXXXX,00 (XXXXXXXXXXX)', valorAnuidadeTexto);
  xml = xml.replace('>XXXXXXXXXXXXXXXXXXXXXX<', `>${emailCobranca}<`);

  // 5. Cláusula Sétima (Comunicação)
  xml = xml.replace('XXXXXXXXXXXXXXXXXXX ', `${emailContato} `);

  // 6. Data de encerramento e Assinaturas
  xml = xml.replace('__ de ______________ de 2026', `${dia} de ${mes} de ${ano}`);
  xml = xml.replace('NomeCargoEmpresa', `${representanteNome} / ${representanteCargo} / ${razaoSocial}`);

  // Atualiza o XML no zip
  zip.file('word/document.xml', xml);

  // Gera o buffer do DOCX preenchido
  const docxBuffer = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });

  // Diretório para salvar arquivos gerados
  const dirPath = path.resolve('uploads', 'contratos');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Tenta converter diretamente para PDF via LibreOffice
  const pdfBuffer = await convertDocxBufferToPdf(docxBuffer);

  if (pdfBuffer) {
    const pdfFileName = `contrato_${empresa.id}.pdf`;
    const pdfFilePath = path.join(dirPath, pdfFileName);
    fs.writeFileSync(pdfFilePath, pdfBuffer);

    return {
      caminho_arquivo: `/uploads/contratos/${pdfFileName}`,
      nome_original: pdfFileName,
      tamanho_bytes: pdfBuffer.length,
      is_docx: false,
      mime_type: 'application/pdf'
    };
  }

  // Fallback seguro caso LibreOffice não esteja presente
  const docxFileName = `contrato_${empresa.id}.docx`;
  const docxFilePath = path.join(dirPath, docxFileName);
  fs.writeFileSync(docxFilePath, docxBuffer);

  return {
    caminho_arquivo: `/uploads/contratos/${docxFileName}`,
    nome_original: docxFileName,
    tamanho_bytes: docxBuffer.length,
    is_docx: true,
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    aviso: 'Minuta preenchida gerada no formato DOCX devido à indisponibilidade do motor LibreOffice.'
  };
}

export default {
  generateContractPdf,
  formatCurrencyWithExtenso
};
