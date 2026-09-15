import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Cobranca = sequelize.define('Cobranca', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  empresa_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  numero_nf: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  numero_boleto: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  linha_digitavel: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  chave_pix: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  parcela_atual: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  total_parcelas: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  data_vencimento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO'),
    defaultValue: 'PENDENTE',
    allowNull: false
  },
  data_pagamento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  comprovante_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  observacao: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'cobrancas',
  timestamps: true,
  underscored: true
});

export default Cobranca;
