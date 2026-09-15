/*
================================================================================
ARQUITETURA DE DADOS & ADR (Architecture Decision Record)
Projeto: Sistema Unificado de Gestão de Afiliados - Pollen Parque Tecnológico
Autor: Arquiteto de Software Sênior & DBA PostgreSQL
Data: Setembro de 2026
Status: Aprovado e Homologado
================================================================================

1. TÍTULO DO ADR:
ADR-001: Modelagem Relacional PostgreSQL para Centralização Operacional do Pollen Parque

2. CONTEXTO E PROBLEMA DE NEGÓCIO:
O Pollen Parque operava historicamente com três planilhas desarticuladas no Google Drive
(1: Cadastro de empresas e contatos; 2: Controle contábil/financeiro com divisão de cores;
3: Gestão de ocupação de espaços físicos), além de minutas contratuais preenchidas manualmente
a partir de modelos com "X", arquivos avulsos no Drive e comunicações descentralizadas via
WhatsApp e caixa de e-mail NITO1. Com o salto projetado de 22 para 60 empresas afiliadas,
o risco de inconsistência, perda de prazos de vigência e erro de conciliação financeira
tornou a operação manual inviável.

3. DECISÕES ARQUITETURAIS:

A. SGBD Relacional (PostgreSQL):
   - Justificativa: Garantia de conformidade ACID, integridade referencial forte via chaves
     estrangeiras, tipos de dados estritos para finanças (DECIMAL/NUMERIC) e suporte a JSONB
     caso metadados dinâmicos sejam necessários no futuro.

B. Chaves Primárias Baseadas em UUID (v4):
   - Justificativa: Mitigar vulnerabilidades de enumeração de recursos (IDOR - Insecure Direct
     Object Reference) nos links externos de autoatendimento, boletos e contratos. Facilita
     futuras migrações distribuídas sem colisão de IDs sequenciais.

C. Modelo Normalizado em Terceira Forma Normal (3FN):
   - Separação estrita de domínios:
     * `empresas`: Entidade central com dados cadastrais e vigência de contrato.
     * `processos_juridicos`: Trâmite com a Procuradoria Jurídica e checklist das 5 assinaturas
       obrigatórias (Representante Legal + 3 Institucionais + Reitor em exercício).
     * `documentos`: Custódia de certidões (CNDs) e contratos gerados automaticamente.
     * `cobrancas`: Lançamentos contábeis (NFs, boletos, PIX e parcelamento).
     * `historico_emails`: Trilha de auditoria das comunicações individuais e em massa.
     * `espacos_fisicos`: Inventário e alocação de salas, coworking e laboratórios.

D. Integridade Referencial e Cascade:
   - Utilização de `ON DELETE CASCADE` para entidades subordinadas (documentos, cobranças,
     processos jurídicos e histórico de e-mails), impedindo registros órfãos caso um cadastro
     seja expurgado.
   - Utilização de `ON DELETE SET NULL` para `espacos_fisicos`, garantindo que se uma empresa
     for excluída, a sala ou bancada permaneça no inventário como liberada.

E. Estratégia de Indexação B-Tree:
   - Índices criados nos campos de consulta frequente: CNPJ/Identificador, status da jornada,
     data de vencimento financeiro, data de término de vigência e chaves estrangeiras.

4. CONSEQUÊNCIAS:
- Positivas: Eliminação completa de divergência entre finanças e cadastro; rastreabilidade de
  100% dos e-mails enviados; conformidade com LGPD pela custódia controlada; e histórico contábil
  sem risco de sobrescrita acidental típica de planilhas compartilhadas.
- Mitigações: Para uploads massivos, a aplicação salva o arquivo em disco/storage local e armazena
  o URI absoluto e metadados no banco, evitando inchaço desnecessário na base PostgreSQL.
================================================================================
*/

