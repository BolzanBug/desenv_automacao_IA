import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const EspacoFisico = sequelize.define('EspacoFisico', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  empresa_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  identificador: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  tipo: {
    type: DataTypes.ENUM('SALA_PRIVATIVA', 'BANCADA_COWORKING', 'MODULO_LAB', 'BOX_EMPREENDEDOR'),
    allowNull: false
  },
  capacidade: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('DISPONIVEL', 'OCUPADO', 'MANUTENCAO'),
    defaultValue: 'DISPONIVEL',
    allowNull: false
  },
  data_inicio_ocupacao: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  data_fim_ocupacao: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'espacos_fisicos',
  timestamps: true,
  underscored: true
});

export default EspacoFisico;

