# Documentação Técnica: Tabela `empresas`

## 1. Finalidade
A tabela `empresas` é a entidade central do Sistema Integrado do Pollen Parque. Ela unifica o antigo formulário padrão do Google Drive, as anotações avulsas e a primeira planilha de cadastro em uma única fonte da verdade relacional.

## 2. Estrutura de Colunas

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador exclusivo imutável |
| `razao_social` | VARCHAR(255) | NOT NULL | Razão social registrada nos órgãos oficiais |
| `nome_fantasia` | VARCHAR(255) | NULL | Nome comercial / de marca |
| `cnpj` | VARCHAR(20) | UNIQUE, NULL | CNPJ formatado ou limpo (apenas empresas nacionais) |
| `identificador_internacional` | VARCHAR(100) | NULL | Tax ID, EIN, VAT ou registro estrangeiro |
| `tipo` | VARCHAR(50) | NOT NULL, DEFAULT 'STARTUP' | STARTUP, PME, GRANDE_PORTE, INTERNACIONAL |
| `status_alteracao_contratual` | BOOLEAN | DEFAULT FALSE | Flag para empresas de grande porte em alteração societária |
| `status` | VARCHAR(50) | NOT NULL, DEFAULT 'EM_ANALISE' | Estado no ciclo de vida (EM_ANALISE, MINUTA_GERADA, etc.) |
| `email_contato` | VARCHAR(255) | NOT NULL | E-mail corporativo principal para notificações |
| `telefone` | VARCHAR(50) | NULL | Telefone com DDD ou DDI (geralmente coletado no WhatsApp inicial) |
| `endereco_completo` | TEXT | NULL | Logradouro, número, complemento e bairro |
| `cidade` | VARCHAR(100) | NULL | Município sede |
| `estado` | VARCHAR(50) | NULL | UF ou província |
| `cep` | VARCHAR(20) | NULL | Código postal |
| `pais` | VARCHAR(100) | DEFAULT 'Brasil' | País sede da empresa |
| `representante_nome` | VARCHAR(255) | NOT NULL | Nome do signatário legal |
| `representante_cpf` | VARCHAR(20) | NULL | CPF do representante legal |
| `representante_email` | VARCHAR(255) | NULL | E-mail para envio do termo de assinatura |
| `representante_telefone` | VARCHAR(50) | NULL | Contato direto do representante |
| `data_vigencia_inicio` | DATE | NULL | Início oficial do convênio de afiliação |
| `data_vigencia_fim` | DATE | NULL | Término do convênio de 12 meses (anuidade) |
| `observacoes` | TEXT | NULL | Notas internas da equipe do programa |
| `created_at` | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Data de cadastro no sistema |
| `updated_at` | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Data da última modificação |

## 3. Regras de Negócio e Ciclo de Vida
1. **Unicidade de CNPJ:** Empresas nacionais não podem ter duplicidade de CNPJ cadastrado.
2. **Empresas Internacionais:** Não exigem CNPJ, mas tornam obrigatório o `identificador_internacional` e o preenchimento do país.
3. **Fluxo de Estados (`status`):**
   `EM_ANALISE` ➡️ `MINUTA_GERADA` ➡️ `EM_ASSINATURA` ➡️ `AGUARDANDO_PAGAMENTO` ➡️ `ATIVO` ➡️ `VENCIDO` (se não renovado) ou `SUSPENSO`/`DESLIGADO`.
4. **Cálculo de Vigência:** Ao confirmar a assinatura e o pagamento, `data_vigencia_inicio` é preenchida com a data atual e `data_vigencia_fim` é calculada com +365 dias.

