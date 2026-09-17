# Integração Frontend V2: Empresas Não Residentes e Contratos em PDF

Esta documentação detalha as mudanças recentes na API, que afetam o cadastro de empresas (formulário não-residente) e a geração de minutas contratuais.

## 1. Novo Endpoint: Cadastro Não-Residente (Autoatendimento)
**POST** `/api/v1/empresas/nao-residente` (ou `/api/v1/companies/nao-residente`)

Este endpoint foi construído para captar diretamente o payload oriundo do novo formulário (que substitui o `dasd.pdf`).

### Payload Esperado (JSON)
```json
{
  "razaoSocial": "Tech Soluções Ltda",
  "nomeFantasia": "Tech Soluções",
  "cnpj": "12.345.678/0001-99",
  "emailContato": "contato@tech.com",
  "telefone": "(49) 99999-9999",
  "enderecoCompleto": "Rua das Tecnologias, 100",
  "cidade": "Chapecó",
  "estado": "SC",
  "cep": "89800-000",
  
  "representanteNome": "João da Silva",
  "representanteCpf": "123.456.789-00",
  "representanteCargo": "CEO",
  "representanteEndereco": "Rua Residencial, 200, Centro, Chapecó-SC",
  "representanteEmail": "joao@tech.com",
  "representanteTelefone": "(49) 98888-8888",
  
  "anoFundacao": 2021,
  "areaAtuacao": "Desenvolvimento de Software",
  "emailCobranca": "financeiro@tech.com",
  "site": "https://tech.com"
}
```

**Comportamento Backend:**
- A empresa será criada com a flag interna `residente: false`.
- O `tipo` será salvo automaticamente como `'EXTERNA'`.
- Os assinantes padrão (Diretoria, Reitoria, Representante, etc.) já são populados na tabela `assinaturas_contrato` automaticamente.

---

## 2. Geração de Contratos: Migração de MD para PDF (DOCX)
**POST** `/api/v1/empresas/:id/contract/generate` (ou `/api/v1/companies/:id/contract/generate`)

A lógica interna desse endpoint mudou. 

1. **Para Empresas Residentes:** A API continua retornando um objeto com o `conteudo_gerado` em **Markdown**, como era antes.
2. **Para Empresas NÃO Residentes:** A API injeta os dados num modelo padrão `.docx` e os converte para um arquivo **`.pdf`**.
   
### Novo Retorno (Exemplo para Não Residente)
```json
{
  "message": "Minuta contratual gerada com sucesso a partir dos dados da empresa",
  "data": {
    "id": "e0e2d5a3-...",
    "empresaId": "...",
    "numeroTermo": "TERMO-EXTERNO/2026/...",
    "titulo": "Contrato de Afiliação Não Residente — TECH SOLUÇÕES LTDA",
    "conteudoGerado": "[PDF GERADO] /uploads/contratos/contrato_uuid-da-empresa.pdf",
    "valorAnuidade": "3600.00",
    "status": "GERADO"
  }
}
```

### O que o Frontend precisa fazer?
Quando a API retornar `conteudoGerado` (ou `conteudo_gerado`) começando com `[PDF GERADO]`, o frontend não deve tentar renderizar o texto como Markdown na tela de "Visualização da Minuta".
Em vez disso, ele deve extrair o caminho do arquivo (ex: `/uploads/contratos/contrato_123.pdf`) e renderizar um `<object>` ou `<iframe>` do PDF, ou disponibilizar um botão "Baixar Contrato em PDF", apontando para a URL estática do servidor: `http://localhost:3001/uploads/contratos/contrato_123.pdf`.