-- 1. Habilitação de extensões para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de Empresas Afiliadas
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(30) UNIQUE NOT NULL, -- Aceita formatação CNPJ brasileiro ou ID de empresas internacionais
    tipo_empresa VARCHAR(50) NOT NULL DEFAULT 'PADRAO' CHECK (tipo_empresa IN ('PADRAO', 'GRANDE_PORTE', 'INTERNACIONAL')),
    nome_contato VARCHAR(255) NOT NULL,
    cargo_contato VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(50) NOT NULL,
    endereco TEXT NOT NULL,
    status_jornada VARCHAR(50) NOT NULL DEFAULT 'INSCRITA' CHECK (
        status_jornada IN ('INSCRITA', 'EM_ANALISE', 'JURIDICO', 'ASSINATURA', 'ATIVA', 'INADIMPLENTE', 'VENCIDA', 'CANCELADA')
    ),
    data_inicio_vigencia DATE,
    data_fim_vigencia DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Processos Jurídicos e Assinaturas (Procuradoria Jurídica)
CREATE TABLE IF NOT EXISTS processos_juridicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL UNIQUE REFERENCES empresas(id) ON DELETE CASCADE,
    numero_chamado_procuradoria VARCHAR(100),
    status_assinatura VARCHAR(50) NOT NULL DEFAULT 'AGUARDANDO_PROCURADORIA' CHECK (
        status_assinatura IN ('AGUARDANDO_PROCURADORIA', 'ASSINATURAS_PENDENTES', 'ASSINADO_CONCLUIDO')
    ),
    assinado_rep_legal BOOLEAN NOT NULL DEFAULT FALSE,
    assinado_inst_1 BOOLEAN NOT NULL DEFAULT FALSE,
    assinado_inst_2 BOOLEAN NOT NULL DEFAULT FALSE,
    assinado_inst_3 BOOLEAN NOT NULL DEFAULT FALSE,
    assinado_reitor BOOLEAN NOT NULL DEFAULT FALSE,
    data_abertura TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_conclusao TIMESTAMP WITH TIME ZONE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Documentos e Minutas Contratuais
CREATE TABLE IF NOT EXISTS documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    tipo_documento VARCHAR(50) NOT NULL CHECK (
        tipo_documento IN ('MINUTA_CONTRATO', 'CONTRATO_ASSINADO', 'CONTRATO_SOCIAL', 'CND_FEDERAL', 'CND_ESTADUAL', 'CND_MUNICIPAL', 'CND_TRABALHISTA', 'OUTRO')
    ),
    nome_original VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    tamanho_bytes BIGINT DEFAULT 0,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    hash_sha256 VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Cobranças Contábeis (Substituição da aba Laranja da Planilha)
CREATE TABLE IF NOT EXISTS cobrancas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    numero_nf VARCHAR(100) NOT NULL,
    numero_boleto VARCHAR(100),
    linha_digitavel VARCHAR(100),
    chave_pix VARCHAR(255),
    valor DECIMAL(10, 2) NOT NULL CHECK (valor >= 0),
    parcela_atual INT NOT NULL DEFAULT 1,
    total_parcelas INT NOT NULL DEFAULT 1,
    data_vencimento DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDENTE' CHECK (
        status IN ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO')
    ),
    data_pagamento TIMESTAMP WITH TIME ZONE,
    comprovante_url VARCHAR(500),
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Histórico de Comunicação e E-mails
CREATE TABLE IF NOT EXISTS historico_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    destinatarios TEXT NOT NULL,
    assunto VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    tipo_envio VARCHAR(50) NOT NULL DEFAULT 'INDIVIDUAL' CHECK (tipo_envio IN ('INDIVIDUAL', 'MASSA')),
    enviado_por VARCHAR(100) DEFAULT 'equipe.pollen@instituicao.edu.br',
    enviado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assegura colunas mesmo em bases pré-existentes
