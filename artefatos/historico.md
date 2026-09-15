# Histórico, Memória Técnica e Changelog Consolidado
## Sistema Unificado de Gestão de Afiliados — Pollen Parque Científico e Tecnológico
**Versão:** 2.0.0 (Release de Homologação SDLC Completa)  
**Autor:** Tech Lead & Documentador  
**Data:** Setembro de 2026  
**Origem do Levantamento:** Transcrição de Áudio da Reunião de 11/09/2026 (Semana de Desenvolvimento com IA — CRS + LTS)

---

## 1. Resumo Executivo & Diagnóstico do Projeto

O **Pollen Parque Científico e Tecnológico** enfrentava um gargalo operacional crítico decorrente do crescimento acelerado do seu programa de afiliação. A operação era sustentada de forma descentralizada por:
- **Três planilhas independentes no Google Drive:** (1) Cadastro geral de empresas e rascunhos; (2) Controle financeiro/contábil com responsabilidade dividida por cores (área laranja preenchida pela contabilidade para lançamento de NF, boleto e aviso manual de baixa); e (3) Gestão de ocupação de espaços físicos (salas privativas, bancadas de coworking e módulos laboratoriais).
- **Processos contratuais manuais:** Minutas em formato Word/PDF com campos marcados com "X" preenchidos manualmente para cada empresa antes de enviar à Procuradoria Jurídica.
- **Comunicação fragmentada:** Contatos dispersos via WhatsApp e recebimento de certidões e comprovantes do edital pela caixa de e-mail `NITO1`.
- **Escalonamento iminente:** O programa contava com 22 afiliados fechados e 23 a 30 em processo, com meta de 50 empresas até o final do ano e 60 no ano seguinte. O controle por planilhas tornava o risco de perda de prazos de anuidade e inconsistência contábil insustentável.

Com a execução da **Esteira SDLC Autônoma**, entregou-se uma plataforma web integrada de nível corporativo, substituindo 100% das planilhas por um banco relacional estruturado, rotas de API RESTful em Node.js e dashboards responsivos em Next.js.

---

## 2. Matriz de Rastreabilidade (Problema Levantado &rarr; Solução Entregue)

| Desafio Identificado na Transcrição | Solução Arquitetural / Backend | Interface / Componente Entregue |
| :--- | :--- | :--- |
| **Porta de Entrada Descentralizada** (Contato por WhatsApp e formulário solto) | Endpoint `POST /api/v1/companies` gravando direto no PostgreSQL em status `INSCRITA`. | Tela de autoatendimento público (`/inscricao`) e formulário corporativo (`/empresas/nova`). |
| **Montagem Manual de Minutas (Campos "X")** | Utilitário `contractGenerator.js` e endpoint `POST /companies/:id/contract/generate`. | Botão "Gerar Minuta Automática" na ficha da empresa e modal de pré-visualização de texto oficial. |
| **Trâmite Jurídico & 5 Assinantes Institucionais** | Tabela `processos_juridicos` e rota `PUT /companies/:id/legal-status` com checklist booleano. | Checklist interativo com as 5 chancelas (Rep. Legal + 3 Institucionais + Reitor em exercício). |
| **Controle Financeiro / Linha Laranja da Planilha** | Módulo de cobranças com endpoint `POST /financial/invoices` e `PUT /financial/invoices/:id/pay`. | Painel contábil `/financeiro` com faturas, vencimentos, boletos, chave PIX e botão de baixa instantânea. |
| **Alerta de Término de Vigência da Anuidade** | Cálculo dinâmico de `diasRestantesVigencia` e métrica executiva no backend. | Alerta visual no Dashboard para contratos a vencer em 30/60 dias e filtro rápido na listagem. |
| **Comunicação por WhatsApp / Caixa NITO1** | Tabela de auditoria `historico_emails` e endpoint em lote `POST /communications/email`. | Central de E-mails `/comunicacao` com templates (Boas-vindas, Cobrança, Renovação) e disparos em massa. |
| **Terceira Planilha: Gestão de Espaços Físicos** | Tabela `espacos_fisicos` e controller `espacoController.js` para alocação/desocupação. | Módulo `/espacos` com grid de ocupação de salas privativas, coworking e laboratórios. |

---

## 3. APIs e Endpoints RESTful Implementados (Backend Node.js/Express)

