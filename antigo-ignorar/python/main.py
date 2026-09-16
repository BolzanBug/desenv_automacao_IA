import os
import json
import subprocess
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI
from models import (RequirementsOutput, ArchitectureOutput, 
                    ImplementationOutput, QAOutput, DocumentacaoOutput)

load_dotenv()

# =================================================================
# FUNÇÃO AUXILIAR
# =================================================================
def pegar_branch_atual():
    try:
        branch = subprocess.check_output(["git", "branch", "--show-current"]).decode("utf-8").strip()
        return branch if branch else "main"
    except Exception:
        return "branch_desconhecida"

# =================================================================
# 1. CONFIGURAÇÃO DA IA
# =================================================================
chave_api = os.getenv("GEMINI_API_KEY")
if chave_api:
    os.environ["GEMINI_API_KEY"] = chave_api
llm = "gemini/gemini-3.6-flash"

# =================================================================
# 2. AS 5 PERSONAS DO SDLC
# =================================================================
analista = Agent(
    role="Analista de Requisitos Sênior",
    goal="Estruturar requisitos ágeis e contratos de API Node.js perfeitos.",
    backstory="Você é um PM focado em detalhes. Converte ideias vagas em JSONs de contratos RESTful estritos.",
    verbose=True, allow_delegation=False, llm=llm
)

arquiteto = Agent(
    role="Arquiteto DBA PostgreSQL",
    goal="Desenhar bancos de dados escaláveis baseados na API.",
    backstory="Você previne problemas de banco definindo chaves (FK/PK) e índices otimizados via scripts SQL puros.",
    verbose=True, allow_delegation=False, llm=llm
)

desenvolvedor = Agent(
    role="Desenvolvedor Fullstack Sênior (Node/React)",
    goal="Escrever código limpo e modular (JavaScript) respeitando os padrões do projeto.",
    backstory="Você pega as regras do Analista e o Banco do Arquiteto e gera o scaffold de CRUD completo, obedecendo cegamente ao Guia de Padrões de Arquitetura da empresa.",
    verbose=True, allow_delegation=False, llm=llm
)

engenheiro_qa = Agent(
    role="Engenheiro de Testes e QA Sênior",
    goal="Garantir a confiabilidade da aplicação gerando testes automatizados.",
    backstory="Você analisa o código fonte gerado e escreve baterias de testes obedecendo as diretrizes de QA do projeto.",
    verbose=True, allow_delegation=False, llm=llm
)

documentador = Agent(
    role="Tech Lead e Documentador",
    goal="Manter o histórico do projeto vivo, gerando Changelogs profissionais.",
    backstory="Você anota a branch de trabalho e consolida os artefatos gerados, guardando a memória técnica.",
    verbose=True, allow_delegation=False, llm=llm
)

# =================================================================
# 3. A ESTEIRA DO SDLC (TAREFAS)
# =================================================================
def orquestrar(ideia_ou_contexto: str):
    branch_atual = pegar_branch_atual()
    
    # --- NOVIDADE: INJEÇÃO DE PADRÕES ---
    regras_arquitetura = ""
    if os.path.exists("padroes_projeto.txt"):
        with open("padroes_projeto.txt", "r", encoding="utf-8") as f:
            regras_arquitetura = f"\n\n⚠️ REGRAS GLOBAIS DE ARQUITETURA OBRIGATÓRIAS:\n{f.read()}\n"
            print("📜 [Aviso] Guia 'padroes_projeto.txt' carregado e injetado nos agentes!")
            
    print(f"\n🚀 Iniciando SDLC Completo na branch: [{branch_atual}]...\n")

    task_req = Task(
        description=f"Leia este contexto:\n{ideia_ou_contexto}\n\nCrie as histórias de usuário e desenhe a API REST para Node.js.",
        expected_output="JSON com histórias e contrato API.",
        agent=analista,
        output_pydantic=RequirementsOutput
    )

    task_arq = Task(
        description="Leia o contrato da API gerado. Crie as tabelas PostgreSQL e escreva o ADR justificando.",
        expected_output="JSON com SQL puro e Markdown do ADR.",
        agent=arquiteto,
        output_pydantic=ArchitectureOutput
    )

    # Injetamos o arquivo padroes_projeto.txt na mente do Desenvolvedor!
    task_dev = Task(
        description=f"Crie o código fonte real (Scaffold) baseado no contrato e banco gerados."
                    f"{regras_arquitetura}"
                    f"Escreva o código JavaScript do Backend e Frontend exatamente como mandam as regras acima.",
        expected_output="Arquivos de código-fonte de Backend e Frontend obedecendo as regras.",
        agent=desenvolvedor,
        output_pydantic=ImplementationOutput
    )

    # Injetamos as regras de testes na mente do QA!
    task_qa = Task(
        description=f"Crie arquivos de teste automatizado para o código gerado."
                    f"{regras_arquitetura}"
                    f"Use estritamente as bibliotecas de teste exigidas nas regras globais acima.",
        expected_output="Arquivos de teste JavaScript.",
        agent=engenheiro_qa,
        output_pydantic=QAOutput
    )

    task_doc = Task(
        description=f"Analise tudo que as fases geraram e crie o relatório consolidado na branch '{branch_atual}'.",
        expected_output="Resumo, Changelog e Lições aprendidas.",
        agent=documentador,
        output_pydantic=DocumentacaoOutput
    )

    equipe = Crew(
        agents=[analista, arquiteto, desenvolvedor, engenheiro_qa, documentador],
        tasks=[task_req, task_arq, task_dev, task_qa, task_doc],
        process=Process.sequential,
        memory=True, 
        embedder={"provider": "google-generativeai", "config": { "api_key": chave_api, "model": "models/embedding-001" }},
        verbose=True
    )

    equipe.kickoff()
    return task_req, task_arq, task_dev, task_qa, task_doc

