import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Empresa = sequelize.define('Empresa', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  razao_social: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nome_fantasia: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  cnpj: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  tipo_empresa: {
    type: DataTypes.ENUM('PADRAO', 'GRANDE_PORTE', 'INTERNACIONAL'),
    defaultValue: 'PADRAO',
    allowNull: false
  },
  nome_contato: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cargo_contato: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  telefone: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  endereco: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status_jornada: {
    type: DataTypes.ENUM('INSCRITA', 'EM_ANALISE', 'JURIDICO', 'ASSINATURA', 'ATIVA', 'INADIMPLENTE', 'VENCIDA', 'CANCELADA'),
    defaultValue: 'INSCRITA',
    allowNull: false
  },
  data_inicio_vigencia: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  data_fim_vigencia: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'empresas',
  timestamps: true,
  underscored: true
});

export default Empresa;
