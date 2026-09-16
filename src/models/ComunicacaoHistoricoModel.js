import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Empresa from './EmpresaModel.js';

const ComunicacaoHistorico = sequelize.define('comunicacoes_historico', {
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
  destinatarioEmail: {
    field: 'destinatario_email',
    type: DataTypes.STRING(255),
    allowNull: false
  },
  destinatarioNome: {
    field: 'destinatario_nome',
    type: DataTypes.STRING(255),
    allowNull: true
  },
  assunto: {
    field: 'assunto',
    type: DataTypes.STRING(255),
    allowNull: false
  },
  mensagem: {
    field: 'mensagem',
    type: DataTypes.TEXT,
    allowNull: false
  },
  templateTipo: {
    field: 'template_tipo',
    type: DataTypes.STRING(50),
    defaultValue: 'GERAL' // AVISO_EDITAL, COBRANCA_PENDENTE, LEMBRETE_VIGENCIA, GERAL
  },
  statusEnvio: {
    field: 'status_envio',
    type: DataTypes.STRING(50),
    defaultValue: 'ENVIADO'
  },
  enviadoEm: {
    field: 'enviado_em',
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  freezeTableName: true,
  timestamps: false
});

// Relacionamentos declarados no próprio Model
ComunicacaoHistorico.belongsTo(Empresa, {
  as: 'empresa',
  foreignKey: { name: 'empresaId', field: 'empresa_id' }
});

export default ComunicacaoHistorico;