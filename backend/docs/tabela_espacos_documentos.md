# Documentação Técnica: Tabelas `espacos_fisicos` e `documentos_anexos`

## 1. Finalidade
Este documento detalha o funcionamento de duas entidades cruciais para a operação do Pollen Parque:
1. `espacos_fisicos`: Substitui a terceira planilha do Google Drive, centralizando a ocupação de salas privativas, estações de coworking e laboratórios.
2. `documentos_anexos`: Elimina a recepção desorganizada de certidões e contratos por WhatsApp e pela caixa de e-mail `NITO1`, fornecendo repositório estruturado para auditoria da Procuradoria.

---

## 2. Tabela `espacos_fisicos`

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador exclusivo do espaço |
| `empresa_id` | UUID | FK -> empresas(id) ON DELETE SET NULL | Empresa atualmente alocada (se houver) |
| `nome` | VARCHAR(100) | NOT NULL | Nome de referência (ex: "Sala 204", "Posto CW-12") |
| `tipo` | VARCHAR(50) | NOT NULL | SALA_PRIVATIVA, COWORKING, LABORATORIO |
| `bloco` | VARCHAR(50) | NULL | Bloco ou pavilhão do parque |
| `capacidade` | INT | DEFAULT 1 | Quantidade de postos de trabalho |
| `status` | VARCHAR(50) | DEFAULT 'DISPONIVEL' | DISPONIVEL, OCUPADO, MANUTENCAO |
| `data_inicio_ocupacao` | DATE | NULL | Início do uso pela empresa |
| `observacoes` | TEXT | NULL | Especificações técnicas do espaço |

### Regras de Negócio:
- Ao vincular uma empresa ao espaço, o status passa para `OCUPADO`.
- Quando a empresa se desliga ou seu status passa para `DESLIGADO`, os espaços vinculados devem ser liberados (`DISPONIVEL`).

---

## 3. Tabela `documentos_anexos`

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador do documento |
| `empresa_id` | UUID | FK -> empresas(id) ON DELETE CASCADE | Empresa proprietária do arquivo |
| `tipo` | VARCHAR(50) | NOT NULL | CONTRATO_SOCIAL, CERTIDAO_FEDERAL, CERTIDAO_ESTADUAL, CERTIDAO_TRABALHISTA, COMPROVANTE_CNPJ, MINUTA_ASSINADA, OUTROS |
| `nome_original` | VARCHAR(255) | NOT NULL | Nome do arquivo original submetido |
| `caminho_arquivo` | VARCHAR(500) | NOT NULL | Caminho seguro no sistema de arquivos ou storage |
| `mime_type` | VARCHAR(100) | NULL | Tipo MIME (ex: application/pdf) |
| `tamanho_bytes` | BIGINT | NULL | Tamanho do arquivo em bytes |
| `status_conferencia` | VARCHAR(50) | DEFAULT 'PENDENTE' | PENDENTE, APROVADO, REJEITADO |
| `justificativa_rejeicao` | TEXT | NULL | Motivo em caso de inconformidade |

### Regras de Negócio:
- Toda empresa em fase de ingresso deve possuir os documentos do edital aprovados antes do envio para assinatura final do Reitor.

