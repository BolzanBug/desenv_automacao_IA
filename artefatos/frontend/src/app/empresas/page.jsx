"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/utils/axios";
import { toast } from "react-toastify";
import TableCard from "@/components/TableCard";
import Modal from "@/components/Modal";
import LoadingSpinner from "@/components/LoadingSpinner";

function EmpresasContent() {
  const searchParams = useSearchParams();
  const initialExpiring = searchParams.get("expiringSoon") === "true";

  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [expiringSoon, setExpiringSoon] = useState(initialExpiring);

  // Estados de Modais
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [companyToUpdateStatus, setCompanyToUpdateStatus] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEmpresas = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (tipoFilter) params.tipo = tipoFilter;
      if (expiringSoon) params.expiringSoon = "true";

      const { data } = await api.get("/companies", { params });
      setEmpresas(data.data || []);
    } catch (error) {
      toast.error(error.message || "Erro ao consultar empresas.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, tipoFilter, expiringSoon]);

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  // Exclusão de Empresa
  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    try {
      setActionLoading(true);
      await api.delete(`/companies/${companyToDelete.id}`);
      toast.success("Empresa removida com sucesso!");
      setCompanyToDelete(null);
      fetchEmpresas();
    } catch (error) {
      toast.error(error.message || "Erro ao excluir empresa.");
    } finally {
      setActionLoading(false);
    }
  };

  // Alteração de Status
  const handleUpdateStatus = async () => {
    if (!companyToUpdateStatus || !newStatus) return;
    try {
      setActionLoading(true);
      await api.put(`/companies/${companyToUpdateStatus.id}`, {
        statusJornada: newStatus
      });
      toast.success("Status atualizado com sucesso!");
      setCompanyToUpdateStatus(null);
      fetchEmpresas();
    } catch (error) {
      toast.error(error.message || "Erro ao atualizar status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Métricas rápidas da lista
  const totalAtivas = empresas.filter((e) => e.status_jornada === "ATIVA").length;
  const totalEmAnalise = empresas.filter((e) =>
    ["INSCRITA", "EM_ANALISE", "JURIDICO", "ASSINATURA"].includes(e.status_jornada)
  ).length;
  const totalInadimplentes = empresas.filter((e) => e.status_jornada === "INADIMPLENTE").length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Módulo de Afiliados</span>
            <span>&bull;</span>
            <span>Visão Consolidada</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Gestão de Empresas Afiliadas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Acompanhe o ciclo de vida, adimplência, trâmite de minutas e abra a <strong>Ficha 360°</strong> de cada empresa.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/empresas/nova"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>+ Nova Empresa</span>
          </Link>
        </div>
      </div>

      {/* Mini KPIs de Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Cadastrado</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{empresas.length}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Ativas</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{totalAtivas}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Em Tramitação</span>
          <span className="text-2xl font-black text-indigo-600 mt-1 block">{totalEmAnalise}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Inadimplentes</span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">{totalInadimplentes}</span>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Campo de Busca */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por razão social, CNPJ ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50"
          />
        </div>

        {/* Filtros Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50/70 text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos os Status</option>
            <option value="INSCRITA">Inscrita</option>
            <option value="EM_ANALISE">Em Análise</option>
            <option value="JURIDICO">Procuradoria</option>
            <option value="ASSINATURA">Em Assinatura</option>
            <option value="ATIVA">Ativa</option>
            <option value="INADIMPLENTE">Inadimplente</option>
            <option value="VENCIDA">Vencida</option>
            <option value="CANCELADA">Cancelada</option>
          </select>

          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50/70 text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todas as Modalidades</option>
            <option value="PADRAO">Padrão</option>
            <option value="GRANDE_PORTE">Grande Porte</option>
            <option value="INTERNACIONAL">Internacional</option>
          </select>

          <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer bg-slate-50/70 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
            <input
              type="checkbox"
              checked={expiringSoon}
              onChange={(e) => setExpiringSoon(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span>A vencer (60d)</span>
          </label>
        </div>
      </div>

      {/* Tabela de Dados */}
      {loading ? (
        <LoadingSpinner text="Buscando empresas afiliadas..." />
      ) : (
        <TableCard
          companies={empresas}
          onOpenDeleteModal={(emp) => setCompanyToDelete(emp)}
          onOpenStatusModal={(emp) => {
            setCompanyToUpdateStatus(emp);
            setNewStatus(emp.status_jornada || "INSCRITA");
          }}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={!!companyToDelete}
        onClose={() => setCompanyToDelete(null)}
        title="Confirmar Remoção de Empresa"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Você tem certeza que deseja remover o cadastro da empresa{" "}
            <strong className="text-slate-900">{companyToDelete?.razao_social}</strong>?
          </p>
          <p className="text-xs text-rose-700 bg-rose-50 p-3.5 rounded-xl border border-rose-200 font-medium leading-relaxed">
            Atenção: Por integridade referencial, todos os documentos, cobranças e histórico de
            e-mails vinculados a este registro serão permanentemente excluídos.
          </p>
          <div className="flex justify-end space-x-2.5 pt-3">
            <button
              onClick={() => setCompanyToDelete(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteCompany}
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs"
            >
              {actionLoading ? "Excluindo..." : "Sim, Excluir"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Alteração Rápida de Status */}
      <Modal
        isOpen={!!companyToUpdateStatus}
        onClose={() => setCompanyToUpdateStatus(null)}
        title="Alterar Status da Jornada"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Selecione o novo status operacional para{" "}
            <strong className="text-slate-900">{companyToUpdateStatus?.razao_social}</strong>:
          </p>

          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="INSCRITA">Inscrita (Formulário recebido)</option>
            <option value="EM_ANALISE">Em Análise Técnica / Minuta</option>
            <option value="JURIDICO">Procuradoria Jurídica</option>
            <option value="ASSINATURA">Em Coleta de Assinaturas</option>
            <option value="ATIVA">Ativa (Regular e Integrada)</option>
            <option value="INADIMPLENTE">Inadimplente (Pendência Financeira)</option>
            <option value="VENCIDA">Vencida (Anuidade Expirada)</option>
            <option value="CANCELADA">Cancelada</option>
          </select>

          <div className="flex justify-end space-x-2.5 pt-3">
            <button
              onClick={() => setCompanyToUpdateStatus(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpdateStatus}
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs"
            >
              {actionLoading ? "Salvando..." : "Atualizar Status"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function EmpresasPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Carregando módulo de empresas..." />}>
      <EmpresasContent />
    </Suspense>
  );
}
