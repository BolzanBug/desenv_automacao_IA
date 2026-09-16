# ADR 001: Arquitetura de Dados, Escalabilidade e Integração do Pollen Parque

**Status:** APROVADO  
**Data:** 16 de Setembro de 2026  
**Autor:** Arquiteto de Software Sênior  
**Contexto:** Sistema Integrado de Gestão de Afiliados — Pollen Parque Científico e Tecnológico

---

## 1. Contexto do Negócio e Problema

O programa de afiliados do Pollen Parque opera atualmente com processos manuais fragmentados baseados em:
- Três planilhas do Google Drive desconexas (Cadastro geral, Controle Financeiro/Contábil por cores e Espaços Físicos).
- Minutas contratuais padrão em Word/PDF com campos marcados com "X" para edição manual.
- Comunicação informal via WhatsApp e caixa de e-mail institucional paralela (`NITO1`).
- Fluxo de assinaturas com a Procuradoria Jurídica envolvendo 5 signatários distintos sem visibilidade de gargalos.
- Acompanhamento de pagamento manual, onde o setor contábil precisava dar baixa avisando a equipe sem auditoria.

Com 22 empresas ativas e de 23 a 30 em processo, e projeção de atingir 50 a 60 afiliados em curto prazo, a operação manual tornou-se insustentável.

---

## 2. Decisões Arquiteturais Tomadas

### 2.1. Escolha do Banco de Dados: PostgreSQL 16
- **Decisão:** Utilizar PostgreSQL como banco relacional principal.
- **Racional:** O domínio de negócios exige estrita integridade referencial ACID para faturamento, contratos legais, auditoria e controle de ocupação de espaços. O PostgreSQL oferece suporte maduro a UUID v4 nativo, tipos JSONB para logs flexíveis de auditoria e triggers procedurais em PL/pgSQL para atualização automática de timestamps.

### 2.2. Utilização de Chaves Primárias UUIDv4 (`uuid-ossp`)
- **Decisão:** Todas as tabelas utilizam `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`.
- **Racional:** 
  1. Evita exposição sequencial de IDs em rotas de API públicas (ex: formulário de autoatendimento, links de assinatura).
  2. Facilita futuras migrações, replicação e geração distribuída de entidades.
  3. Aumenta a segurança contra ataques de enumeração direta (IDOR).

### 2.3. Modelagem em 3ª Forma Normal (3FN) e Desacoplamento
- **Decisão:** Separar rigorosamente as entidades:
  - `empresas`: Cadastro mestre, tipagem (STARTUP, PME, GRANDE_PORTE, INTERNACIONAL) e status de vigência.
  - `contratos_minutas`: Histórico das versões do termo gerado sem campos manuais com "X".
  - `assinaturas_contrato`: Controle nominal dos 5 signatários com constraint única `(empresa_id, signatario_tipo)`.
  - `faturas_financeiras`: Controle de NFs, boletos, chaves PIX e baixa contábil manual com rastreamento do operador.
  - `documentos_anexos`: Armazenamento de certidões e comprovantes exigidos pelo edital.
  - `espacos_fisicos`: Controle de salas privativas, postos de coworking e laboratórios.
  - `comunicacoes_historico`: Disparos de e-mail auditáveis.
  - `auditoria_logs`: Histórico imutável de transações.

### 2.4. Resolução da Complexidade Financeira (PIX e Parcelamento)
- **Decisão:** A tabela `faturas_financeiras` desacopla a anuidade em parcelas individuais (`numero_parcela` e `total_parcelas`), suportando boleto bancário (linha digitável), chave PIX estática e payload PIX Copia-e-Cola (`pix_copia_cola`).
- **Racional:** Garante flexibilidade de pagamento para as empresas afiliadas sem desordenar a conciliação financeira do setor contábil.

### 2.5. Suporte a Empresas Internacionais e Alteração Contratual
- **Decisão:** O campo `cnpj` permite valores nulos para empresas com tipo `INTERNACIONAL`, as quais são indexadas e identificadas pelo campo `identificador_internacional`. O flag booleano `status_alteracao_contratual` sinaliza pendências estatutárias sem bloquear o fluxo cadastral preliminar.

---

## 3. Consequências e Trade-offs

| Aspecto | Benefício Obtido | Trade-off / Mitigação |
| :--- | :--- | :--- |
| **UUIDv4** | Segurança, unicidade global | Ocupa 16 bytes vs 4 bytes do INT; mitigado pela criação de índices B-Tree dedicados. |
| **Triggers PL/pgSQL** | Garantia de `updated_at` a nível de engine | Requer permissão para execução de PL/pgSQL, mitigado por scripts declarativos padronizados. |
| **Normalização 3FN** | Eliminação de redundâncias e anomalias de atualização | Requer junções (JOINs) na API 360°; mitigado por índices nas chaves estrangeiras (`empresa_id`). |

---

## 4. Próximos Passos de Arquitetura
1. Implementação dos modelos Sequelize no Backend mapeando estritamente essas tabelas.
2. Criação de rotas RESTful conforme o contrato de API definido em `backend/docs/api.json`.
3. Integração com webhooks bancários para conciliação automática futura de PIX/Boletos.

