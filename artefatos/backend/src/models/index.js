import Empresa from './Empresa.js';
import ProcessoJuridico from './ProcessoJuridico.js';
import Documento from './Documento.js';
import Cobranca from './Cobranca.js';
import HistoricoEmail from './HistoricoEmail.js';
import EspacoFisico from './EspacoFisico.js';

// Relacionamentos 1:1
Empresa.hasOne(ProcessoJuridico, { foreignKey: 'empresa_id', as: 'processoJuridico', onDelete: 'CASCADE' });
ProcessoJuridico.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// Relacionamentos 1:N
Empresa.hasMany(Documento, { foreignKey: 'empresa_id', as: 'documentos', onDelete: 'CASCADE' });
Documento.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

Empresa.hasMany(Cobranca, { foreignKey: 'empresa_id', as: 'cobrancas', onDelete: 'CASCADE' });
Cobranca.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

Empresa.hasMany(HistoricoEmail, { foreignKey: 'empresa_id', as: 'historicoEmails', onDelete: 'CASCADE' });
HistoricoEmail.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

Empresa.hasMany(EspacoFisico, { foreignKey: 'empresa_id', as: 'espacosFisicos', onDelete: 'SET NULL' });
EspacoFisico.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

export {
  Empresa,
  ProcessoJuridico,
  Documento,
  Cobranca,
  HistoricoEmail,
  EspacoFisico
};

