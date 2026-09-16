-- ==============================================================================
-- SISTEMA INTEGRADO DE GESTÃO DE AFILIADOS — POLLEN PARQUE CIENTÍFICO E TECNOLÓGICO
-- ARQUITETURA DE DADOS RELACIONAL (POSTGRESQL 16) — 3ª FORMA NORMAL (3FN)
-- ARQUITETO DE SOFTWARE SÊNIOR
-- ==============================================================================

-- Habilita extensão para geração nativa de UUIDs v4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- FUNÇÃO E TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA DE TIMESTAMP
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 1. TABELA: empresas (Núcleo Cadastral de Afiliadas e Candidatas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(20) UNIQUE,
    identificador_internacional VARCHAR(100),
    tipo VARCHAR(50) NOT NULL DEFAULT 'STARTUP', -- STARTUP, PME, GRANDE_PORTE, INTERNACIONAL
    status_alteracao_contratual BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'EM_ANALISE', -- EM_ANALISE, MINUTA_GERADA, EM_ASSINATURA, AGUARDANDO_PAGAMENTO, ATIVO, INADIMPLENTE, VENCIDO, SUSPENSO, DESLIGADO
    email_contato VARCHAR(255) NOT NULL,
    telefone VARCHAR(50),
    endereco_completo TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(50),
    cep VARCHAR(20),
    pais VARCHAR(100) DEFAULT 'Brasil',
    representante_nome VARCHAR(255) NOT NULL,
    representante_cpf VARCHAR(20),
    representante_email VARCHAR(255),
    representante_telefone VARCHAR(50),
    data_vigencia_inicio DATE,
    data_vigencia_fim DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj);
CREATE INDEX IF NOT EXISTS idx_empresas_status ON empresas(status);
CREATE INDEX IF NOT EXISTS idx_empresas_vigencia ON empresas(data_vigencia_fim);
CREATE INDEX IF NOT EXISTS idx_empresas_tipo ON empresas(tipo);

CREATE TRIGGER set_timestamp_empresas
BEFORE UPDATE ON empresas
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 2. TABELA: contratos_minutas (Geração e Controle dos Termos Oficiais)
-- Substitui a minuta padrão com campos manuais "X" do Google Drive
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contratos_minutas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    numero_termo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    conteudo_gerado TEXT NOT NULL,
    valor_anuidade NUMERIC(12, 2) NOT NULL DEFAULT 3600.00,
    status VARCHAR(50) NOT NULL DEFAULT 'GERADO', -- GERADO, EM_ASSINATURA, ASSINADO, CANCELADO
    gerado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contratos_empresa ON contratos_minutas(empresa_id);

CREATE TRIGGER set_timestamp_contratos
BEFORE UPDATE ON contratos_minutas
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 3. TABELA: assinaturas_contrato (Controle Rastreável dos 5 Assinantes Oficiais)
-- 1: Rep. Legal Empresa, 2/3/4: Assinantes Institucionais, 5: Reitor em exercício
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assinaturas_contrato (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    contrato_id UUID REFERENCES contratos_minutas(id) ON DELETE SET NULL,
    signatario_tipo VARCHAR(50) NOT NULL, -- REPRESENTANTE_LEGAL, INSTITUCIONAL_1, INSTITUCIONAL_2, INSTITUCIONAL_3, REITOR
    nome VARCHAR(255) NOT NULL,
    cargo VARCHAR(150),
    email VARCHAR(255),
    assinado BOOLEAN DEFAULT FALSE,
    data_assinatura TIMESTAMP WITH TIME ZONE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_empresa_signatario UNIQUE (empresa_id, signatario_tipo)
);

CREATE INDEX IF NOT EXISTS idx_assinaturas_empresa ON assinaturas_contrato(empresa_id);

CREATE TRIGGER set_timestamp_assinaturas
BEFORE UPDATE ON assinaturas_contrato
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 4. TABELA: faturas_financeiras (Módulo Contábil e Financeiro)
-- Substitui a antiga coluna laranja da planilha: NF, boleto, vencimento, PIX e baixa
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faturas_financeiras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    numero_nf VARCHAR(50),
    numero_boleto VARCHAR(100),
    chave_pix VARCHAR(255),
    pix_copia_cola TEXT,
    valor NUMERIC(12, 2) NOT NULL,
    numero_parcela INT DEFAULT 1,
    total_parcelas INT DEFAULT 1,
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    valor_pago NUMERIC(12, 2),
    forma_pagamento VARCHAR(50), -- BOLETO, PIX, TRANSFERENCIA
    status VARCHAR(50) NOT NULL DEFAULT 'PENDENTE', -- PENDENTE, PAGO, ATRASADO, CANCELADO
    comprovante_url VARCHAR(500),
    operador_baixa VARCHAR(255),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_faturas_empresa ON faturas_financeiras(empresa_id);