# =================================================================
# MAIN (EXECUÇÃO)
# =================================================================
if __name__ == "__main__":
    print("=============================================")
    print("🤖 SDLC FULL ORQUESTRADOR IA (Node/React/PG)")
    print("=============================================\n")
    print(" [1] Digitar ideia no terminal")
    print(" [2] Carregar arquivo de contexto (.txt, .md, .pdf)\n")
    
    escolha = input("Digite 1 ou 2: ").strip()
    ideia = ""
    
    if escolha == "1": ideia = input("\n📝 Descreva a funcionalidade: \n> ")
    elif escolha == "2":
        caminho = input("\n📂 Caminho do arquivo: ").strip()
        if not os.path.exists(caminho):
            print(f"❌ Erro: O arquivo '{caminho}' não existe!")
            exit()
        if caminho.lower().endswith(".pdf"):
            try:
                from google import genai
                print(f"☁️ Enviando '{caminho}' diretamente para a nuvem do Gemini (OCR)...")
                client = genai.Client(api_key=chave_api)
                arquivo_upload = client.files.upload(file=caminho)
                
                print("👁️ O Gemini está lendo a imagem do PDF...")
                resposta = client.models.generate_content(
                    model='gemini-3.6-flash',
                    contents=[
                        arquivo_upload, 
                        "Extraia e transcreva com 100% de precisão técnica todo o texto, regras de negócio e eventuais códigos presentes neste documento."
                    ]
                )
                ideia = resposta.text
                print(f"✅ PDF lido com sucesso pela IA! ({len(ideia)} caracteres extraídos).")
            except ImportError:
                print("❌ Erro: Biblioteca do Google não instalada. Rode: pip install google-genai")
                exit()
            except Exception as e:
                print(f"❌ Erro na API do Google ao ler o PDF: {e}")
                exit()
        else:
            with open(caminho, "r", encoding="utf-8") as f: ideia = f.read()
            print(f"✅ Arquivo Lido! Extraídos {len(ideia)} caracteres.")
    else:
        print("❌ Escolha inválida.")
        exit()

    if len(ideia) < 5:
        print("❌ Erro fatal: O texto extraído do arquivo está vazio ou muito curto!")
        exit()
        
    t_req, t_arq, t_dev, t_qa, t_doc = orquestrar(ideia)
    
    # -----------------------------------------------------------
    # SALVANDO ARTEFATOS
    # -----------------------------------------------------------
    os.makedirs("artefatos", exist_ok=True)
    with open("artefatos/api_contract.json", "w", encoding="utf-8") as f:
        json.dump(t_req.output.pydantic.model_dump(), f, indent=4, ensure_ascii=False)
        
    with open("artefatos/schema.sql", "w", encoding="utf-8") as f:
        f.write("-- Banco Gerado pelo Arquiteto\n")
        f.write(t_arq.output.pydantic.postgres_schema)
    
    def salvar_arquivos_codigo(lista_arquivos, prefixo_pasta="artefatos"):
        for arquivo in lista_arquivos:
            caminho_final = os.path.join(prefixo_pasta, arquivo.file_path)
            os.makedirs(os.path.dirname(caminho_final), exist_ok=True)
            with open(caminho_final, "w", encoding="utf-8") as f:
                f.write(arquivo.content)
                print(f"  [+] Criado: {caminho_final}")

    print("\n📦 Gerando Scaffold:")
    salvar_arquivos_codigo(t_dev.output.pydantic.backend_files)
    salvar_arquivos_codigo(t_dev.output.pydantic.frontend_files)

    print("\n🧪 Gerando Testes:")
    salvar_arquivos_codigo(t_qa.output.pydantic.backend_tests)
    salvar_arquivos_codigo(t_qa.output.pydantic.frontend_tests)

    doc = t_doc.output.pydantic
    with open("artefatos/historico_versoes.md", "a", encoding="utf-8") as f:
        f.write(f"\n\n## Release: {doc.versao_resumo}\n")
        f.write(doc.log_alteracoes)
        f.write("\n### 🧠 Qualidade & Memória\n")
        for erro in doc.erros_evitados: f.write(f"- {erro}\n")
