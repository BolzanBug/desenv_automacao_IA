import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import ContratoMinuta from './ContratoMinutaModel.js';
import AssinaturaContrato from './AssinaturaContratoModel.js';
import FaturaFinanceira from './FaturaFinanceiraModel.js';
import DocumentoAnexo from './DocumentoAnexoModel.js';
import EspacoFisico from './EspacoFisicoModel.js';
import ComunicacaoHistorico from './ComunicacaoHistoricoModel.js';
import AuditoriaLog from './AuditoriaLogModel.js';

const Empresa = sequelize.define('empresas', {
  id: {
    field: 'id',
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  razaoSocial: {
    field: 'razao_social',
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nomeFantasia: {
    field: 'nome_fantasia',
    type: DataTypes.STRING(255),
    allowNull: true
  },
  cnpj: {
    field: 'cnpj',
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  identificadorInternacional: {
    field: 'identificador_internacional',
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tipo: {
    field: 'tipo',
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'STARTUP' // STARTUP, PME, GRANDE_PORTE, INTERNACIONAL
  },
  statusAlteracaoContratual: {
    field: 'status_alteracao_contratual',
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    field: 'status',
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'EM_ANALISE' // EM_ANALISE, MINUTA_GERADA, EM_ASSINATURA, AGUARDANDO_PAGAMENTO, ATIVO, INADIMPLENTE, VENCIDO, SUSPENSO, DESLIGADO
  },
  emailContato: {
    field: 'email_contato',
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  telefone: {
    field: 'telefone',
    type: DataTypes.STRING(50),
    allowNull: true
  },
  enderecoCompleto: {
    field: 'endereco_completo',
    type: DataTypes.TEXT,
    allowNull: true
  },
  cidade: {
    field: 'cidade',
    type: DataTypes.STRING(100),
    allowNull: true
  },
  estado: {
    field: 'estado',
    type: DataTypes.STRING(50),
    allowNull: true
  },
  cep: {
    field: 'cep',
    type: DataTypes.STRING(20),
    allowNull: true
  },
  pais: {
    field: 'pais',
    type: DataTypes.STRING(100),
    defaultValue: 'Brasil'
  },
  representanteNome: {
    field: 'representante_nome',
    type: DataTypes.STRING(255),
    allowNull: false
  },
  representanteCpf: {
    field: 'representante_cpf',
    type: DataTypes.STRING(20),
    allowNull: true
  },
  representanteEmail: {
    field: 'representante_email',
    type: DataTypes.STRING(255),
    allowNull: true
  },
  representanteTelefone: {
    field: 'representante_telefone',
    type: DataTypes.STRING(50),
    allowNull: true
  },
  dataVigenciaInicio: {
    field: 'data_vigencia_inicio',
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  dataVigenciaFim: {
    field: 'data_vigencia_fim',
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
Empresa.hasMany(ContratoMinuta, {
  as: 'contratos',
  foreignKey: { name: 'empresaId', field: 'empresa_id' },
  onDelete: 'CASCADE'
});

Empresa.hasMany(AssinaturaContrato, {
  as: 'assinaturas',
  foreignKey: { name: 'empresaId', field: 'empresa_id' },
  onDelete: 'CASCADE'
});

Empresa.hasMany(FaturaFinanceira, {
  as: 'faturas',
  foreignKey: { name: 'empresaId', field: 'empresa_id' },
  onDelete: 'CASCADE'
});

Empresa.hasMany(DocumentoAnexo, {
  as: 'documentos',
  foreignKey: { name: 'empresaId', field: 'empresa_id' },
  onDelete: 'CASCADE'
});

Empresa.hasMany(EspacoFisico, {
  as: 'espacos',
  foreignKey: { name: 'empresaId', field: 'empresa_id' },
  onDelete: 'SET NULL'
});

Empresa.hasMany(ComunicacaoHistorico, {
  as: 'comunicacoes',
  foreignKey: { name: 'empresaId', field: 'empresa_id' },
  onDelete: 'SET NULL'
});

Empresa.hasMany(AuditoriaLog, {
  as: 'auditorias',
  foreignKey: { name: 'empresaId', field: 'empresa_id' },
  onDelete: 'CASCADE'
});
}, 0);

export default Empresa;