CREATE INDEX IF NOT EXISTS idx_faturas_status ON faturas_financeiras(status);
CREATE INDEX IF NOT EXISTS idx_faturas_vencimento ON faturas_financeiras(data_vencimento);

CREATE TRIGGER set_timestamp_faturas
BEFORE UPDATE ON faturas_financeiras
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 5. TABELA: documentos_anexos (Upload e Guarda Centralizada de Certidões do Edital)
-- Substitui envio fragmentado por e-mail e WhatsApp
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documentos_anexos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- CONTRATO_SOCIAL, CERTIDAO_FEDERAL, CERTIDAO_ESTADUAL, CERTIDAO_TRABALHISTA, COMPROVANTE_CNPJ, MINUTA_ASSINADA, OUTROS
    nome_original VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    tamanho_bytes BIGINT,
    status_conferencia VARCHAR(50) DEFAULT 'PENDENTE', -- PENDENTE, APROVADO, REJEITADO
    justificativa_rejeicao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documentos_empresa ON documentos_anexos(empresa_id);

CREATE TRIGGER set_timestamp_documentos
BEFORE UPDATE ON documentos_anexos
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 6. TABELA: espacos_fisicos (Gestão de Salas, Coworking e Laboratórios)
-- Substitui a terceira planilha de espaços físicos
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS espacos_fisicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- SALA_PRIVATIVA, COWORKING, LABORATORIO
    bloco VARCHAR(50),
    capacidade INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'DISPONIVEL', -- DISPONIVEL, OCUPADO, MANUTENCAO
    data_inicio_ocupacao DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_espacos_empresa ON espacos_fisicos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_espacos_status ON espacos_fisicos(status);

CREATE TRIGGER set_timestamp_espacos
BEFORE UPDATE ON espacos_fisicos
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 7. TABELA: comunicacoes_historico (Histórico Auditável de Disparos de E-mails)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comunicacoes_historico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
    destinatario_email VARCHAR(255) NOT NULL,
    destinatario_nome VARCHAR(255),
    assunto VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    template_tipo VARCHAR(50) DEFAULT 'GERAL', -- AVISO_EDITAL, COBRANCA_PENDENTE, LEMBRETE_VIGENCIA, GERAL
    status_envio VARCHAR(50) DEFAULT 'ENVIADO',
    enviado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comunicacoes_empresa ON comunicacoes_historico(empresa_id);

-- ------------------------------------------------------------------------------
-- 8. TABELA: auditoria_logs (Rastreabilidade das Ações Críticas no Sistema)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auditoria_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    acao VARCHAR(100) NOT NULL,
    usuario VARCHAR(100) NOT NULL DEFAULT 'SISTEMA',
    detalhes JSONB,
    ip_origem VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auditoria_empresa ON auditoria_logs(empresa_id);