A API foi construída em padrão MVC estrito (ES Modules, Sequelize ORM), disponível em `/api/v1`:

### A. Módulo de Empresas & Jornada do Afiliado (`/api/v1/companies`)
- `POST /`: Cadastro de novos afiliados (nacional, grande porte ou internacional) com validação rígida de campos e criação automática do trâmite jurídico.
- `GET /`: Listagem completa com suporte a busca textual (`search`), filtro de status (`status`), modalidade (`tipo`) e contratos a vencer (`expiringSoon`).
- `GET /:id`: Ficha 360° com todos os relacionamentos em um único payload (dados cadastrais, jurídico, documentos, finanças, comunicações e espaços).
- `PUT /:id`: Atualização de dados cadastrais e avanço de status.
- `DELETE /:id`: Remoção de cadastro com integridade referencial em cascata.
- `PUT /:id/legal-status`: Atualização do número de chamado da Procuradoria Jurídica e do checklist das 5 assinaturas institucionais.

### B. Módulo de Documentos e Minutas (`/api/v1/companies/:id/documents` e `/documents`)
- `POST /:id/contract/generate`: Compilação e emissão automática do termo de afiliação mesclando os dados reais da organização.
- `POST /:id/documents`: Upload multipart (Multer) de certidões e atos constitutivos com classificação por tipo (CND Federal, Estadual, Contrato Social, etc.).
- `GET /:id/documents`: Listagem do acervo de documentos anexados à empresa.
- `GET /documents/download/:id`: Download seguro do arquivo físico a partir do storage.

### C. Módulo Contábil e Financeiro (`/api/v1/financial`)
- `POST /invoices`: Lançamento de Nota Fiscal, boleto bancário, linha digitável, chave PIX e parcelamento.
- `GET /invoices`: Consulta consolidada com totalizadores de faturamento pago, faturamento pendente e inadimplência.
- `PUT /invoices/:id/pay`: Registro de baixa contábil e confirmação de pagamento com alteração automática do status da empresa.

### D. Módulo de Comunicações Institucionais (`/api/v1/communications`)
- `POST /email`: Disparo de e-mails individuais ou em massa para múltiplos afiliados simultâneos com gravação de trilha de auditoria.
- `GET /history`: Consulta ao histórico auditável de comunicados expedidos.

### E. Módulo de Espaços Físicos (`/api/v1/spaces`)
- `GET /`: Consulta ao mapa de ocupação e inventário do parque.
- `POST /`: Cadastro de novas salas, estações e módulos.
- `POST /allocate`: Vinculação de empresa afiliada a um espaço ou liberação para o inventário.

### F. Módulo do Dashboard Executivo (`/api/v1/dashboard`)
- `GET /metrics`: Consolidação de métricas em tempo real (total de empresas, ativas, em processo, a vencer em 30 dias, taxa de ocupação e balanço financeiro).

---

## 4. Telas e Componentes Implementados (Frontend Next.js 15 / React 19)

Desenvolvido com Tailwind CSS, App Router e arquitetura de componentes reutilizáveis:
- **`src/app/page.jsx` (Dashboard Executivo):** Visão geral da governança do Pollen com 6 cartões de KPIs (Total de Afiliados, Em Processo, Taxa de Ocupação de Espaços, Receita Liquidada, Pendências e Inadimplências), banner de ações rápidas, alerta automático de contratos a expirar e tabela de afiliados recentes.
- **`src/app/empresas/page.jsx` (Gestão de Empresas):** Tabela corporativa com busca instantânea, dropdowns de filtro por status e modalidade, modais para alteração rápida de status e confirmação de exclusão com alerta de cascata.
- **`src/app/empresas/nova/page.jsx` (Cadastro Corporativo):** Formulário completo com validação de inputs em tempo real, seleção de modalidade (Padrão, Grande Porte, Internacional), mensagens de erro contextuais e máscara de identificação fiscal.
- **`src/app/empresas/[id]/page.jsx` (Ficha 360° da Empresa):** Navegação por abas dinâmicas contemplando:
  1. *Minuta & 5 Assinaturas:* Botão de geração automática de minuta, visualizador do contrato gerado e checklist visual dos 5 signatários obrigatórios.
  2. *Documentos do Edital:* Formulário de upload com seleção de certidões e tabela de arquivos custodiados com link de download.
  3. *Controle Financeiro:* Tabela de NFs e boletos da empresa com modal de novo lançamento e confirmação de liquidação.
  4. *Histórico de E-mails:* Trilha de auditoria das mensagens enviadas com data e conteúdo integral.
  5. *Dados Cadastrais & Espaço:* Resumo cadastral e indicação da sala ou bancada ocupada.
