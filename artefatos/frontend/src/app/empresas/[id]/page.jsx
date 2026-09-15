"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/axios";
import { toast } from "react-toastify";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function EmpresaDetalhesPage() {
  const routeParams = useParams();
  const router = useRouter();
  const id = routeParams?.id;

  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("juridico"); // juridico, documentos, financeiro, comunicacao, dados

  // Estados de Ações
  const [actionLoading, setActionLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  // Estado das 5 assinaturas
  const [legalForm, setLegalForm] = useState({
    numeroChamadoProcuradoria: "",
    assinadoRepLegal: false,
    assinadoInst1: false,
    assinadoInst2: false,
    assinadoInst3: false,
    assinadoReitor: false
  });

  // Estado de Upload de Documento
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState("CND_FEDERAL");
  const [uploading, setUploading] = useState(false);

  // Estado de Lançamento de Cobrança
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    numeroNf: "",
    numeroBoleto: "",
    valor: "",
    dataVencimento: "",
    chavePix: "financeiro.pollen@instituicao.edu.br",
    parcelaAtual: 1,
    totalParcelas: 1
  });

  // Estado de Disparo de E-mail Individual
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({
    assunto: "",
    conteudo: ""
  });

  const fetchEmpresa = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/companies/${id}`);
      const emp = data?.data;
      if (!emp) {
        throw new Error("Dados da empresa não localizados.");
      }
      setEmpresa(emp);

      if (emp.processoJuridico) {
        setLegalForm({
          numeroChamadoProcuradoria: emp.processoJuridico.numero_chamado_procuradoria || "",
          assinadoRepLegal: Boolean(emp.processoJuridico.assinado_rep_legal),
          assinadoInst1: Boolean(emp.processoJuridico.assinado_inst_1),
          assinadoInst2: Boolean(emp.processoJuridico.assinado_inst_2),
          assinadoInst3: Boolean(emp.processoJuridico.assinado_inst_3),
          assinadoReitor: Boolean(emp.processoJuridico.assinado_reitor)
        });
      }
    } catch (err) {
      console.error("Erro ao carregar detalhes da empresa:", err);
      setError(err?.response?.data?.message || err.message || "Não foi possível carregar a ficha da empresa.");
      toast.error("Erro ao carregar detalhes da empresa.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmpresa();
  }, [fetchEmpresa]);

  // Helpers de Formatação Segura
  const getInitials = (name) => {
    if (!name) return "AF";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString("pt-BR");
    } catch {
      return String(dateStr);
    }
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "R$ 0,00";
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // Geração Automática de Minuta de Contrato
  const handleGenerateContract = async () => {
    try {
      setActionLoading(true);
      const { data } = await api.post(`/companies/${id}/contract/generate`);
      toast.success("Minuta de afiliação gerada automaticamente com sucesso!");
      setPreviewContent(data.data?.previewContent || "");
      setIsContractModalOpen(true);
      fetchEmpresa();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erro ao gerar minuta.");
    } finally {
      setActionLoading(false);
    }
  };

  // Salvar Status Jurídico e Assinaturas
  const handleSaveLegal = async () => {
    try {
      setActionLoading(true);
      await api.put(`/companies/${id}/legal-status`, legalForm);
      toast.success("Status jurídico e assinaturas atualizados com sucesso!");
      fetchEmpresa();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erro ao atualizar processo jurídico.");
    } finally {
      setActionLoading(false);
    }
  };

  // Upload de Documento
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.warn("Selecione um arquivo para envio.");
      return;
    }

    try {
      setUploading(true);
      const dataPayload = new FormData();
      dataPayload.append("file", selectedFile);
      dataPayload.append("tipoDocumento", docType);

      await api.post(`/companies/${id}/documents`, dataPayload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Documento anexado com sucesso ao perfil!");
      setSelectedFile(null);
      fetchEmpresa();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erro ao enviar arquivo.");
    } finally {
      setUploading(false);
    }
  };

  // Lançar Cobrança Contábil
  const handleLaunchInvoice = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.post("/financial/invoices", {
        ...invoiceForm,
        empresaId: id,
        valor: parseFloat(invoiceForm.valor)
      });
      toast.success("Cobrança contábil lançada com sucesso!");
      setIsInvoiceModalOpen(false);
      setInvoiceForm({
        numeroNf: "",
        numeroBoleto: "",
        valor: "",
        dataVencimento: "",
        chavePix: "financeiro.pollen@instituicao.edu.br",
        parcelaAtual: 1,
        totalParcelas: 1
      });
      fetchEmpresa();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erro ao lançar fatura.");
    } finally {
      setActionLoading(false);
    }
  };

  // Baixa / Confirmação de Pagamento
  const handleConfirmPayment = async (invoiceId) => {
    try {
      setActionLoading(true);
      await api.put(`/financial/invoices/${invoiceId}/pay`, {
        observacao: "Baixa manual realizada pela equipe via painel integrado."
      });
      toast.success("Pagamento confirmado e baixa contábil efetuada!");
      fetchEmpresa();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erro ao dar baixa na cobrança.");
    } finally {
      setActionLoading(false);
    }
  };

  // Disparar E-mail Individual
  const handleSendEmail = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.post("/communications/email", {
        companyIds: [id],
        assunto: emailForm.assunto,
        conteudo: emailForm.conteudo,
        tipoEnvio: "INDIVIDUAL"
      });
      toast.success("E-mail disparado e histórico preservado com sucesso!");
      setIsEmailModalOpen(false);
      setEmailForm({ assunto: "", conteudo: "" });
      fetchEmpresa();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erro ao enviar e-mail.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Carregando visão 360° da empresa..." />;
  }

  if (error || !empresa) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Erro ao carregar Ficha 360°</h2>
        <p className="text-xs text-slate-500 mb-6">{error || "Empresa afiliada não encontrada."}</p>
        <button
          onClick={() => router.push("/empresas")}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          &larr; Voltar para Lista de Empresas
        </button>
      </div>
    );
  }

  // Cálculos para o painel 360
  const signaturesCount = [
    legalForm.assinadoRepLegal,
    legalForm.assinadoInst1,
    legalForm.assinadoInst2,
    legalForm.assinadoInst3,
    legalForm.assinadoReitor
  ].filter(Boolean).length;

  const signaturesPercent = Math.round((signaturesCount / 5) * 100);

  const cobrancas = empresa.cobrancas || [];
  const totalFaturado = cobrancas.reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0);
  const totalPendente = cobrancas
    .filter((c) => c.status === "PENDENTE" || c.status === "ATRASADO")
    .reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0);

  let diasRestantes = null;
  if (empresa.data_fim_vigencia) {
    const fim = new Date(empresa.data_fim_vigencia);
    const diff = fim.getTime() - new Date().getTime();
    diasRestantes = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const espacos = empresa.espacosFisicos || [];

  return (
    <div className="space-y-6">
      {/* Navegação Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
        <Link href="/empresas" className="hover:text-indigo-600 transition">Afiliados</Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">{empresa.razao_social}</span>
        <span className="text-slate-300">•</span>
        <span className="text-indigo-600 font-bold">Ficha 360°</span>
      </div>

      {/* Hero Header do Afiliado */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-start sm:items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
            {getInitials(empresa.razao_social)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {empresa.razao_social}
              </h1>
              <Badge status={empresa.tipo_empresa} type="tipo" />
              <Badge status={empresa.status_jornada} />
            </div>

            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium mt-1">
              {empresa.nome_fantasia && (
                <span><strong>Fantasia:</strong> {empresa.nome_fantasia}</span>
              )}
              <span><strong>CNPJ:</strong> {empresa.cnpj}</span>
              <span><strong>Contato:</strong> {empresa.nome_contato}</span>
              <span><strong>E-mail:</strong> {empresa.email}</span>
              <span><strong>Telefone:</strong> {empresa.telefone}</span>
            </div>
          </div>
        </div>

        {/* Botões de Ações Rápidas */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Enviar E-mail</span>
          </button>

          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>+ Cobrança</span>
          </button>

          <button
            onClick={handleGenerateContract}
            disabled={actionLoading}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{actionLoading ? "Processando..." : "Gerar Minuta Oficial"}</span>
          </button>
        </div>
      </div>

      {/* Painel Executivo 360°: 4 Cards de Visão Geral */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Assinaturas Jurídicas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Trâmite Jurídico</span>
            <span className="text-indigo-600">{signaturesCount}/5</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mb-2">
            {signaturesPercent === 100 ? "Assinado & Concluído" : `${signaturesPercent}% Coletado`}
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                signaturesPercent === 100 ? "bg-emerald-500" : "bg-indigo-600"
              }`}
              style={{ width: `${signaturesPercent}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500">
            {empresa.processoJuridico?.numero_chamado_procuradoria
              ? `Proc: ${empresa.processoJuridico.numero_chamado_procuradoria}`
              : "Sem protocolo registrado"}
          </p>
        </div>

        {/* Card 2: Saúde Financeira */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Situação Financeira</span>
            <span className={`w-2 h-2 rounded-full ${totalPendente > 0 ? "bg-amber-500" : "bg-emerald-500"}`}></span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mb-1">
            {formatCurrency(totalFaturado)}
          </div>
          <p className="text-[11px] font-semibold text-slate-500">
            {totalPendente > 0 ? (
              <span className="text-rose-600 font-bold">{formatCurrency(totalPendente)} em aberto</span>
            ) : (
              <span className="text-emerald-600 font-bold">100% Adimplente</span>
            )}
            {" "}&bull; {cobrancas.length} lançamentos
          </p>
        </div>

        {/* Card 3: Infraestrutura no Parque */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Espaço no Parque</span>
            <span className="text-indigo-600 font-bold">{espacos.length} un.</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mb-1">
            {espacos.length > 0 ? espacos[0].identificador : "Sem Espaço Alocado"}
          </div>
          <p className="text-[11px] text-slate-500">
            {espacos.length > 0
              ? `Capacidade: ${espacos[0].capacidade} pessoas (${espacos[0].tipo})`
              : "Disponível para alocação de bancada/sala"}
          </p>
        </div>

        {/* Card 4: Vigência Contratual */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Término de Vigência</span>
            <span className="text-indigo-600">Calendário</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mb-1">
            {formatDate(empresa.data_fim_vigencia)}
          </div>
          <p className="text-[11px] font-bold">
            {diasRestantes !== null ? (
              diasRestantes <= 30 ? (
                <span className="text-rose-600 font-black">⚠️ Restam {diasRestantes} dias (Renovar urgente)</span>
              ) : diasRestantes <= 60 ? (
                <span className="text-amber-600">⏱ Restam {diasRestantes} dias para término</span>
              ) : (
                <span className="text-emerald-600">✅ Regular ({diasRestantes} dias restantes)</span>
              )
            ) : (
              <span className="text-slate-400">Vigência não definida</span>
            )}
          </p>
        </div>
      </div>

      {/* Navegação por Abas Organizadas */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100 px-6 bg-slate-50/50">
          <nav className="flex space-x-6 overflow-x-auto">
            {[
              { id: "juridico", label: "🏛️ Minuta & 5 Assinaturas" },
              { id: "documentos", label: `📄 Documentos do Edital (${(empresa.documentos || []).length})` },
              { id: "financeiro", label: `💳 Faturas & Finanças (${(empresa.cobrancas || []).length})` },
              { id: "comunicacao", label: `✉️ Histórico de E-mails (${(empresa.historicoEmails || []).length})` },
              { id: "dados", label: "🏢 Dados Cadastrais & Espaços" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-bold text-xs whitespace-nowrap transition-all duration-150 ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 sm:p-8">
          {/* Aba: Jurídico & 5 Assinaturas */}
          {activeTab === "juridico" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Trâmite Jurídico & As 5 Assinaturas Institucionais
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Substitui o processo manual com &quot;X&quot;. Homologação direta com a Procuradoria Jurídica.
                  </p>
                </div>

                <button
                  onClick={handleSaveLegal}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0"
                >
                  {actionLoading ? "Salvando..." : "Salvar Assinaturas"}
                </button>
              </div>

              {/* Input Chamado Procuradoria */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Número do Processo / Chamado na Procuradoria
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: PROC-2026/0491"
                    value={legalForm.numeroChamadoProcuradoria}
                    onChange={(e) =>
                      setLegalForm({ ...legalForm, numeroChamadoProcuradoria: e.target.value })
                    }
                    className="w-full sm:w-80 px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Status da Afiliação</span>
                  <div className="mt-0.5">
                    <Badge status={empresa.processoJuridico?.status_assinatura || "AGUARDANDO_PROCURADORIA"} />
                  </div>
                </div>
              </div>

              {/* Checklist dos 5 Signatários */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
                  Checklist dos 5 Signatários Obrigatórios (Transcrição Oficial):
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      key: "assinadoRepLegal",
                      title: "1. Representante Legal da Empresa",
                      subtitle: empresa.nome_contato,
                      desc: "Assinatura do gestor responsável pelo afiliado"
                    },
                    {
                      key: "assinadoInst1",
                      title: "2. Assinante Institucional 1",
                      subtitle: "Gestão de Inovação Pollen",
                      desc: "Validação do plano e aderência técnica"
                    },
                    {
                      key: "assinadoInst2",
                      title: "3. Assinante Institucional 2",
                      subtitle: "Diretoria Executiva do Parque",
                      desc: "Aprovação executiva e infraestrutura"
                    },
                    {
                      key: "assinadoInst3",
                      title: "4. Assinante Institucional 3",
                      subtitle: "Coordenação de Extensão",
                      desc: "Homologação acadêmica e de pesquisa"
                    },
                    {
                      key: "assinadoReitor",
                      title: "5. Reitor em Exercício",
                      subtitle: "Instituição Mantenedora",
                      desc: "Chancela formal da reitoria no termo"
                    }
                  ].map((sign) => {
                    const isChecked = Boolean(legalForm[sign.key]);
                    return (
                      <label
                        key={sign.key}
                        className={`border rounded-2xl p-4.5 flex items-start space-x-3 cursor-pointer transition-all ${
                          isChecked
                            ? "border-indigo-400 bg-indigo-50/50 shadow-2xs"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setLegalForm({ ...legalForm, [sign.key]: e.target.checked })
                          }
                          className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="text-xs font-black text-slate-900">{sign.title}</div>
                          <div className="text-[11px] font-bold text-indigo-600 mt-0.5">{sign.subtitle}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{sign.desc}</div>
                          <div className="mt-2.5">
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                isChecked
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {isChecked ? "✓ Assinado" : "Pendente"}
                            </span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Aba: Documentos do Edital */}
          {activeTab === "documentos" && (
            <div className="space-y-6">
              {/* Form de Upload */}
              <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Upload e Custódia de Documentos Exigidos em Edital
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Envio seguro de certidões negativas de débitos (CNDs), atos constitutivos e minutas.
                </p>

                <form onSubmit={handleUploadDocument} className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="w-full sm:w-64">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Categoria do Documento
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="CND_FEDERAL">CND Federal</option>
                      <option value="CND_ESTADUAL">CND Estadual</option>
                      <option value="CND_MUNICIPAL">CND Municipal</option>
                      <option value="CND_TRABALHISTA">CND Trabalhista</option>
                      <option value="CONTRATO_SOCIAL">Contrato Social / Estatuto</option>
                      <option value="CONTRATO_ASSINADO">Termo de Afiliação Assinado</option>
                      <option value="OUTRO">Outros Comprovantes</option>
                    </select>
                  </div>

                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Arquivo (.pdf, .png, .jpg, .docx)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0 disabled:opacity-50"
                  >
                    {uploading ? "Enviando..." : "Anexar Arquivo"}
                  </button>
                </form>
              </div>

              {/* Lista de Documentos */}
              <div className="overflow-hidden border border-slate-100 rounded-2xl">
                <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Documentos Custodiados no Sistema
                  </h4>
                </div>

                {empresa.documentos && empresa.documentos.length > 0 ? (
                  <div className="divide-y divide-slate-100 bg-white">
                    {empresa.documentos.map((doc) => {
                      const kb = ((parseFloat(doc.tamanho_bytes) || 0) / 1024).toFixed(1);
                      const docDate = doc.created_at || doc.createdAt;
                      return (
                        <div key={doc.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition">
                          <div className="flex items-center space-x-3.5">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">{doc.nome_original}</div>
                              <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5 font-medium">
                                <span className="font-semibold text-indigo-600">{doc.tipo_documento}</span>
                                <span>&bull;</span>
                                <span>{kb} KB</span>
                                <span>&bull;</span>
                                <span>{formatDate(docDate)}</span>
                              </div>
                            </div>
                          </div>

                          <a
                            href={doc.caminho_arquivo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition border border-indigo-200/50"
                          >
                            Visualizar
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 bg-white">
                    <EmptyState
                      title="Nenhum documento anexado ainda"
                      description="Faça o upload do primeiro documento acima para formalizar a afiliação da empresa."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Aba: Faturas & Finanças */}
          {activeTab === "financeiro" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Lançamentos Contábeis & Faturas</h3>
                  <p className="text-xs text-slate-500">
                    Controle de NFs, boletos, chaves PIX e conciliação de pagamentos.
                  </p>
                </div>
                <button
                  onClick={() => setIsInvoiceModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  + Lançar NF / Boleto
                </button>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
                {empresa.cobrancas && empresa.cobrancas.length > 0 ? (
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nota Fiscal</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vencimento</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {empresa.cobrancas.map((cob) => (
                        <tr key={cob.id} className="hover:bg-slate-50/60 transition">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">NF #{cob.numero_nf}</div>
                            {cob.numero_boleto && (
                              <div className="text-[11px] text-slate-400">Boleto: {cob.numero_boleto}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-black text-slate-900">
                            {formatCurrency(cob.valor)}
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">
                            {formatDate(cob.data_vencimento)}
                          </td>
                          <td className="px-6 py-4">
                            <Badge status={cob.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            {cob.status !== "PAGO" ? (
                              <button
                                onClick={() => handleConfirmPayment(cob.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-2xs"
                              >
                                Confirmar Baixa
                              </button>
                            ) : (
                              <span className="text-xs text-emerald-600 font-bold">Liquidado</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8">
                    <EmptyState
                      title="Nenhuma cobrança registrada"
                      description="Lance a primeira Nota Fiscal e Boleto desta empresa pelo botão acima."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Aba: Histórico de Comunicação */}
          {activeTab === "comunicacao" && (
            <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Histórico de Comunicações Enviadas
                </h4>
                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="text-xs text-indigo-600 font-bold hover:underline"
                >
                  + Enviar Novo E-mail
                </button>
              </div>

              {empresa.historicoEmails && empresa.historicoEmails.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {empresa.historicoEmails.map((email) => (
                    <div key={email.id} className="p-6 hover:bg-slate-50/50 transition">
                      <div className="flex items-center justify-between mb-1.5">
                        <h5 className="text-xs font-black text-slate-900">{email.assunto}</h5>
                        <span className="text-[11px] font-medium text-slate-400">
                          {formatDate(email.enviado_em)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {email.conteudo}
                      </p>
                      <div className="mt-3 text-[11px] text-slate-400 flex items-center space-x-2">
                        <span>Enviado por: {email.enviado_por || "Pollen Parque"}</span>
                        <span>&bull;</span>
                        <span>Destinatário: {email.destinatarios || empresa.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8">
                  <EmptyState
                    title="Nenhum e-mail registrado"
                    description="Todas as comunicações disparadas via plataforma ficam registradas aqui com data e conteúdo."
                  />
                </div>
              )}
            </div>
          )}

          {/* Aba: Dados Cadastrais & Espaços */}
          {activeTab === "dados" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
                  Informações Cadastrais Completas
                </h3>
                <div className="text-xs space-y-2.5">
                  <div><strong className="text-slate-400">Razão Social:</strong> <span className="text-slate-900 font-bold ml-2">{empresa.razao_social}</span></div>
                  <div><strong className="text-slate-400">Nome Fantasia:</strong> <span className="text-slate-900 font-semibold ml-2">{empresa.nome_fantasia || "-"}</span></div>
                  <div><strong className="text-slate-400">CNPJ:</strong> <span className="text-slate-900 font-mono ml-2">{empresa.cnpj}</span></div>
                  <div><strong className="text-slate-400">Modalidade:</strong> <span className="text-slate-900 font-semibold ml-2">{empresa.tipo_empresa}</span></div>
                  <div><strong className="text-slate-400">Responsável:</strong> <span className="text-slate-900 font-semibold ml-2">{empresa.nome_contato} ({empresa.cargo_contato || "Contato"})</span></div>
                  <div><strong className="text-slate-400">E-mail:</strong> <span className="text-indigo-600 font-medium ml-2">{empresa.email}</span></div>
                  <div><strong className="text-slate-400">Telefone:</strong> <span className="text-slate-900 font-medium ml-2">{empresa.telefone}</span></div>
                  <div><strong className="text-slate-400">Endereço:</strong> <span className="text-slate-900 font-medium ml-2">{empresa.endereco}</span></div>
                  <div><strong className="text-slate-400">Observações:</strong> <span className="text-slate-600 ml-2">{empresa.observacoes || "Nenhuma observação registrada."}</span></div>
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
                  Infraestrutura & Espaço Físico Alocado
                </h3>
                {espacos.length > 0 ? (
                  <div className="space-y-3">
                    {espacos.map((esp) => (
                      <div key={esp.id} className="p-4 bg-white border border-indigo-100 rounded-xl text-xs text-slate-800 shadow-2xs">
                        <div className="font-extrabold text-sm text-indigo-700">{esp.identificador}</div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Tipo: {esp.tipo} &bull; Capacidade: {esp.capacidade} pessoas &bull; Status: {esp.status}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Nenhum espaço físico do parque está atualmente alocado para este afiliado. Você pode alocar uma sala ou bancada na aba <strong>Ocupação de Espaços</strong>.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Preview da Minuta Gerada */}
      <Modal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        title="Minuta de Afiliação Gerada Automaticamente"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Documento gerado mesclando os dados oficiais cadastrados, eliminando montagem manual de campos.
          </p>
          <pre className="p-4 bg-slate-950 text-slate-100 rounded-2xl text-xs font-mono max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
            {previewContent}
          </pre>
          <div className="flex justify-end pt-3">
            <button
              onClick={() => setIsContractModalOpen(false)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              Fechar Visualizador
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Lançamento de Cobrança */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Lançar Nota Fiscal e Cobrança Contábil"
      >
        <form onSubmit={handleLaunchInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Número da Nota Fiscal (NF) *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: NF-2026/0491"
              value={invoiceForm.numeroNf}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, numeroNf: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="Ex: 1500.00"
                value={invoiceForm.valor}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, valor: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Vencimento *
              </label>
              <input
                type="date"
                required
                value={invoiceForm.dataVencimento}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dataVencimento: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Número do Boleto (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: 23793.38128 60083.01234..."
              value={invoiceForm.numeroBoleto}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, numeroBoleto: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end space-x-2.5 pt-3">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs"
            >
              {actionLoading ? "Lançando..." : "Salvar Cobrança"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Disparo de E-mail */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title={`Enviar E-mail para ${empresa.razao_social}`}
      >
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assunto da Mensagem *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Atualização do Termo de Afiliação - Pollen Parque"
              value={emailForm.assunto}
              onChange={(e) => setEmailForm({ ...emailForm, assunto: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Conteúdo do Comunicado *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Digite o texto do e-mail..."
              value={emailForm.conteudo}
              onChange={(e) => setEmailForm({ ...emailForm, conteudo: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end space-x-2.5 pt-3">
            <button
              type="button"
              onClick={() => setIsEmailModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs"
            >
              {actionLoading ? "Enviando..." : "Enviar Mensagem"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