-- ==============================================================================
-- CARGA INICIAL (SEEDS COM BASE NO CONTEXTO DO POLLEN PARQUE - 22 ATIVOS / EM PROCESSO)
-- ==============================================================================
INSERT INTO empresas (id, razao_social, nome_fantasia, cnpj, tipo, status, email_contato, telefone, representante_nome, data_vigencia_inicio, data_vigencia_fim)
VALUES 
('11111111-1111-1111-1111-111111111101', 'AgroTech Soluções Sustentáveis Ltda', 'AgroTech', '12.345.678/0001-01', 'STARTUP', 'ATIVO', 'contato@agrotech.com', '(49) 98801-1111', 'Marcos Vinicius', '2026-01-15', '2027-01-15'),
('11111111-1111-1111-1111-111111111102', 'BioSaúde Nanotecnologia S.A.', 'BioSaúde', '23.456.789/0001-02', 'PME', 'ATIVO', 'diretoria@biosaude.com', '(49) 98802-2222', 'Renata Alcantara', '2025-11-20', '2026-11-20'),
('11111111-1111-1111-1111-111111111103', 'CloudSecure Proteção de Dados Ltda', 'CloudSecure', '34.567.890/0001-03', 'STARTUP', 'AGUARDANDO_PAGAMENTO', 'adm@cloudsecure.com.br', '(49) 98803-3333', 'Eduardo Ramos', NULL, NULL),
('11111111-1111-1111-1111-111111111104', 'Global Analytics Holding B.V.', 'GlobalAnalytics', NULL, 'INTERNACIONAL', 'EM_ASSINATURA', 'global@analytics.eu', '+31 20 1234567', 'Jean Dupont', NULL, NULL),
('11111111-1111-1111-1111-111111111105', 'Indústria Alimentícia Chapecó S/A', 'Alimentos Oeste', '45.678.901/0001-05', 'GRANDE_PORTE', 'EM_ANALISE', 'juridico@alimentos.com.br', '(49) 3321-4444', 'Beatriz Fontana', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Assinaturas padrão para a empresa CloudSecure
INSERT INTO assinaturas_contrato (empresa_id, signatario_tipo, nome, cargo, email, assinado, data_assinatura)
VALUES
('11111111-1111-1111-1111-111111111103', 'REPRESENTANTE_LEGAL', 'Eduardo Ramos', 'CEO', 'adm@cloudsecure.com.br', true, '2026-09-10 14:00:00+00'),
('11111111-1111-1111-1111-111111111103', 'INSTITUCIONAL_1', 'Diretoria de Inovação Pollen', 'Diretor', 'diretoria@pollenparque.org.br', true, '2026-09-11 09:30:00+00'),
('11111111-1111-1111-1111-111111111103', 'INSTITUCIONAL_2', 'Coordenação Geral', 'Coordenador', 'coordenacao@pollenparque.org.br', true, '2026-09-11 11:00:00+00'),
('11111111-1111-1111-1111-111111111103', 'INSTITUCIONAL_3', 'Procuradoria Jurídica', 'Procurador-Chefe', 'juridico@pollenparque.org.br', true, '2026-09-12 15:45:00+00'),
('11111111-1111-1111-1111-111111111103', 'REITOR', 'Reitoria em Exercício', 'Reitor', 'reitoria@universidade.edu.br', true, '2026-09-13 10:20:00+00')
ON CONFLICT DO NOTHING;

-- Fatura pendente de anuidade para CloudSecure
INSERT INTO faturas_financeiras (id, empresa_id, numero_nf, numero_boleto, chave_pix, pix_copia_cola, valor, numero_parcela, total_parcelas, data_vencimento, status)
VALUES
('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111103', 'NF-2026-889', '23793.38128 60000.123456 78901.234567 1 98760000360000', 'financeiro@pollenparque.org.br', '00020126580014br.gov.bcb.pix0136financeiro@pollenparque.org.br52040000530398654053600.005802BR5913POLLEN PARQUE6007CHAPECO62070503***6304ABCD', 3600.00, 1, 1, CURRENT_DATE + INTERVAL '10 days', 'PENDENTE')
ON CONFLICT DO NOTHING;

-- Espaços físicos de exemplo
INSERT INTO espacos_fisicos (id, nome, tipo, bloco, capacidade, status, empresa_id, data_inicio_ocupacao)
VALUES
('33333333-3333-3333-3333-333333333301', 'Sala Privativa 101', 'SALA_PRIVATIVA', 'Bloco Inovação', 8, 'OCUPADO', '11111111-1111-1111-1111-111111111101', '2026-01-15'),
('33333333-3333-3333-3333-333333333302', 'Sala Privativa 102', 'SALA_PRIVATIVA', 'Bloco Inovação', 6, 'DISPONIVEL', NULL, NULL),
('33333333-3333-3333-3333-333333333303', 'Estação Coworking CW-04', 'COWORKING', 'Bloco Central', 1, 'OCUPADO', '11111111-1111-1111-1111-111111111102', '2025-11-20'),
('33333333-3333-3333-3333-333333333304', 'Laboratório de IoT e Prototipagem', 'LABORATORIO', 'Bloco Tecnológico', 15, 'DISPONIVEL', NULL, NULL)
ON CONFLICT DO NOTHING;

