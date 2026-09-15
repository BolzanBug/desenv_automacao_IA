import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const HistoricoEmail = sequelize.define('HistoricoEmail', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  empresa_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  destinatarios: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  assunto: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  conteudo: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo_envio: {
    type: DataTypes.ENUM('INDIVIDUAL', 'MASSA'),
    defaultValue: 'INDIVIDUAL',
    allowNull: false
  },
  enviado_por: {
    type: DataTypes.STRING(100),
    defaultValue: 'equipe.pollen@instituicao.edu.br'
  },
  enviado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'historico_emails',
  timestamps: false,
  underscored: true
});

export default HistoricoEmail;
