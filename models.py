from pydantic import BaseModel, Field
from typing import List, Dict, Any

# =================================================================
# SAÍDA DO AGENTE 1 (Analista de Requisitos)
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
# SAÍDA DO AGENTE 2 (Arquiteto / DBA PostgreSQL)
# =================================================================

class ArchitectureOutput(BaseModel):
    postgres_schema: str = Field(description="Script SQL puro (CREATE TABLE, relacionamentos, índices e constraints) para PostgreSQL")
    adr: str = Field(description="Documento Markdown (Architecture Decision Record) justificando as escolhas de tabelas e normalização")

# =================================================================
# SAÍDA DO AGENTE 3 (Documentador Técnico)
# =================================================================

class DocumentacaoOutput(BaseModel):
    versao_resumo: str = Field(description="Um resumo executivo (1 parágrafo) do que foi implementado nesta sessão")
    log_alteracoes: str = Field(description="O texto em Markdown contendo a branch atual, as tabelas SQL que foram criadas e as rotas de API que foram projetadas. Formate de maneira elegante.")
    erros_evitados: List[str] = Field(description="Lista de armadilhas ou erros de arquitetura que foram prevenidos neste design (Memória/Lições aprendidas)")