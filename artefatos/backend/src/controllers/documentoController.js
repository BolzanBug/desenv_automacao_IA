import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Empresa, Documento } from '../models/index.js';
import { saveContractDocument } from '../utils/contractGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

export const generate = async (req, res) => {
  try {
    const id = req.params.id;
    const empresa = await Empresa.findByPk(id);

    if (!empresa) {
      return res.status(404).send({
        message: 'Empresa não encontrada para geração de minuta contratual.'
      });
    }

    const { fileName, filePath, fileSize, content } = await saveContractDocument(empresa, UPLOADS_DIR);

    const doc = await Documento.create({
      empresa_id: id,
      tipo_documento: 'MINUTA_CONTRATO',
      nome_original: fileName,
      caminho_arquivo: `/uploads/${fileName}`,
      tamanho_bytes: fileSize,
      mime_type: 'text/plain'
    });

    // Se estiver em status inicial, avança para EM_ANALISE ou JURIDICO
    if (empresa.status_jornada === 'INSCRITA') {
      empresa.status_jornada = 'EM_ANALISE';
      await empresa.save();
    }

    return res.status(201).send({
      message: 'Minuta de termo de afiliação gerada automaticamente com sucesso.',
      data: {
        documentId: doc.id,
        nomeOriginal: fileName,
        documentUrl: `/uploads/${fileName}`,
        previewContent: content
      }
    });
  } catch (error) {
    console.error('Erro ao gerar documento contratual:', error);
    return res.status(500).send({
      message: 'Erro interno ao gerar minuta contratual.',
      error: error.message
    });
  }
};

export const upload = async (req, res) => {
  try {
    const id = req.params.id;
    const file = req.file;
    const { tipoDocumento } = req.body;

    const empresa = await Empresa.findByPk(id);
    if (!empresa) {
      return res.status(404).send({
        message: 'Empresa vinculada não encontrada.'
      });
    }

    if (!file) {
      return res.status(400).send({
        message: 'Nenhum arquivo enviado na requisição multipart.'
      });
    }

    const doc = await Documento.create({
      empresa_id: id,
      tipo_documento: tipoDocumento || 'OUTRO',
      nome_original: file.originalname,
      caminho_arquivo: `/uploads/${file.filename}`,
      tamanho_bytes: file.size,
      mime_type: file.mimetype
    });

    return res.status(201).send({
      message: 'Documento recebido e anexado com sucesso ao perfil do afiliado.',
      data: doc
    });
  } catch (error) {
    console.error('Erro ao realizar upload de documento:', error);
    return res.status(500).send({
      message: 'Erro interno ao processar upload do documento.',
      error: error.message
    });
  }
};

export const getByCompany = async (req, res) => {
  try {
    const id = req.params.id;
    const documentos = await Documento.findAll({
      where: { empresa_id: id },
      order: [['created_at', 'DESC']]
    });

    return res.status(200).send({
      message: 'Documentos do afiliado recuperados com sucesso.',
      count: documentos.length,
      data: documentos
    });
  } catch (error) {
    console.error('Erro ao buscar documentos da empresa:', error);
    return res.status(500).send({
      message: 'Erro interno ao consultar documentos.',
      error: error.message
    });
  }
};

export const download = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Documento.findByPk(id);

    if (!doc) {
      return res.status(404).send({
        message: 'Documento não localizado no acervo.'
      });
    }

    const fullPath = path.resolve(__dirname, '../..', doc.caminho_arquivo.replace(/^\//, ''));
    if (!fs.existsSync(fullPath)) {
      return res.status(404).send({
        message: 'Arquivo físico não encontrado no storage local.'
      });
    }

    return res.download(fullPath, doc.nome_original);
  } catch (error) {
    console.error('Erro ao baixar documento:', error);
    return res.status(500).send({
      message: 'Erro interno ao baixar documento.',
      error: error.message
    });
  }
};
