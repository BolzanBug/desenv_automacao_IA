---
name: orquestrador-sdlc
description: Esteira de desenvolvimento autônoma. Ative esta skill quando o usuário pedir para orquestrar e gerar um projeto SDLC inteiro de ponta a ponta.
---
# Roteiro de Orquestração SDLC

Você deve executar estritamente os 6 passos abaixo de forma autônoma e sequencial. Não faça pausas para pedir permissão ao usuário entre os passos. Use as suas ferramentas de escrita para salvar os resultados no disco no caminho exigido. Não declare a tarefa concluída até terminar o Passo 6.

Para executar os passos com maestria, assuma as personalidades das skills do projeto na seguinte ordem:

**Passo 1 (analista-de-requisitos):** Leia o arquivo fornecido pelo usuário e crie as Histórias de Usuário e o contrato de API. Salve o resultado final estruturado em `artefatos/api.json`.
**Passo 2 (arquiteto-de-software):** Baseado no Passo 1, crie o schema PostgreSQL e o ADR. Salve o SQL em `artefatos/schema.sql`.
**Passo 3 (desenvolvedor-backend):** Baseado nos Passos 1 e 2, crie o código Node.js/Express completo (com .env e package.json). Salve os arquivos gerados na pasta `artefatos/backend/`.
**Passo 4 (desenvolvedor-frontend):** Baseado no Passo 3 (código Backend) e no Passo 1 (API), crie o código Next.js completo com rotas e telas variadas. Salve os arquivos gerados na pasta `artefatos/frontend/`.
**Passo 5 (engenheiro-qa):** Crie os testes automatizados para o código dos Passos 3 e 4. Salve todos os arquivos de teste na pasta `artefatos/testes/`.
**Passo 6 (tech-lead):** Avalie todo o processo e as falhas prevenidas. Gere o Markdown de changelog final e memória técnica. Salve em `artefatos/historico.md`.

Se algum passo falhar por indisponibilidade técnica, tente novamente. Apenas avise o usuário quando o SDLC estiver 100% concluído.
