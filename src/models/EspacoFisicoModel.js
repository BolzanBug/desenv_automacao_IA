import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Empresa from './EmpresaModel.js';

const EspacoFisico = sequelize.define('espacos_fisicos', {
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
  nome: {
    field: 'nome',
    type: DataTypes.STRING(100),
    allowNull: false
  },
  tipo: {
    field: 'tipo',
    type: DataTypes.STRING(50),
    allowNull: false // SALA_PRIVATIVA, COWORKING, LABORATORIO
  },
  bloco: {
    field: 'bloco',
    type: DataTypes.STRING(50),
    allowNull: true
  },
  capacidade: {
    field: 'capacidade',
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  status: {
    field: 'status',
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'DISPONIVEL' // DISPONIVEL, OCUPADO, MANUTENCAO
  },
  dataInicioOcupacao: {
    field: 'data_inicio_ocupacao',
    type: DataTypes.DATEONLY,
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
setTimeout(() => {
EspacoFisico.belongsTo(Empresa, {
  as: 'empresa',
  foreignKey: { name: 'empresaId', field: 'empresa_id' }
});
}, 0);

export default EspacoFisico;
