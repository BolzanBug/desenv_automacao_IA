# ADR 002: Fluxo Web de Autoatendimento Não-Residente e Geração Resiliente de Minutas em PDF

**Status:** APROVADO  
**Data:** 18 de Setembro de 2026  
**Autor:** Arquiteto de Software Sênior  
**Contexto:** Sistema Integrado de Gestão de Afiliados — Pollen Parque Científico e Tecnológico (Integração V2)  

---

## 1. Contexto do Negócio e Problema

Na evolução da esteira de afiliação do Pollen Parque (versão V2), dois gargalos críticos foram abordados:
1. **Dependência de Formulário Estático em PDF (`dasd.pdf`):** Empresas não-residentes (externas) eram obrigadas a preencher manualmente um formulário impresso/PDF de 16 campos, encaminhando por e-mail ou WhatsApp, gerando retrabalho de digitação manual pela equipe do parque.
2. **Minutas Contratuais Frágeis:** A geração de contratos para empresas não-residentes exigia aderência estrita ao modelo institucional da Unochapecó/Fundeste (`Modelo minuta Programa de Afiliados (1).docx`), cuja conversão para PDF apresentava vulnerabilidades de caminhos relativos e dependência estrita de binários de sistema (`libreoffice-convert`). Além disso, as minutas geradas não eram catalogadas na tabela de documentos (`documentos_anexos`).
3. **Divergência de Rotas entre Frontend e Backend:** Falta de rotas espelhadas em inglês (`/companies/nao-residente`) e português (`/empresas/:id/contract/generate`) causava erros 404 pontuais na integração entre camadas.

---

## 2. Decisões Arquiteturais

### 2.1. Modelagem do Autoatendimento Não-Residente (16 Campos)
- **Decisão:** A entidade `empresas` armazena todos os 16 campos requeridos pelo edital com suporte a empresas residentes e não-residentes. O endpoint de autoatendimento grava a empresa com `residente: false` e `tipo: 'EXTERNA'`.
- **Campos Cobertos:**
  - Empresa: `razao_social`, `nome_fantasia`, `cnpj`, `ano_fundacao`, `area_atuacao`, `email_contato`, `email_cobranca`, `telefone`, `site`, `endereco_completo`, `cidade`, `estado`, `cep`.
  - Representante Legal: `representante_nome`, `representante_cpf`, `representante_cargo`, `representante_endereco`, `representante_email`, `representante_telefone`.
- **Racional:** Elimina 100% da necessidade do formulário impresso/PDF manual `dasd.pdf` e automatiza a geração do pipeline inicial (`EM_ANALISE`) e do checklist dos 5 signatários.

### 2.2. Motor Híbrido de Minutas Contratuais (DOCX -> PDF vs Markdown)
- **Decisão:** Manter geração em Markdown para empresas residentes e utilizar preenchimento de modelo oficial DOCX convertido para PDF para empresas não-residentes.
- **Resiliência e Fallback Seguro:**
  - O caminho do template é resolvido de forma absoluta a partir de `__dirname` e isolado na pasta interna `src/templates/modelo_minuta_afiliados.docx`.
  - O preenchimento textual abrange todas as variáveis contratuais (Razão Social, CNPJ, Sede, Representante, CPF, Valor por extenso e datas).
  - Em caso de falha ou ausência do LibreOffice no servidor/contêiner, o motor captura a exceção graciosamente, salva o `.docx` preenchido em `/uploads/contratos/` e disponibiliza o arquivo sem quebrar a requisição HTTP com código 500.

### 2.3. Rastreabilidade e Registro Automático em `documentos_anexos`
- **Decisão:** Sempre que uma minuta em PDF/DOCX for gerada com sucesso para a empresa, um registro correspondente é persistido automaticamente na tabela `documentos_anexos` com `tipo: 'MINUTA_ASSINADA'` e `status_conferencia: 'APROVADO'`.
- **Racional:** Garante que a minuta fique imediatamente disponível na aba de documentos anexos do painel administrativo e no Portal da Afiliada (`/portal-empresa`), unificando a gestão de artefatos.

### 2.4. Aliases Bilíngues e Flexibilidade de Payload
- **Decisão:** Registrar rotas espelhadas em inglês e português:
  - `POST /api/v1/companies/nao-residente` e `POST /api/v1/empresas/nao-residente` e `POST /api/v1/public/nao-residente`.
  - `POST /api/v1/companies/:id/contract/generate` e `POST /api/v1/empresas/:id/contract/generate`.
  - Normalização no controller para aceitar payloads em `camelCase` e `snake_case`.
- **Racional:** Protege o sistema contra quebras de contrato de API e desacopla as decisões de nomeação de endpoints do cliente frontend.

---

## 3. Matriz de Consequências

| Decisão | Benefícios | Mitigação de Riscos |
| :--- | :--- | :--- |
| **Autoatendimento Web** | Entrada direta de dados sem intermediários manuais | Validação estrita de CNPJ único e campos obrigatórios |
| **Conversão DOCX->PDF** | Conformidade jurídica com o modelo padrão Unochapecó | Tratamento de erro com fallback de arquivo DOCX |
| **Registro em `documentos_anexos`** | Visibilidade 360° imediata no portal e na API de documentos | Criação assíncrona após geração do arquivo |
| **Aliases de Rotas** | Interoperabilidade total com diferentes versões do frontend | Mapeamento no arquivo central de rotas |

