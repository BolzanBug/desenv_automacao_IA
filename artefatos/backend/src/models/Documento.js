import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Documento = sequelize.define('Documento', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  empresa_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  tipo_documento: {
    type: DataTypes.ENUM(
      'MINUTA_CONTRATO',
      'CONTRATO_ASSINADO',
      'CONTRATO_SOCIAL',
      'CND_FEDERAL',
      'CND_ESTADUAL',
      'CND_MUNICIPAL',
      'CND_TRABALHISTA',
      'OUTRO'
    ),
    allowNull: false
  },
  nome_original: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  caminho_arquivo: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  tamanho_bytes: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  mime_type: {
    type: DataTypes.STRING(100),
    defaultValue: 'application/pdf'
  },
  hash_sha256: {
    type: DataTypes.STRING(64),
    allowNull: true
  }
}, {
  tableName: 'documentos',
  timestamps: true,
  updatedAt: false,
  underscored: true
});

export default Documento;
