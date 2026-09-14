import os
import json
import subprocess
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI
from models import RequirementsOutput, ArchitectureOutput, DocumentacaoOutput

load_dotenv()

# =================================================================
# FUNÇÃO AUXILIAR: DESCOBRIR A BRANCH DO GIT
# =================================================================
def pegar_branch_atual():
    try:
        branch = subprocess.check_output(["git", "branch", "--show-current"]).decode("utf-8").strip()
        return branch if branch else "main"
    except Exception:
        return "branch_desconhecida"

# =================================================================
# 1. CONFIGURAÇÃO DA IA (LLM)
# =================================================================
chave_api = os.getenv("GEMINI_API_KEY")
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",
    verbose=True,
    temperature=0.2,
    google_api_key=chave_api
)

# =================================================================
# 2. DEFINIÇÃO DOS AGENTES
# =================================================================
analista = Agent(
    role="Analista de Requisitos Sênior",
    goal="Estruturar requisitos ágeis e contratos de API Node.js perfeitos.",
    backstory="Você é um PM focado em detalhes e cria contratos sem margem para dúvidas.",
    verbose=True, allow_delegation=False, llm=llm
)

arquiteto = Agent(
    role="Arquiteto DBA PostgreSQL",
    goal="Desenhar banco de dados escaláveis baseados na API.",
    backstory="Você previne problemas de banco antes que eles aconteçam, definindo chaves e índices otimizados.",
    verbose=True, allow_delegation=False, llm=llm
)

documentador = Agent(
    role="Tech Lead e Documentador",
    goal="Manter o histórico do projeto vivo, gerando Changelogs profissionais e rastreando versões.",
    backstory="Você é obsecado por rastreabilidade. Você anota em qual branch estamos trabalhando e documenta o que deu certo e o que foi evitado, gerando a memória do projeto.",
    verbose=True, allow_delegation=False, llm=llm
)

# =================================================================
# 3. ORQUESTRAÇÃO E TAREFAS
# =================================================================
def orquestrar(ideia_ou_contexto: str):
    branch_atual = pegar_branch_atual()
    print(f"\n🚀 Iniciando IA na branch: [{branch_atual}]...\n")

    task1 = Task(
        description=f"Leia este contexto/requisito:\n{ideia_ou_contexto}\n\nCrie as histórias de usuário e desenhe a API REST para Node.js necessária para atender a este contexto.",
        expected_output="JSON com histórias e contrato API.",
        agent=analista,
        output_pydantic=RequirementsOutput
    )

    task2 = Task(
        description="Leia o contrato da API gerado. Crie as tabelas PostgreSQL e escreva o ADR justificando.",
        expected_output="JSON com SQL puro e Markdown do ADR.",
        agent=arquiteto,
        output_pydantic=ArchitectureOutput
    )

    task3 = Task(
        description=f"O código está sendo feito na branch '{branch_atual}'. Analise o contrato da API gerado pela Tarefa 1 e o banco desenhado pela Tarefa 2. "
                    "Crie um relatório de versão contendo o que foi feito e os erros técnicos comuns que você evitou na arquitetura.",
        expected_output="Resumo executivo, Log de alterações formatado e Lições aprendidas.",
        agent=documentador,
        output_pydantic=DocumentacaoOutput
    )

    equipe = Crew(
        agents=[analista, arquiteto, documentador],
        tasks=[task1, task2, task3],
        process=Process.sequential,
        memory=True, 
        embedder={
            "provider": "google",
            "config": { "api_key": chave_api, "model": "models/embedding-001" }
        },
        verbose=True
    )

    equipe.kickoff()
    return task1, task2, task3

# =================================================================
# MENU INTERATIVO DE INICIALIZAÇÃO
# =================================================================
if __name__ == "__main__":
    print("=============================================")
    print("🤖 ORQUESTRADOR IA DE ENGENHARIA DE SOFTWARE")
    print("=============================================\n")
    print("Como você quer passar os requisitos da feature?")
    print(" [1] Digitar um texto agora no terminal")
    print(" [2] Carregar um arquivo (.txt, .md, .pdf)\n")
    
    escolha = input("Digite 1 ou 2: ").strip()
    
    ideia = ""
    
    if escolha == "1":
        ideia = input("\n📝 Descreva a funcionalidade que vamos construir: \n> ")
        
    elif escolha == "2":
        caminho = input("\n📂 Digite o nome/caminho do arquivo (ex: briefing.pdf): ").strip()
        
        if not os.path.exists(caminho):
            print(f"\n❌ Erro: O arquivo '{caminho}' não foi encontrado na pasta.")
            exit()
            
        # Logica para extrair o texto de diferentes formatos
        if caminho.lower().endswith(".pdf"):
            try:
                from PyPDF2 import PdfReader
                leitor = PdfReader(caminho)
                for pagina in leitor.pages:
                    ideia += pagina.extract_text() + "\n"
                print(f"✅ PDF lido com sucesso! ({len(ideia)} caracteres extraídos)")
            except ImportError:
                print("\n❌ Erro: Biblioteca PyPDF2 não instalada. Rode: pip install PyPDF2")
                exit()
        else:
            # Se for .txt ou .md
            with open(caminho, "r", encoding="utf-8") as arquivo:
                ideia = arquivo.read()
            print(f"✅ Arquivo de texto lido com sucesso! ({len(ideia)} caracteres extraídos)")
            
    else:
        print("Opção inválida. Saindo...")
        exit()

    # Só inicia se tiver conteúdo
    if len(ideia) < 5:
        print("❌ Texto muito curto, os agentes precisam de mais contexto!")
        exit()
        
    # Chama o orquestrador
    t1, t2, t3 = orquestrar(ideia)
    
    # ... Lógica de salvamento de arquivos ...
    print("\n=============================================")
    print("💾 SALVANDO ARTEFATOS NO DISCO...")
    print("=============================================\n")
    os.makedirs("artefatos", exist_ok=True)
    
    req_data = t1.output.pydantic.model_dump()
    with open("artefatos/api_contract.json", "w", encoding="utf-8") as f:
        json.dump(req_data, f, indent=4, ensure_ascii=False)
    
    sql_data = t2.output.pydantic.postgres_schema
    with open("artefatos/schema.sql", "w", encoding="utf-8") as f:
        f.write("-- Gerado pela IA Arquiteto\n")
        f.write(sql_data)
        
    doc_data = t3.output.pydantic
    with open("artefatos/historico_versoes.md", "a", encoding="utf-8") as f:
        f.write(f"\n\n## Sessão de Geração: {doc_data.versao_resumo}\n")
        f.write(doc_data.log_alteracoes)
        f.write("\n### 🧠 Memória / Erros Evitados\n")
        for erro in doc_data.erros_evitados:
            f.write(f"- {erro}\n")
            
    print("✅ Sucesso! Os arquivos foram gerados na pasta 'artefatos/'")
