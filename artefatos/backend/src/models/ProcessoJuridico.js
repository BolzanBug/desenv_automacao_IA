import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ProcessoJuridico = sequelize.define('ProcessoJuridico', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  empresa_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  numero_chamado_procuradoria: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status_assinatura: {
    type: DataTypes.ENUM('AGUARDANDO_PROCURADORIA', 'ASSINATURAS_PENDENTES', 'ASSINADO_CONCLUIDO'),
    defaultValue: 'AGUARDANDO_PROCURADORIA',
    allowNull: false
  },
  assinado_rep_legal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  assinado_inst_1: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  assinado_inst_2: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  assinado_inst_3: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  assinado_reitor: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  data_abertura: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  data_conclusao: {
    type: DataTypes.DATE,
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'processos_juridicos',
  timestamps: true,
  underscored: true
});

export default ProcessoJuridico;

