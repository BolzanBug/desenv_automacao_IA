# Documentação Técnica: Tabela `faturas_financeiras`

## 1. Finalidade
Esta tabela substitui a "parte laranja" da antiga planilha de controle do Google Drive, operada pelo setor contábil. Ela gerencia o faturamento das anuidades das empresas afiliadas, a emissão de boletos, o suporte a chaves PIX dinâmicas e estáticas, as opções de parcelamento e a baixa manual com auditoria formal.

---

## 2. Estrutura de Colunas

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador exclusivo da fatura |
| `empresa_id` | UUID | FK -> empresas(id) ON DELETE CASCADE | Empresa devedora |
| `numero_nf` | VARCHAR(50) | NULL | Número da Nota Fiscal de Serviço emitida |
| `numero_boleto` | VARCHAR(100) | NULL | Código de barras ou linha digitável bancária |
| `chave_pix` | VARCHAR(255) | NULL | Chave PIX da instituição mantenedora do Pollen |
| `pix_copia_cola` | TEXT | NULL | Payload EMV do PIX Copia-e-Cola |
| `valor` | NUMERIC(12,2) | NOT NULL | Valor monetário em Reais (BRL) |
| `numero_parcela` | INT | DEFAULT 1 | Número da parcela (ex: 1 para parcela 1 de 3) |
| `total_parcelas` | INT | DEFAULT 1 | Total de parcelas contratadas (ex: 3) |
| `data_emissao` | DATE | NOT NULL, DEFAULT CURRENT_DATE | Data de lançamento contábil |
| `data_vencimento` | DATE | NOT NULL | Data limite para pagamento sem juros |
| `data_pagamento` | DATE | NULL | Data efetiva do recebimento financeiro |
| `valor_pago` | NUMERIC(12,2) | NULL | Valor efetivamente creditado |
| `forma_pagamento` | VARCHAR(50) | NULL | BOLETO, PIX, TRANSFERENCIA |
| `status` | VARCHAR(50) | NOT NULL, DEFAULT 'PENDENTE' | PENDENTE, PAGO, ATRASADO, CANCELADO |
| `comprovante_url` | VARCHAR(500) | NULL | Link ou caminho do comprovante bancário |
| `operador_baixa` | VARCHAR(255) | NULL | Nome ou identificação de quem deu a baixa contábil |
| `observacoes` | TEXT | NULL | Justificativas, prorrogações ou acordos |
| `created_at` | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Criação do registro |
| `updated_at` | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Atualização do registro |

---

## 3. Regras de Negócio e Impacto no Ciclo de Vida
1. **Baixa Contábil:** A baixa pode ser executada por operador contábil informando `data_pagamento`, `valor_pago`, `forma_pagamento` e `operador_baixa`.
2. **Ativação da Empresa:** Se a empresa estiver em `AGUARDANDO_PAGAMENTO` e a primeira fatura for quitada (`PAGO`), o status da empresa é automaticamente atualizado para `ATIVO`, e o período de vigência de 12 meses é registrado.
3. **Inadimplência:** Faturas cujo `data_vencimento < CURRENT_DATE` e `status = 'PENDENTE'` são marcadas como `ATRASADO`, alimentando os alertas do Dashboard.

