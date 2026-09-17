import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Empresa from './EmpresaModel.js';

const DocumentoAnexo = sequelize.define('documentos_anexos', {
  id: {
    field: 'id',
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  empresaId: {
    field: 'empresa_id',
    type: DataTypes.UUID,
    allowNull: false
  },
  tipo: {
    field: 'tipo',
    type: DataTypes.STRING(50),
    allowNull: false // CONTRATO_SOCIAL, CERTIDAO_FEDERAL, CERTIDAO_ESTADUAL, CERTIDAO_TRABALHISTA, COMPROVANTE_CNPJ, MINUTA_ASSINADA, OUTROS
  },
  nomeOriginal: {
    field: 'nome_original',
    type: DataTypes.STRING(255),
    allowNull: false
  },
  caminhoArquivo: {
    field: 'caminho_arquivo',
    type: DataTypes.STRING(500),
    allowNull: false
  },
  mimeType: {
    field: 'mime_type',
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tamanhoBytes: {
    field: 'tamanho_bytes',
    type: DataTypes.BIGINT,
    allowNull: true
  },
  statusConferencia: {
    field: 'status_conferencia',
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'PENDENTE' // PENDENTE, APROVADO, REJEITADO
  },
  justificativaRejeicao: {
    field: 'justificativa_rejeicao',
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    field: 'created_at',
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    field: 'updated_at',
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  freezeTableName: true,
  timestamps: false
});

// Relacionamentos declarados no próprio Model
setTimeout(() => {
DocumentoAnexo.belongsTo(Empresa, {
  as: 'empresa',
  foreignKey: { name: 'empresaId', field: 'empresa_id' }
});
}, 0);

export default DocumentoAnexo;
