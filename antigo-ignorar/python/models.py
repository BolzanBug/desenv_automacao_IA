from pydantic import BaseModel, Field
from typing import List, Dict, Any

# =================================================================
# SAÍDA DO AGENTE 1 (Requisitos / Analista)
# =================================================================
class UserStory(BaseModel):
    title: str = Field(description="Título curto da história de usuário")
    description: str = Field(description="Descrição no formato: 'Como um [ator], eu quero [ação] para [motivo]'")
    acceptance_criteria: List[str] = Field(description="Lista de regras de negócio (critérios de aceite) testáveis")

class APIEndpoint(BaseModel):
    method: str = Field(description="Método HTTP do Node/Express (ex: GET, POST, PUT, DELETE)")
    route: str = Field(description="O caminho da rota da API (ex: /api/v1/usuarios)")
    description: str = Field(description="O que este endpoint faz na regra de negócio")
    request_payload: Dict[str, Any] = Field(description="Esquema JSON esperado no corpo da requisição POST/PUT", default_factory=dict)
    response_payload: Dict[str, Any] = Field(description="Esquema JSON esperado na resposta de sucesso")

class RequirementsOutput(BaseModel):
    feature_name: str = Field(description="Nome geral da funcionalidade")
    user_stories: List[UserStory] = Field(description="Lista de histórias de usuário mapeadas")
    api_contracts: List[APIEndpoint] = Field(description="Lista de endpoints necessários para atender as histórias")

# =================================================================
# SAÍDA DO AGENTE 2 (Design & Arquitetura / DBA)
# =================================================================
class ArchitectureOutput(BaseModel):
    postgres_schema: str = Field(description="Script SQL puro (CREATE TABLE, relacionamentos, índices e constraints) para PostgreSQL")
    adr: str = Field(description="Documento Markdown (Architecture Decision Record) justificando as escolhas de tabelas e normalização")

# =================================================================
# SAÍDA DO AGENTE 3 (Backend)
# =================================================================
class CodeFile(BaseModel):
    file_path: str = Field(description="Caminho relativo sugerido para salvar o arquivo (ex: backend/src/controllers/UserController.js ou frontend/src/app/page.jsx)")
    content: str = Field(description="Código fonte completo do arquivo, sem marcações markdown ao redor.")

class BackendOutput(BaseModel):
    backend_files: List[CodeFile] = Field(description="Lista de arquivos backend Node.js/Express (rotas, controllers, queries, .env, package.json)")

# =================================================================
# SAÍDA DO AGENTE 4 (Frontend)
# =================================================================
class FrontendOutput(BaseModel):
    frontend_files: List[CodeFile] = Field(description="Lista de arquivos frontend (Componentes React, Next.js, .env, package.json)")

# =================================================================
# SAÍDA DO AGENTE 5 (Testes & QA)
# =================================================================
class QAOutput(BaseModel):
    backend_tests: List[CodeFile] = Field(description="Arquivos de teste Jest/Supertest para o backend (ex: backend/tests/User.test.ts)")
    frontend_tests: List[CodeFile] = Field(description="Arquivos de teste React Testing Library para o frontend (ex: frontend/tests/UserForm.test.tsx)")

# =================================================================
# SAÍDA DO AGENTE 5 (Observabilidade & Documentação / Tech Lead)
# =================================================================
class DocumentacaoOutput(BaseModel):
    versao_resumo: str = Field(description="Resumo executivo do que foi implementado nesta esteira")
    log_alteracoes: str = Field(description="Texto em Markdown com as alterações de rotas, tabelas e componentes criados.")
    erros_evitados: List[str] = Field(description="Lições aprendidas e bugs prevenidos pela arquitetura e testes.")