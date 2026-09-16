import DocumentoAnexo from '../models/DocumentoAnexoModel.js';
import AuditoriaLog from '../models/AuditoriaLogModel.js';

const getByEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    const docs = await DocumentoAnexo.findAll({
      where: { empresaId: id },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).send({
      message: 'Documentos listados com sucesso',
      data: docs
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao listar documentos', error: error.message });
  }
};

const uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = req.body.tipo;
    const nomeOriginal = req.body.nomeOriginal || req.body.nome_original;
    const caminhoArquivo = req.body.caminhoArquivo || req.body.caminho_arquivo;
    const mimeType = req.body.mimeType || req.body.mime_type;
    const tamanhoBytes = req.body.tamanhoBytes || req.body.tamanho_bytes;

    const file = req.file;

    const doc = await DocumentoAnexo.create({
      empresaId: id,
      tipo: tipo || 'OUTROS',
      nomeOriginal: file ? file.originalname : (nomeOriginal || 'documento_anexo.pdf'),
      caminhoArquivo: file ? file.path : (caminhoArquivo || '/uploads/sample.pdf'),
      mimeType: file ? file.mimetype : (mimeType || 'application/pdf'),
      tamanhoBytes: file ? file.size : (tamanhoBytes || 1024),
      statusConferencia: 'PENDENTE'
    });

    await AuditoriaLog.create({
      empresaId: id,
      acao: 'DOCUMENTO_ANEXADO',
      usuario: 'OPERADOR_SISTEMA',
      detalhes: JSON.stringify({ docId: doc.id, tipo: doc.tipo, nome: doc.nomeOriginal })
    });

    return res.status(201).send({
      message: 'Documento anexado com sucesso',
      data: doc
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao fazer upload do documento', error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { docId } = req.params;
    const statusConferencia = req.body.statusConferencia || req.body.status_conferencia;
    const justificativaRejeicao = req.body.justificativaRejeicao || req.body.justificativa_rejeicao;

    const doc = await DocumentoAnexo.findByPk(docId);
    if (!doc) {
      return res.status(404).send({ message: 'Documento não encontrado', data: null });
    }

    doc.statusConferencia = statusConferencia || 'APROVADO';
    if (justificativaRejeicao) {
      doc.justificativaRejeicao = justificativaRejeicao;
    }
    await doc.save();

    return res.status(200).send({
      message: 'Status do documento atualizado',
      data: doc
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao atualizar documento', error: error.message });
  }
};

const removeDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const doc = await DocumentoAnexo.findByPk(docId);
    if (!doc) {
      return res.status(404).send({ message: 'Documento não encontrado', data: null });
    }

    await doc.destroy();

    return res.status(200).send({
      message: 'Documento removido com sucesso',
      data: { id: docId }
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao remover documento', error: error.message });
  }
};

export default {
  getByEmpresa,
  uploadDocument,
  updateStatus,
  removeDocument
};
