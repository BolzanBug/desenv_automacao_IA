# Memória Técnica e Changelog do Ciclo SDLC — Pollen Parque Gestão de Afiliados

**Data de Conclusão do Ciclo:** 18 de Setembro de 2026  
**Responsável:** Tech Lead & Documentador Corporativo  
**Ciclo:** Integração V2 — Autoatendimento Não-Residente e Geração Resiliente de Minutas em PDF  
**Status do Ciclo:** CONCLUÍDO COM SUCESSO (100% de Testes Aprovados)  

---

## 1. Visão Geral do Ciclo

Este ciclo de desenvolvimento teve como propósito eliminar dois dos principais pontos manuais e vulneráveis da operação do Pollen Parque:
1. **Fim do Formulário PDF Manual (`dasd.pdf`):** Substituição integral por fluxo web estruturado de autoatendimento contendo os 16 campos cadastrais oficiais com validação imediata e gravação de metadados (`residente: false`, `tipo: 'EXTERNA'`).
2. **Robustez na Geração de Minutas Contratuais:** Implementação de motor de preenchimento completo de variáveis do modelo DOCX institucional (`Modelo minuta Programa de Afiliados (1).docx`), conversão nativa para PDF com proteção contra falsos erros do LibreOffice, fallback seguro para `.docx` em contêineres mínimos e registro automático na tabela de documentos anexos (`documentos_anexos`).
3. **Consistência de Rotas e Contratos de API:** Registro de aliases bilíngues e espelhados em inglês e português, evitando erros 404 entre o cliente frontend e a API.

---

## 2. Artefatos e Componentes Entregues

### 2.1. Engenharia de Requisitos (Analista de Requisitos)
- **Arquivo:** `backend/docs/api.json`
- **Entregas:**
  - Inclusão das Histórias de Usuário `US11` (Autoatendimento de Não-Residentes), `US12` (Geração Híbrida de Minutas PDF/MD) e `US13` (Visualizador Híbrido e Download).
  - Contratos de API atualizados com especificação de payloads (camelCase/snake_case), parâmetros de query, status codes (200, 201, 400, 404, 500) e aliases registrados.

### 2.2. Arquitetura e Modelagem de Dados (Arquiteto de Software)
- **Arquivos:** `backend/schema.sql`, `backend/docs/ADR-002-migracao-contratos-pdf-e-autoatendimento-v2.md`, `backend/docs/tabela_empresas.md`, `backend/docs/tabela_espacos_documentos.md`
- **Entregas:**
  - Validação e documentação de conformidade 3FN no PostgreSQL 16 com suporte aos 16 campos de empresas não-residentes.
  - Registro de ADR 002 documentando o racional técnico para conversão DOCX->PDF com fallback, armazenamento de contratos em `documentos_anexos` e aliases de rotas.

### 2.3. Implementação de Software (Desenvolvedor Backend)
- **Arquivos:**
  - `backend/src/routes/empresaRoute.js`: Rotas `POST /companies/nao-residente`, `POST /empresas/nao-residente`, `POST /companies/:id/contract/generate`, `POST /empresas/:id/contract/generate`.
  - `backend/src/routes/publicRoute.js`: Rota pública `POST /public/nao-residente`.
  - `backend/src/controllers/empresaController.js`: Tratamento polimórfico de payload em `registerNonResident` e persistência automática de minutas em `DocumentoAnexo.create(...)` dentro de `generateContract`.
  - `backend/src/utils/docxContractGenerator.js`: Preenchimento de 100% dos placeholders institucionais (Razão Social, CNPJ, Sede, Representante, CPF, Valor por extenso, emails e datas), isolamento do template em `src/templates/modelo_minuta_afiliados.docx` com resolução absoluta `__dirname`, execução direta do `soffice` e fallback para DOCX.
  - `backend/docs/rotas_api.md`: Documentação atualizada de todos os novos endpoints.

### 2.4. Qualidade e Verificação (Engenheiro de QA)
- **Arquivo:** `backend/tests/nonResidentAndDocx.test.js` e bateria global de testes
- **Resultado:** **32/32 testes aprovados (100% pass)** cobrindo contratos de API, integridade de schema, regras de negócio das 5 assinaturas, validação de models Sequelize, substituição de variáveis e geração física de minutas.

---

## 3. Falhas e Riscos Prevenidos

| Risco / Falha Identificada | Camada | Ação de Mitigação Implementada |
| :--- | :--- | :--- |
| **Erro 404 em rotas de API** | Rotas / Controllers | Mapeamento explícito de aliases (`/companies/nao-residente` e `/empresas/nao-residente`, `/companies/:id/contract/generate` e `/empresas/:id/contract/generate`). |
| **Falha de ENOENT por caminho relativo** | Gerador DOCX | Utilização de `path.resolve(__dirname, ...)` e centralização de modelo em `src/templates/` com rotas de fallback. |
| **Falso erro 500 por warning do LibreOffice** | Conversor PDF | Execução nativa de `soffice` desacoplada do parsing de stderr de bibliotecas terceiras, verificando a criação física do arquivo de saída. |
| **Servidor sem LibreOffice instalado** | Infraestrutura | Fallback automático e transparente para arquivo `.docx` preenchido, sem causar quebra na requisição HTTP. |
| **Incompletude do contrato jurídico** | Jurídico / Negócio | Substituição de todos os placeholders (Razão Social, CNPJ, Sede, Representante, CPF, telefone, emails e anuidade por extenso), sem marcações residuais com 'X'. |
| **Documentos perdidos para auditoria** | Banco de Dados | Registro imediato do arquivo gerado na tabela `documentos_anexos` sob o tipo `MINUTA_ASSINADA` com status `APROVADO`. |
| **Incompatibilidade de casing nos payloads** | Integração Frontend | Suporte flexível tanto a `camelCase` quanto a `snake_case` nos controllers. |

---

## 4. Recomendações e Próximos Passos

1. **Frontend Integration:** Executar as diretrizes de integração fornecidas para o agente do Frontend em `/frontend/INSTRUCOES_ROTAS_FRONTEND.md`.
2. **Ambiente de Produção:** Assegurar que os contêineres Docker de produção mantenham a dependência `libreoffice` configurada no `Dockerfile` para máxima fidelidade na conversão de PDF.

