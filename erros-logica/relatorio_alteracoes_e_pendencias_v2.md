# Relatório de Alterações e Pendências - Integração V2 (Pollen Parque)

**Data:** 18/09/2026  
**Documento de Origem:** `/backend/docs/integracao_frontend_v2.md`  
**Referência do Produto:** `AGENTS.md`  
**Autor:** Agente Pollen Parque  

---

## 1. Contexto Geral

A versão V2 da integração tem como foco dois avanços no fluxo de afiliação do Pollen Parque:
1. **Substituição do formulário PDF de cadastro (`dasd.pdf`)** por um fluxo web de autoatendimento para empresas não-residentes (tipo `EXTERNA`, flag `residente: false`).
2. **Geração automatizada de minutas contratuais em PDF** a partir de modelo `.docx` (via `libreoffice-convert`) para empresas não-residentes, mantendo a geração em Markdown para empresas residentes.

Abaixo estão detalhadas as falhas, inconsistências e funcionalidades pendentes identificadas no **Backend** e no **Frontend**.

---

## 2. Inconsistências e Falhas no Backend

### 2.1. Divergência e Falta de Aliases nas Rotas
- **Cadastro Não-Residente (`/companies/nao-residente`):**
  - O documento `integracao_frontend_v2.md` especifica: `POST /api/v1/empresas/nao-residente` (ou `/api/v1/companies/nao-residente`).
  - Em `/backend/src/routes/empresaRoute.js`, apenas a rota em português `app.post('/empresas/nao-residente', ...)` foi registrada. A rota em inglês `app.post('/companies/nao-residente', ...)` **não existe**, o que causará erro 404 para clientes que seguem o padrão REST em inglês do restante da API.
- **Geração de Minutas (`/empresas/:id/contract/generate`):**
  - O documento especifica: `POST /api/v1/empresas/:id/contract/generate` (ou `/api/v1/companies/:id/contract/generate`).
  - Em `/backend/src/routes/empresaRoute.js`, apenas `/companies/:id/contract/generate` está registrada. O alias `/empresas/:id/contract/generate` **não foi registrado**.
- **Rota de Autoatendimento Público:**
  - O arquivo `/backend/src/routes/publicRoute.js` contém apenas `/public/register` e `/public/inscricao`. Não há uma rota explícita `/public/nao-residente` ou documentação clara de que `/empresas/nao-residente` dispensa autenticação.

### 2.2. Riscos e Fragilidades no Gerador de Contrato DOCX/PDF
- **Caminho Relativo Frágil (`templatePath`):**
  - No arquivo `/backend/src/utils/docxContractGenerator.js`:
    ```javascript
    const templatePath = path.resolve('erros-logica/Modelo minuta Programa de Afiliados (1).docx');
    ```
  - Isso assume que o processo Node sempre roda a partir da raiz `/backend`. Caso o processo seja iniciado de outro diretório (ou em contêiner), o caminho falha com `ENOENT`.
  - **Ação recomendada:** Usar caminho baseado em `__dirname` (`path.join(__dirname, '../../erros-logica/...')`) ou mover o arquivo modelo para uma pasta dedicada `/backend/src/templates/`.
- **Dependência Estrita de Binário Externo (LibreOffice):**
  - A biblioteca `libreoffice-convert` requer o binário do LibreOffice (`soffice`) instalado no sistema operacional do servidor.
  - Se o LibreOffice não estiver presente (cenário comum em contêineres Docker básicos ou servidores de desenvolvimento), a chamada rejeita com erro `500`.
  - **Ação recomendada:** Tratar o erro graciosamente no controller, avisando explicitamente nos logs/resposta se o LibreOffice não estiver disponível, ou fornecer fallback de download do `.docx` preenchido.
- **Substituição Incompleta de Campos no Modelo DOCX:**
  - Em `docxContractGenerator.js`, apenas os seguintes campos são substituídos: `razaoSocial`, `emailContato`, data corrente e `NomeCargoEmpresa`.
  - Campos cruciais do contrato (como CNPJ da empresa, endereço da sede, CPF e telefone do representante legal, valor da anuidade e condições) permanecem sem substituição ou com lacunas.
- **Ausência de Registro em `DocumentoAnexo`:**
  - Em `empresaController.js` (linhas 394-395), a inclusão do arquivo gerado na tabela de anexos está comentada:
    ```javascript
    // Se existir a tabela de anexos, registra o PDF nela (opcional)
    // await DocumentoAnexo.create(...)
    ```
  - Com isso, o contrato gerado não aparece quando o usuário ou a equipe consulta `/companies/:id/documents` nem na aba de documentos do frontend.

---

## 3. Funcionalidades Necessárias no Frontend

### 3.1. Formulário Público de Autoatendimento Não-Residente (Substituição de `dasd.pdf`)
Criar uma página pública acessível (ex: `/inscricao` ou `/cadastro-nao-residente`) contendo todos os 16 campos do formulário original `dasd.pdf`:
1. **Dados do Representante Legal:**
   - Nome Completo (`representanteNome`) *
   - CPF (`representanteCpf`) *
   - E-mail (`representanteEmail`) *
   - Telefone / WhatsApp (`representanteTelefone`) *
   - Endereço Residencial Completo (`representanteEndereco`) *
   - Função / Cargo na Empresa (`representanteCargo`) *
