import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Empresa from './EmpresaModel.js';

const AuditoriaLog = sequelize.define('auditoria_logs', {
  id: {
    field: 'id',
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  empresaId: {
    field: 'empresa_id',
    type: DataTypes.UUID,
    allowNull: true
  },
  acao: {
    field: 'acao',
    type: DataTypes.STRING(100),
    allowNull: false
  },
  usuario: {
    field: 'usuario',
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'SISTEMA'
  },
  detalhes: {
    field: 'detalhes',
    type: DataTypes.TEXT,
    allowNull: true
  },
  ipOrigem: {
    field: 'ip_origem',
    type: DataTypes.STRING(50),
    allowNull: true
  },
  createdAt: {
    field: 'created_at',
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  freezeTableName: true,
  timestamps: false
});

// Relacionamentos declarados no próprio Model
AuditoriaLog.belongsTo(Empresa, {
  as: 'empresa',
  foreignKey: { name: 'empresaId', field: 'empresa_id' }
});

export default AuditoriaLog;