import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import libre from 'libreoffice-convert';
import { promisify } from 'util';

const libreConvertAsync = promisify(libre.convert);

/**
 * Gera um contrato substituindo marcadores genéricos de um DOCX
 * e depois converte para PDF usando libreoffice-convert.
 */
export async function generateContractPdf(empresa, options = {}) {
  // Caminho do modelo
  const templatePath = path.resolve('erros-logica/Modelo minuta Programa de Afiliados (1).docx');
  const content = fs.readFileSync(templatePath, 'binary');

  // Abre o DOCX
  const zip = new PizZip(content);

  // Pega o XML principal
  let xml = zip.file('word/document.xml').asText();

  // Substitui os marcadores textuais brutos
  const razaoSocial = (empresa.razaoSocial || empresa.razao_social || '').toUpperCase();
  const cnpj = empresa.cnpj || 'NAO_INFORMADO';
  const emailContato = empresa.emailContato || empresa.email_contato || 'NAO_INFORMADO';
  const representanteNome = empresa.representanteNome || empresa.representante_nome || '';
  const representanteCargo = empresa.representanteCargo || empresa.representante_cargo || 'Representante Legal';
  
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const mes = meses[hoje.getMonth()];
  const ano = hoje.getFullYear();

  // Substituição (o documento tem XXXXXXXXXXXXXX, XXXXXXXXXXXXXXXXXXX e lacunas de data)
  xml = xml.replace(/XXXXXXXXXXXXXX/g, razaoSocial);
  xml = xml.replace(/XXXXXXXXXXXXXXXXXXX/g, emailContato);
  xml = xml.replace(/__ de ______________ de 2026/g, `${dia} de ${mes} de ${ano}`);
  xml = xml.replace(/NomeCargoEmpresa/g, `${representanteNome} / ${representanteCargo} / ${razaoSocial}`);

  // Atualiza o XML no zip
  zip.file('word/document.xml', xml);

  // Gera o buffer do DOCX preenchido
  const docxBuffer = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });

  // Converte para PDF
  const pdfBuffer = await libreConvertAsync(docxBuffer, '.pdf', undefined);

  // Salva no disco (em uploads/contratos)
  const dirPath = path.resolve('uploads', 'contratos');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const fileName = `contrato_${empresa.id}.pdf`;
  const pdfPath = path.join(dirPath, fileName);
  fs.writeFileSync(pdfPath, pdfBuffer);

  return {
    caminho_arquivo: `/uploads/contratos/${fileName}`,
    nome_original: fileName,
    tamanho_bytes: pdfBuffer.length
  };
}
