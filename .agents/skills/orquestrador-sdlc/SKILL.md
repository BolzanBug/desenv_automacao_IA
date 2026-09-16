---
name: orquestrador-sdlc
description: Esteira de desenvolvimento autônoma. Ative esta skill quando o usuário pedir para orquestrar e gerar um projeto SDLC inteiro de ponta a ponta.
---
# Roteiro de Orquestração SDLC

Você deve executar estritamente os 4 passos abaixo de forma autônoma e sequencial. Não faça pausas para pedir permissão ao usuário entre os passos. Use as suas ferramentas de escrita para salvar os resultados no disco no caminho exigido. Não declare a tarefa concluída até terminar o Passo 4.

Para executar os passos com maestria, assuma as personalidades das skills do projeto na seguinte ordem:

**Passo 1 (analista-de-requisitos):** Leia o arquivo fornecido pelo usuário e crie as Histórias de Usuário e o contrato de API. Salve o resultado final estruturado em `backend/docs/api.json`.
**Passo 2 (arquiteto-de-software):** Baseado no Passo 1, crie o schema PostgreSQL e o ADR. Salve o SQL e as documentações das tabelas na pasta `backend/`.
**Passo 3 (desenvolvedor-backend):** Baseado nos Passos 1 e 2, crie o código Node.js/Express completo. Analise o que já está na pasta `backend/erros-logica/` e corrija. Salve os novos arquivos em `backend/`.
**Passo 4 (tech-lead):** Avalie todo o processo e as falhas prevenidas. Gere o Markdown de changelog final e memória técnica. Salve em `backend/docs/historico.md`.

Se algum passo falhar por indisponibilidade técnica, tente novamente. Apenas avise o usuário quando o SDLC estiver 100% concluído (API gerada). Não construa o frontend!