ALTER TABLE historico_emails ADD COLUMN IF NOT EXISTS destinatarios TEXT;
ALTER TABLE historico_emails ADD COLUMN IF NOT EXISTS tipo_envio VARCHAR(50) DEFAULT 'INDIVIDUAL';
ALTER TABLE historico_emails ADD COLUMN IF NOT EXISTS enviado_por VARCHAR(100) DEFAULT 'equipe.pollen@instituicao.edu.br';

-- 7. Tabela de Espaços Físicos do Pollen Parque (Substituição da 3ª planilha)
CREATE TABLE IF NOT EXISTS espacos_fisicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
    identificador VARCHAR(100) NOT NULL UNIQUE, -- Ex: Sala 104, Estação Coworking C-08, Módulo Lab Biotech
    tipo VARCHAR(50) NOT NULL CHECK (
        tipo IN ('SALA_PRIVATIVA', 'BANCADA_COWORKING', 'MODULO_LAB', 'BOX_EMPREENDEDOR')
    ),
    capacidade INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'DISPONIVEL' CHECK (
        status IN ('DISPONIVEL', 'OCUPADO', 'MANUTENCAO')
    ),
    data_inicio_ocupacao DATE,
    data_fim_ocupacao DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Índices de Alta Performance
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas (cnpj);
CREATE INDEX IF NOT EXISTS idx_empresas_status_jornada ON empresas (status_jornada);
CREATE INDEX IF NOT EXISTS idx_empresas_data_fim_vigencia ON empresas (data_fim_vigencia);

CREATE INDEX IF NOT EXISTS idx_cobrancas_empresa_id ON cobrancas (empresa_id);
CREATE INDEX IF NOT EXISTS idx_cobrancas_status_vencimento ON cobrancas (status, data_vencimento);

CREATE INDEX IF NOT EXISTS idx_documentos_empresa_id ON documentos (empresa_id);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos (tipo_documento);

CREATE INDEX IF NOT EXISTS idx_historico_emails_empresa_id ON historico_emails (empresa_id);
CREATE INDEX IF NOT EXISTS idx_espacos_fisicos_empresa_id ON espacos_fisicos (empresa_id);
CREATE INDEX IF NOT EXISTS idx_espacos_fisicos_status ON espacos_fisicos (status);

-- 9. Trigger para Manutenção Automática do Timestamp 'updated_at'
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_empresas ON empresas;
CREATE TRIGGER set_timestamp_empresas
BEFORE UPDATE ON empresas
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_processos ON processos_juridicos;
CREATE TRIGGER set_timestamp_processos
BEFORE UPDATE ON processos_juridicos
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_cobrancas ON cobrancas;
CREATE TRIGGER set_timestamp_cobrancas
BEFORE UPDATE ON cobrancas
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_espacos ON espacos_fisicos;
CREATE TRIGGER set_timestamp_espacos
BEFORE UPDATE ON espacos_fisicos
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Assegura valores padrão para created_at e updated_at
ALTER TABLE IF EXISTS empresas ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS empresas ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS espacos_fisicos ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS espacos_fisicos ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS cobrancas ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS cobrancas ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS processos_juridicos ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS processos_juridicos ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS documentos ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

-- 10. Seeds Iniciais de Homologação (Carga das Empresas Fechadas e Espaços do Pollen)
INSERT INTO espacos_fisicos (id, identificador, tipo, capacidade, status, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111101', 'Sala Privativa 101', 'SALA_PRIVATIVA', 6, 'DISPONIVEL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('11111111-1111-1111-1111-111111111102', 'Sala Privativa 102', 'SALA_PRIVATIVA', 8, 'DISPONIVEL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('11111111-1111-1111-1111-111111111103', 'Bancada Coworking C-01', 'BANCADA_COWORKING', 1, 'DISPONIVEL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('11111111-1111-1111-1111-111111111104', 'Bancada Coworking C-02', 'BANCADA_COWORKING', 1, 'DISPONIVEL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('11111111-1111-1111-1111-111111111105', 'Módulo de Laboratório Biotech 01', 'MODULO_LAB', 4, 'DISPONIVEL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (identificador) DO NOTHING;
