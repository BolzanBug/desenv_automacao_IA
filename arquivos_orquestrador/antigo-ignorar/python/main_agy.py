import os
import json
import asyncio
import subprocess
from dotenv import load_dotenv
load_dotenv()
from pydantic import BaseModel, Field
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig

# Importando os modelos Pydantic do arquivo existente
from models import (
    RequirementsOutput, ArchitectureOutput, 
    BackendOutput, FrontendOutput, QAOutput, DocumentacaoOutput
)

def pegar_branch_atual():
    try:
        return subprocess.check_output(["git", "branch", "--show-current"]).decode("utf-8").strip()
    except:
        return "main"

def ler_prompt_agente(nome_skill):
    # Procura na raiz do projeto subindo um diretório caso esteja na pasta python/
    if nome_skill.endswith(".txt"):
        nome_skill = nome_skill[:-4]
    caminho = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".agents/skills", nome_skill, "SKILL.md")
    try:
        with open(caminho, "r", encoding="utf-8") as f:
            return f.read().strip()
    except Exception as e:
        print(f"⚠️ Erro ao ler a skill {caminho}: {e}")
        return "Você é um agente prestativo."

async def processar_com_agente(nome, system_prompt, task_description, modelo_pydantic, dependencias="", modelo_llm="flash"):
    print(f"\n[{nome}] 🤖 Iniciando raciocínio...")
    
    schema_json = json.dumps(modelo_pydantic.model_json_schema(), indent=2)
    prompt_completo = f"""Você é o {nome}.
{system_prompt}

INSTRUÇÃO CRÍTICA:
Você deve retornar SUA RESPOSTA INTEIRA APENAS COMO UM JSON válido que obedeça ESTRITAMENTE a este schema JSON:
{schema_json}

CONTEXTO ANTERIOR (DEPENDÊNCIAS):
{dependencias}

SUA TAREFA ATUAL:
{task_description}

Não adicione nenhum texto antes ou depois do JSON. Não use blocos de código markdown (```json). RETORNE APENAS O JSON PURO.
"""

    config = LocalAgentConfig(
        system_instructions=prompt_completo,
        capabilities=CapabilitiesConfig(),
        model=modelo_llm
    )
    
    async with Agent(config) as agent:
        response = await agent.chat("Inicie a tarefa fornecendo o JSON.")
        texto_completo = ""
        
        async for token in response:
            texto_completo += token
            print(token, end="", flush=True)
            
        print(f"\n[{nome}] ✅ Tarefa concluída.\n")
        
        # Limpar o texto para garantir que é JSON
        texto_limpo = texto_completo.strip()
        if texto_limpo.startswith("```json"):
            texto_limpo = texto_limpo[7:]
        if texto_limpo.endswith("```"):
            texto_limpo = texto_limpo[:-3]
            
        try:
            return modelo_pydantic.model_validate_json(texto_limpo.strip())
        except Exception as e:
            print(f"❌ Erro ao validar o JSON retornado por {nome}: {e}")
            print(f"Retorno cru: {texto_limpo[:200]}...")
            return None

async def orquestrar_antigravity(ideia_ou_contexto: str):
    branch_atual = pegar_branch_atual()
    
    regras_arquitetura = ""
    if os.path.exists("padroes_projeto.txt"):
        with open("padroes_projeto.txt", "r", encoding="utf-8") as f:
            regras_arquitetura = f"\n\n⚠️ REGRAS GLOBAIS DE ARQUITETURA OBRIGATÓRIAS:\n{f.read()}\n"
            print("📜 [Aviso] Guia 'padroes_projeto.txt' carregado!")

    print(f"\n🚀 Iniciando SDLC Completo com ANTIGRAVITY SDK na branch: [{branch_atual}]...\n")

    # 1. ANALISTA DE REQUISITOS
    t_req = await processar_com_agente(
        nome="Analista de Requisitos Sênior",
        system_prompt=ler_prompt_agente("analista.txt"),
        task_description=f"Leia este contexto e crie as histórias de usuário e desenhe a API REST para Node.js.\nContexto: {ideia_ou_contexto}",
        modelo_pydantic=RequirementsOutput
    )

    # 2. ARQUITETO DE SOFTWARE
    t_arq = await processar_com_agente(
        nome="Arquiteto de Software Sênior",
        system_prompt=ler_prompt_agente("arquiteto.txt"),
        task_description="Crie as tabelas PostgreSQL e escreva o ADR justificando as decisões.",
        dependencias=f"Contrato da API gerado: {t_req.model_dump_json() if t_req else 'N/A'}",
        modelo_pydantic=ArchitectureOutput
    )

    # 3. DESENVOLVEDOR BACKEND
    t_back = await processar_com_agente(
        nome="Desenvolvedor Backend Sênior",
        system_prompt=ler_prompt_agente("dev_backend.txt"),
        task_description=f"Crie o código fonte real da API (Node/Express).{regras_arquitetura}",
        dependencias=f"Banco SQL: {t_arq.postgres_schema if t_arq else 'N/A'}\nAPI: {t_req.model_dump_json() if t_req else 'N/A'}",
        modelo_pydantic=BackendOutput,
        modelo_llm="pro"
    )

    # 4. DOCUMENTADOR
    t_doc = await processar_com_agente(
        nome="Tech Lead e Documentador",
        system_prompt=ler_prompt_agente("documentador.txt"),
        task_description=f"Crie o relatório consolidado de changelog e lições aprendidas.",
        dependencias=f"Requisitos: {t_req}\nArquiteto: {t_arq}\nBackend: {t_back}",
        modelo_pydantic=DocumentacaoOutput
    )

    return t_req, t_arq, t_back, t_doc


