# 📚 Guia de Prompts para o Orquestrador SDLC

Aqui estão os templates otimizados para você copiar, colar e adaptar quando for conversar com a Inteligência Artificial. Eles foram desenhados para extrair o máximo das Skills que configuramos.

## 1. 🚀 Criar o Projeto do Zero (Scaffold Inicial)
Use este prompt para iniciar o pipeline em cascata e deixar os 6 agentes trabalharem sozinhos do início ao fim.

**Comando:**
`/goal Ative a skill orquestrador-sdlc para ler o arquivo transcricao.pdf e criar o projeto completo de ponta a ponta.`

**Alternativa (Caso você queira digitar a ideia manualmente no chat):**
`/goal Ative a skill orquestrador-sdlc para criar um sistema de [SUA_IDEIA_AQUI]. O sistema deve focar no gerenciamento de [ENTIDADE] e ter fluxos de [FLUXO_ESPERADO].`

---

## 2. 🐛 Resolver um Bug que você encontrou
Quando o sistema já estiver rodando e você encontrar um erro específico, direcione o prompt cirurgicamente para a "equipe" responsável.

**Para erros no Node.js ou Banco de Dados:**
`/goal Ative a skill desenvolvedor-backend. Encontrei um bug crítico na rota [ROTA]. Quando faço a requisição, o servidor retorna o erro [MENSAGEM_DO_ERRO]. Por favor, analise o Controller, o Model e o arquivo de rotas para encontrar a falha e reescreva o arquivo corrigido.`

**Para erros no React/Next.js:**
`/goal Ative a skill desenvolvedor-frontend. A tela de [NOME_DA_TELA] está quebrando. O botão de [AÇÃO] não faz nada quando clicado e o erro no console diz [MENSAGEM]. Analise o componente, verifique a chamada do Axios e arrume o código imediatamente.`

---

## 3. ✨ Adicionar uma Feature Nova (Funcionalidade)
Quando o sistema já estiver no ar e o seu cliente pedir algo novo, você deve invocar a "esteira parcial" para essa feature.

**Comando:**
`/goal Precisamos criar uma feature nova de [NOME_DA_FEATURE]. Primeiro, ative o analista-de-requisitos para mapear os endpoints. Depois, ative o arquiteto-de-software para criar novas tabelas se necessário. Em seguida, chame o desenvolvedor-backend para codificar a API e, por fim, o desenvolvedor-frontend para fazer a tela conectada na API.`

---

## 4. ⚖️ Dar uma "Bronca" (Algo que ignoraram ou esqueceram)
Se os agentes entregaram o código, mas pularam etapas ou entregaram algo muito simples, use um tom impositivo citando as regras que eles mesmos têm.

**Comando:**
`/goal Ative as skills desenvolvedor-frontend e desenvolvedor-backend. Vocês ignoraram as regras estruturais. O frontend foi gerado como uma tela básica sem modais, e o backend não gerou os arquivos na pasta backend/docs/. Refaçam o trabalho agora mesmo, analisando o que falta e implementando a complexidade exigida nas instruções da skill.`

---

## 5. 🔄 Forçar a Reunião de Alinhamento (Code Review Cruzado)
Use este prompt quando o Frontend e o Backend não estiverem conseguindo se conectar ou estiverem se culpando por um erro de integração.

**Comando:**
`/goal Ative o desenvolvedor-frontend para testar mentalmente os endpoints atuais da pasta backend/ e relatar todos os erros no arquivo de analise do frontend. Depois, ative o desenvolvedor-backend para ler as reclamações e consertar a API imediatamente.`
