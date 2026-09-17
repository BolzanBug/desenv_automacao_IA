# Guia Definitivo de Integração e Pendências - Pollen Parque

Este documento lista todas as funcionalidades pendentes, rotas ausentes ou lógicas parciais que necessitam de implementação no **Backend** para atingir 100% de integração com as requisições que o **Frontend** do MVP solicita.

## 1. Sistema de Autenticação e Perfis (Login)
- **Status Front:** O formulário de login utiliza uma função local `api.auth.login` que resolve credenciais fixas (via objeto estático `demoUsers`) e salva um token de sessão falso no `localStorage`.
- **Status Back:** Não existem rotas de login (`/auth/login`) e não há controle de sessão (JWT) ou perfis na API.
- **O que precisa ser feito:** 
  - Criar uma tabela de `usuarios` ou associar representantes das `empresas` com senhas criptografadas.
  - Desenvolver o endpoint `POST /api/v1/auth/login` devolvendo o JWT.
  - Implementar middleware de autenticação em todas as rotas (atualmente livres).
  - Implementar verificação de Roles (Equipe do programa, Empresa afiliada, Financeiro).

## 2. Métricas do Dashboard (Pipeline e Alertas)
- **Status Front:** A tela inicial mapeia o funil em 5 fases fixas (Inscrições, Em análise, Documentos, Contratos, Ativos) e lista "Itens de Atenção" hardcoded (documentos lidos, pagamentos vencendo).
- **Status Back:** O `/dashboard/metrics` devolve totais brutos genéricos, sem agrupamento específico do pipeline e sem motor de pendências urgentes.
- **O que precisa ser feito:**
  - O endpoint `/dashboard/metrics` precisa agrupar a contagem de `status` para encaixar nos funis que a diretoria visualiza.
  - Criar uma rota (ex: `GET /api/v1/dashboard/alerts`) que filtre documentos vencidos, faturas vencendo nos próximos 7 dias e contratos aguardando assinaturas, populando o componente "Requer Atenção".

## 3. Gestão Dinâmica de Benefícios
- **Status Front:** Os ícones e descrições dos benefícios (Laboratórios, Salas, Mentoria, Endereço Fiscal) estão fixos e mockados em `api.portal.getCompanyData`.
- **Status Back:** O schema de BD lida com "espaços físicos", mas não há estrutura relacional para o conjunto intangível de "Benefícios Associativos".
- **O que precisa ser feito:**
  - Criar uma tabela paramétrica de Benefícios por Categoria/Porte da empresa.
  - Retornar a lista de benefícios ativos correspondentes à empresa via `/companies/:id`.

## 4. Integrações Externas Críticas (Comunicação, Assinatura e Pagamentos)
- **Status Atual (Conforme AGENTS.md):** O backend grava "emails", "faturas" e "assinaturas" perfeitamente de modo simulado/estático dentro do banco, porém sem conectores reais para proteger os dados.
- **O que precisa ser feito futuramente (Decisão Técnica e de Negócio):**
  - **Emails (`/communications/emails`):** Integrar um provedor real SMTP (AWS SES/SendGrid/Nodemailer) e substituir a apenas gravação em BD pelo disparo efetivo de confirmação de cadastro e boletos.
  - **Procuradoria e Assinaturas (`/companies/:id/signatures`):** Trocar a virada booleana (true/false) manual por uma integração via webhook com Assinatura Digital Externa (DocuSign, 1Doc, Gov.br).
  - **Financeiro (`/financial/invoices`):** Integrar com API bancária para emissão efetiva da linha digitável do boleto ou Payload PIX registrado.

## 5. Edição Avançada do Portal da Empresa
- **Status Front:** A afiliada vê o portal, mas caso queira editar informações próprias do perfil ou cadastrar colaboradores extras, esbarra em telas que ainda dependem do login.
- **Status Back:** As rotas `PUT /companies/:id` existem, mas no futuro precisarão validar se quem as invoca é a própria afiliada, barrando permissões.

> **Resumo:** A API de dados estritamente CRUD (`Empresas`, `Espaços`, `Documentos`, `Faturas`) já é funcional e foi conectada ao frontend com sucesso. A próxima iteração deve focar nos *aggregators* do dashboard, na camada de segurança/JWT e na modelagem de benefícios institucionais.