2. **Dados da Empresa (Pessoa Jurídica):**
   - Razão Social (`razaoSocial`) *
   - Nome Fantasia (`nomeFantasia`) *
   - CNPJ (`cnpj`) *
   - Ano de Fundação (`anoFundacao`) *
   - Área de Atuação / Segmento (`areaAtuacao`) *
   - E-mail para Receber Comunicações (`emailContato`) *
   - E-mail para Receber Boleto da Anuidade (`emailCobranca`) *
   - Telefone WhatsApp da Empresa (`telefone`) *
   - Site / Mídias Sociais (`site`) *
   - Endereço Completo da Empresa (`enderecoCompleto`, `cidade`, `estado`, `cep`) *
3. **Comportamento e Feedback:**
   - Máscaras e validação em tempo real (CNPJ, CPF, CEP, telefones e e-mails).
   - Envio para `POST /api/v1/empresas/nao-residente` (com fallback amigável caso o backend esteja em modo mock).
   - Tela de confirmação com protocolo de solicitação e orientações sobre os próximos passos.

### 3.2. Visualizador Híbrido de Minutas Contratuais (PDF vs Markdown)
Implementar na interface do sistema o tratamento exigido pela V2:
- **Detecção de Tipo:**
  - Inspecionar a resposta da rota `POST /companies/:id/contract/generate` ou o campo `conteudoGerado` do contrato da empresa.
  - Se começar com `[PDF GERADO]`:
    - Extrair o caminho relativo (ex: `/uploads/contratos/contrato_123.pdf`).
    - Montar a URL absoluta através da base do backend (ex: `http://localhost:3002/uploads/contratos/...`).
    - Exibir `<iframe src={pdfUrl} />` ou `<object data={pdfUrl} type="application/pdf" />` na tela.
    - Disponibilizar botão de ação direta **"Baixar Contrato em PDF"**.
  - Se for texto convencional (Markdown para empresas residentes):
    - Renderizar o conteúdo formatado em texto com visual de documento jurídico.
- **Ação de Geração:**
  - Permitir que a equipe execute a geração informando o valor da anuidade (padrão R$ 3.600,00) e cláusulas adicionais opcionais.

### 3.3. Ficha de Detalhes da Empresa e Gestão do Processo
Atualmente, clicar numa empresa na tabela abre apenas o modal genérico `CrudModal`. É indispensável que o frontend disponibilize a visão detalhada completa da empresa, permitindo:
- Visualizar todos os dados cadastrais (residente vs não-residente, contatos, endereço, dados fiscais).
- Acompanhar e alterar a etapa no pipeline (Inscrição recebida → Em análise → Documentação pendente → Contrato em preparação → Enviado à Procuradoria → Assinatura pendente → Aguardando pagamento → Ativo → Vencido → Encerrado).
- Executar a geração da minuta contratual e visualizá-la (PDF/MD).
- Gerenciar o checklist dos 5 signatários (Representante Legal, Diretoria de Inovação, Coordenação de Parcerias, Procuradoria Jurídica e Reitoria), registrando o retorno da Procuradoria.
- Visualizar e fazer upload de documentos anexos com aprovação/rejeição.
- Visualizar faturas, boletos e confirmar pagamentos.

### 3.4. Disponibilização do Contrato no Portal da Afiliada (`/portal-empresa`)
- Adicionar opção para que a empresa afiliada visualize e faça download direto da minuta/contrato PDF gerado para sua adesão.

### 3.5. Ajustes no Cliente de API (`src/services/api.js`)
- Adicionar métodos:
  - `api.companies.registerNonResident(data)` apontando para `/empresas/nao-residente`.
  - `api.public.registerNonResident(data)` apontando para `/empresas/nao-residente`.
  - Função utilitária `getStaticUrl(path)` para converter caminhos estáticos `/uploads/...` na URL completa do servidor backend configurado (`http://localhost:3002` ou porta ativa).
- Suporte a fallback de simulação local para demonstrações caso o backend não esteja ativo no momento do teste.

---

## 4. Matriz de Priorização das Correções

| Item | Componente | Descrição | Criticidade |
|---|---|---|---|
| 1 | Backend | Adicionar rotas `/companies/nao-residente` e `/empresas/:id/contract/generate` | Alta |
| 2 | Backend | Tornar caminho do `.docx` absoluto com base em `__dirname` e tratar ausência do LibreOffice | Alta |
| 3 | Frontend | Criar formulário público de autoatendimento não-residente (16 campos) | Alta |
| 4 | Frontend | Implementar modal/visualizador de minuta compatível com `[PDF GERADO]` e Markdown | Alta |
| 5 | Frontend | Implementar detalhe completo da empresa (pipeline, assinaturas, contrato, docs) | Alta |
| 6 | Backend | Salvar contrato gerado também em `DocumentoAnexo` | Média |
| 7 | Frontend | Disponibilizar download da minuta no Portal da Afiliada | Média |
| 8 | Backend | Preencher demais variáveis no modelo DOCX (CNPJ, endereço, etc.) | Baixa |

