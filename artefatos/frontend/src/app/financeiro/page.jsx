"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/utils/axios";
import { toast } from "react-toastify";
import Badge from "@/components/Badge";
import MetricCard from "@/components/MetricCard";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function FinanceiroPage() {
  const [cobrancas, setCobrancas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [resumo, setResumo] = useState({ totalPendente: 0, totalPago: 0, totalAtrasado: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  // Modal de Nova Cobrança
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    empresaId: "",
    numeroNf: "",
    numeroBoleto: "",
    linhaDigitavel: "",
    chavePix: "financeiro.pollen@instituicao.edu.br",
    valor: "",
    dataVencimento: "",
    parcelaAtual: 1,
    totalParcelas: 1,
    observacao: ""
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const [resCob, resEmp] = await Promise.all([
        api.get("/financial/invoices", { params }),
        api.get("/companies")
      ]);

      setCobrancas(resCob.data.data || []);
      setResumo(resCob.data.resumo || { totalPendente: 0, totalPago: 0, totalAtrasado: 0 });
      setEmpresas(resEmp.data.data || []);
    } catch (error) {
      toast.error(error.message || "Erro ao carregar dados financeiros.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLaunch = async (e) => {
    e.preventDefault();
    if (!form.empresaId || !form.numeroNf || !form.valor || !form.dataVencimento) {
      toast.warn("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/financial/invoices", {
        ...form,
        valor: parseFloat(form.valor)
      });
      toast.success("Nota Fiscal e cobrança contábil lançadas com sucesso!");
      setIsModalOpen(false);
      setForm({
        empresaId: "",
        numeroNf: "",
        numeroBoleto: "",
        linhaDigitavel: "",
        chavePix: "financeiro.pollen@instituicao.edu.br",
        valor: "",
        dataVencimento: "",
        parcelaAtual: 1,
        totalParcelas: 1,
        observacao: ""
      });
      fetchData();
    } catch (error) {
      toast.error(error.message || "Erro ao lançar fatura.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async (invoiceId) => {
    try {
      await api.put(`/financial/invoices/${invoiceId}/pay`, {
        observacao: "Baixa manual realizada pelo setor contábil."
      });
      toast.success("Baixa financeira efetuada e pagamento confirmado!");
      fetchData();
    } catch (error) {
      toast.error(error.message || "Erro ao registrar liquidação.");
    }
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Módulo Contábil & Faturamento</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Contabilidade, Faturas & NFs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Substituição da antiga planilha laranja: controle de notas fiscais, boletos bancários, PIX e conciliação em lote.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>+ Lançar Cobrança</span>
        </button>
      </div>

      {/* Cards de Resumo Contábil */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard
          title="Faturamento Liquidado (Pago)"
          value={formatCurrency(resumo.totalPago)}
          subtitle="Total de receitas compensadas"
          color="emerald"
        />
        <MetricCard
          title="Faturamento em Aberto (Pendente)"
          value={formatCurrency(resumo.totalPendente)}
          subtitle="Boletos e faturas vigentes a vencer"
          color="amber"
        />
        <MetricCard
          title="Inadimplência (Atrasados)"
          value={formatCurrency(resumo.totalAtrasado)}
          subtitle="Faturas vencidas sem confirmação de baixa"
          color="rose"
        />
      </div>

      {/* Filtros */}
      <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Filtrar por Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50/70 text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todas as Cobranças</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="PAGO">Pagas</option>
            <option value="ATRASADO">Atrasadas</option>
          </select>
        </div>
        <span className="text-xs text-slate-400 font-semibold">
          {cobrancas.length} lançamentos encontrados
        </span>
      </div>

      {/* Tabela de Cobranças */}
      {loading ? (
        <LoadingSpinner text="Carregando lançamentos contábeis..." />
      ) : cobrancas.length > 0 ? (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresa</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">NF / Boleto</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vencimento</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {cobrancas.map((cob) => (
                  <tr key={cob.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {cob.empresa?.razao_social || "Empresa Afiliada"}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{cob.empresa?.cnpj}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-bold">NF #{cob.numero_nf}</div>
                      {cob.numero_boleto && (
                        <div className="text-[11px] text-slate-500 font-mono">Boleto: {cob.numero_boleto}</div>
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
                          onClick={() => handlePay(cob.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-2xs"
                        >
                          Confirmar Baixa
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          Liquidado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Nenhum lançamento contábil encontrado"
          description="Utilize o botão acima para cadastrar a primeira cobrança de anuidade ou cota de espaço físico."
          actionLabel="+ Lançar Cobrança"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {/* Modal de Lançamento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Lançar Nota Fiscal e Cobrança Contábil"
      >
        <form onSubmit={handleLaunch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Empresa Afiliada Destinatária *
            </label>
            <select
              required
              value={form.empresaId}
              onChange={(e) => setForm({ ...form, empresaId: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecione uma empresa...</option>
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.razao_social} ({emp.cnpj})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Número da NF *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: NF-0921"
                value={form.numeroNf}
                onChange={(e) => setForm({ ...form, numeroNf: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Valor Total (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="Ex: 1800.00"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Data de Vencimento *
              </label>
              <input
                type="date"
                required
                value={form.dataVencimento}
                onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Número do Boleto
              </label>
              <input
                type="text"
                placeholder="Código / Identificador"
                value={form.numeroBoleto}
                onChange={(e) => setForm({ ...form, numeroBoleto: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Chave PIX para Pagamento
            </label>
            <input
              type="text"
              value={form.chavePix}
              onChange={(e) => setForm({ ...form, chavePix: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white"
            />
          </div>

          <div className="flex justify-end space-x-2.5 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs"
            >
              {submitting ? "Lançando..." : "Salvar Cobrança"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
