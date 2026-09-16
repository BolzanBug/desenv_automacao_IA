import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Empresa from './EmpresaModel.js';
import ContratoMinuta from './ContratoMinutaModel.js';

const AssinaturaContrato = sequelize.define('assinaturas_contrato', {
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
  contratoId: {
    field: 'contrato_id',
    type: DataTypes.UUID,
    allowNull: true
  },
  signatarioTipo: {
    field: 'signatario_tipo',
    type: DataTypes.STRING(50),
    allowNull: false // REPRESENTANTE_LEGAL, INSTITUCIONAL_1, INSTITUCIONAL_2, INSTITUCIONAL_3, REITOR
  },
  nome: {
    field: 'nome',
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cargo: {
    field: 'cargo',
    type: DataTypes.STRING(150),
    allowNull: true
  },
  email: {
    field: 'email',
    type: DataTypes.STRING(255),
    allowNull: true
  },
  assinado: {
    field: 'assinado',
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  dataAssinatura: {
    field: 'data_assinatura',
    type: DataTypes.DATE,
    allowNull: true
  },
  observacoes: {
    field: 'observacoes',
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
AssinaturaContrato.belongsTo(Empresa, {
  as: 'empresa',
  foreignKey: { name: 'empresaId', field: 'empresa_id' }
});

AssinaturaContrato.belongsTo(ContratoMinuta, {
  as: 'contrato',
  foreignKey: { name: 'contratoId', field: 'contrato_id' }
});

export default AssinaturaContrato;