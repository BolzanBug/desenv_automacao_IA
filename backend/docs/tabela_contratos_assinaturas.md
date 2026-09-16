# Documentação Técnica: Tabelas `contratos_minutas` e `assinaturas_contrato`

## 1. Finalidade
Essas tabelas gerenciam o ciclo contratual do Pollen Parque. Elas eliminam definitivamente as minutas em PDF/Word salvas no Google Drive que eram preenchidas manualmente colocando dados onde havia 'X'. Também substituem o acompanhamento de assinaturas da Procuradoria Jurídica por um checklist digital de 5 signatários.

---

## 2. Tabela `contratos_minutas`

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único da minuta |
| `empresa_id` | UUID | FK -> empresas(id) ON DELETE CASCADE | Vínculo com a empresa afiliada |
| `numero_termo` | VARCHAR(50) | NOT NULL | Numeração formal (ex: "TERMO-2026/042") |
| `titulo` | VARCHAR(255) | NOT NULL | Título oficial do documento |
| `conteudo_gerado` | TEXT | NOT NULL | Texto integral do contrato com variáveis mescladas |
| `valor_anuidade` | NUMERIC(12,2) | NOT NULL DEFAULT 3600.00 | Valor financeiro anual fixado no edital |
| `status` | VARCHAR(50) | NOT NULL DEFAULT 'GERADO' | GERADO, EM_ASSINATURA, ASSINADO, CANCELADO |
| `gerado_em` | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Timestamp da geração do documento |
| `updated_at` | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Timestamp de atualização |

---

## 3. Tabela `assinaturas_contrato`

Controla a esteira dos 5 assinantes institucionais e do representante legal:

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador da assinatura |
| `empresa_id` | UUID | FK -> empresas(id) ON DELETE CASCADE | Empresa correspondente |
| `contrato_id` | UUID | FK -> contratos_minutas(id) ON DELETE SET NULL | Minuta vinculada |
| `signatario_tipo` | VARCHAR(50) | NOT NULL | REPRESENTANTE_LEGAL, INSTITUCIONAL_1, INSTITUCIONAL_2, INSTITUCIONAL_3, REITOR |
| `nome` | VARCHAR(255) | NOT NULL | Nome do signatário |
| `cargo` | VARCHAR(150) | NULL | Cargo funcional |
| `email` | VARCHAR(255) | NULL | E-mail do signatário |
| `assinado` | BOOLEAN | DEFAULT FALSE | Flag de confirmação de assinatura |
| `data_assinatura` | TIMESTAMPTZ | NULL | Timestamp exato em que a assinatura foi confirmada |
| `observacoes` | TEXT | NULL | Notas adicionais ou protocolo do sistema de chamados |

### Regra de Ouro:
A chave composta `(empresa_id, signatario_tipo)` possui restrição de unicidade (`CONSTRAINT unq_empresa_signatario UNIQUE`). Quando todas as 5 assinaturas estiverem `assinado = TRUE`, a API atualiza o status da empresa para `AGUARDANDO_PAGAMENTO` e dispara notificação automática para o setor financeiro emitir NF e boleto.