async def main():
    print("=============================================")
    print("🚀 SDLC ORQUESTRADOR IA (ANTIGRAVITY SDK)")
    print("=============================================\n")
    print(" [1] Digitar ideia no terminal")
    print(" [2] Carregar arquivo de contexto (.txt, .md, .pdf)\n")
    
    escolha = input("Digite 1 ou 2: ").strip()
    ideia = ""
    
    if escolha == "1": 
        ideia = input("\n📝 Descreva a funcionalidade: \n> ")
    elif escolha == "2":
        caminho = input("\n📂 Caminho do arquivo: ").strip()
        if not os.path.exists(caminho):
            print(f"❌ Erro: O arquivo '{caminho}' não existe!")
            return
            
        if caminho.lower().endswith(".pdf"):
            print("☁️ Tentando usar o modelo Gemini Flash Lite (mais robusto no plano grátis) via genai para OCR...")
            try:
                from google import genai
                chave_api = os.getenv("GEMINI_API_KEY")
                client = genai.Client(api_key=chave_api)
                arquivo_upload = client.files.upload(file=caminho)
                
                print("👁️ O Gemini está lendo a imagem do PDF...")
                resposta = client.models.generate_content(
                    model='gemini-3.6-flash',
                    contents=[
                        arquivo_upload, 
                        "Extraia e transcreva com 100% de precisão."
                    ]
                )
                ideia = resposta.text
                print(f"✅ PDF lido com sucesso pela IA! ({len(ideia)} caracteres extraídos).")
            except Exception as e:
                print(f"❌ Erro no OCR: {e}")
                return
        else:
            with open(caminho, "r", encoding="utf-8") as f: ideia = f.read()
            print(f"✅ Arquivo Lido! Extraídos {len(ideia)} caracteres.")
    else:
        print("❌ Escolha inválida.")
        return

    t_req, t_arq, t_back, t_doc = await orquestrar_antigravity(ideia)
    
    if not t_doc:
        print("❌ O processo foi interrompido por um erro.")
        return

    # SALVANDO ARTEFATOS
    os.makedirs("artefatos", exist_ok=True)
    if t_req:
        with open("artefatos/api_contract.json", "w", encoding="utf-8") as f:
            f.write(t_req.model_dump_json(indent=4))
            
    if t_arq:
        with open("artefatos/schema.sql", "w", encoding="utf-8") as f:
            f.write("-- Banco Gerado pelo Arquiteto\n")
            f.write(t_arq.postgres_schema)
    
    def salvar_arquivos_codigo(lista_arquivos, prefixo_pasta="artefatos"):
        if not lista_arquivos: return
        for arquivo in lista_arquivos:
            caminho_final = os.path.join(prefixo_pasta, arquivo.file_path)
            os.makedirs(os.path.dirname(caminho_final), exist_ok=True)
            with open(caminho_final, "w", encoding="utf-8") as f:
                f.write(arquivo.content)
                print(f"  [+] Criado: {caminho_final}")

    if t_back:
        print("\n📦 Gerando Scaffold Backend:")
        salvar_arquivos_codigo(t_back.backend_files)
        
    

    

    if t_doc:
        with open("artefatos/historico_versoes.md", "a", encoding="utf-8") as f:
            f.write(f"\n\n## Release: {t_doc.versao_resumo}\n")
            f.write(t_doc.log_alteracoes)
            f.write("\n### 🧠 Qualidade & Memória\n")
            for erro in t_doc.erros_evitados: f.write(f"- {erro}\n")

if __name__ == "__main__":
    asyncio.run(main())