- **`src/app/financeiro/page.jsx` (Painel Contábil):** Área exclusiva do setor financeiro com cartões de balanço (Liquidado, Pendente, Atrasado), listagem de cobranças e modal de lançamento de novas NFs/boletos.
- **`src/app/comunicacao/page.jsx` (Central de E-mails):** Disparador de mensagens com modelos prontos (Boas-vindas, Cobrança, Renovação de Anuidade), seleção de envio em lote ou pontual e histórico lateral de disparos.
- **`src/app/espacos/page.jsx` (Gestão de Infraestrutura):** Grid visual das salas privativas, estações de coworking e laboratórios, com indicação de ocupação e modal de alocação de afiliados.
- **`src/app/inscricao/page.jsx` (Portal Público de Autoatendimento):** Link externo formatado para empresas interessadas submeterem seus dados diretamente ao banco do sistema, eliminando a dependência de trocas informais de mensagens.
- **Componentes Base (`src/components/`):** `Navbar`, `Sidebar`, `MetricCard`, `TableCard`, `Modal`, `EmptyState`, `Badge` e `LoadingSpinner`.

---

## 5. Falhas Prevenidas

### Prevenidas pelo Arquiteto de Software & DBA:
1. **Ataques de Enumeração e Invasão de Privacidade (IDOR):** O uso de UUIDs (v4) gerados criptograficamente substituiu chaves sequenciais inteiras, impedindo que links de visualização de minutas ou cobranças enviadas por e-mail fossem adivinhados.
2. **Inconsistência por Registros Órfãos:** Configuração de `ON DELETE CASCADE` nas tabelas dependentes (documentos, cobranças, jurídico) e `ON DELETE SET NULL` para espaços físicos garante que nenhuma sala fique bloqueada caso o cadastro de uma empresa seja excluído.
3. **Erros de Arredondamento Financeiro:** Tipagem monetária em `DECIMAL(10, 2)` impediu imprecisões de ponto flutuante típicas de planilhas eletrônicas.
4. **Degradação por Consultas Repetidas:** Índices B-Tree nos campos de consulta frequente (`cnpj`, `status_jornada`, `data_fim_vigencia`, `empresa_id`).

### Prevenidas pelo Engenheiro de QA:
1. **Quebra por Arrays Vazios ou Falta de Dados (Empty States):** Componente `EmptyState` assegura que telas não exibam erros de Javascript (`undefined is not iterable`) quando o banco estiver sem registros ou filtros não retornarem dados.
2. **Payloads Incompletos em Formulários:** Validação estrita no backend rejeitando payloads sem CNPJ, razão social ou contato com código HTTP 400 antes de tentar persistência no banco.
3. **Duplicação de Empresas:** Validação de unicidade no controller retornando HTTP 409 caso haja tentativa de cadastrar o mesmo CNPJ mais de uma vez.
4. **Prevenção de Faturas Fantasmas:** Testes garantem que lançamentos financeiros só sejam aceitos caso o `empresaId` exista e seja válido no banco.

---

## 6. Lições Aprendidas e Recomendações de Evolução (Roadmap)

1. **Integração com WhatsApp Business API:** O primeiro contato das empresas ainda é realizado pelo aplicativo de mensagens. Recomenda-se integrar um webhook com a API Oficial da Meta para que a mensagem inicial já dispare automaticamente o link de autoatendimento (`/inscricao`) e cadastre a empresa no pipeline.
2. **Armazenamento de Arquivos em Nuvem (Cloud Object Storage):** Atualmente os uploads e contratos gerados são armazenados no storage local (`/uploads`). Conforme o número de empresas atingir a projeção de 60 afiliados e o volume de certidões crescer, recomenda-se migrar o storage para Amazon S3 ou MinIO.
3. **Autenticação Institucional (SSO / OAuth2 / JWT):** Implementar login integrado com a conta institucional da universidade gestora do parque para a equipe interna e magic links autenticados para os afiliados acessarem sua área restrita.

---
**Status Final:** Esteira SDLC homologada e 100% concluída.
