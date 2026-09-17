import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Empresa from './EmpresaModel.js';
import AssinaturaContrato from './AssinaturaContratoModel.js';

const ContratoMinuta = sequelize.define('contratos_minutas', {
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
  numeroTermo: {
    field: 'numero_termo',
    type: DataTypes.STRING(50),
    allowNull: false
  },
  titulo: {
    field: 'titulo',
    type: DataTypes.STRING(255),
    allowNull: false
  },
  conteudoGerado: {
    field: 'conteudo_gerado',
    type: DataTypes.TEXT,
    allowNull: false
  },
  valorAnuidade: {
    field: 'valor_anuidade',
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 3600.00
  },
  status: {
    field: 'status',
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'GERADO' // GERADO, EM_ASSINATURA, ASSINADO, CANCELADO
  },
  geradoEm: {
    field: 'gerado_em',
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
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
ContratoMinuta.belongsTo(Empresa, {
  as: 'empresa',
  foreignKey: { name: 'empresaId', field: 'empresa_id' }
});

ContratoMinuta.hasMany(AssinaturaContrato, {
  as: 'assinaturas',
  foreignKey: { name: 'contratoId', field: 'contrato_id' },
  onDelete: 'SET NULL'
});
}, 0);

export default ContratoMinuta;
