import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Empresa from './EmpresaModel.js';

const FaturaFinanceira = sequelize.define('faturas_financeiras', {
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
  numeroNf: {
    field: 'numero_nf',
    type: DataTypes.STRING(50),
    allowNull: true
  },
  numeroBoleto: {
    field: 'numero_boleto',
    type: DataTypes.STRING(100),
    allowNull: true
  },
  chavePix: {
    field: 'chave_pix',
    type: DataTypes.STRING(255),
    allowNull: true
  },
  pixCopiaCola: {
    field: 'pix_copia_cola',
    type: DataTypes.TEXT,
    allowNull: true
  },
  valor: {
    field: 'valor',
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  numeroParcela: {
    field: 'numero_parcela',
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  totalParcelas: {
    field: 'total_parcelas',
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  dataEmissao: {
    field: 'data_emissao',
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  dataVencimento: {
    field: 'data_vencimento',
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dataPagamento: {
    field: 'data_pagamento',
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  valorPago: {
    field: 'valor_pago',
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  formaPagamento: {
    field: 'forma_pagamento',
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    field: 'status',
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'PENDENTE' // PENDENTE, PAGO, ATRASADO, CANCELADO
  },
  comprovanteUrl: {
    field: 'comprovante_url',
    type: DataTypes.STRING(500),
    allowNull: true
  },
  operadorBaixa: {
    field: 'operador_baixa',
    type: DataTypes.STRING(255),
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
FaturaFinanceira.belongsTo(Empresa, {
  as: 'empresa',
  foreignKey: { name: 'empresaId', field: 'empresa_id' }
});

export default FaturaFinanceira;