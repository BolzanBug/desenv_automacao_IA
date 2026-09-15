"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/utils/axios";
import { toast } from "react-toastify";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function EspacosPage() {
  const [espacos, setEspacos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal de Alocação
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modal de Novo Espaço
  const [isNewSpaceModalOpen, setIsNewSpaceModalOpen] = useState(false);
  const [newSpaceForm, setNewSpaceForm] = useState({
    identificador: "",
    tipo: "SALA_PRIVATIVA",
    capacidade: 1
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resEspacos, resEmpresas] = await Promise.all([
        api.get("/spaces"),
        api.get("/companies")
      ]);
      setEspacos(resEspacos.data.data || []);
      setEmpresas(resEmpresas.data.data || []);
    } catch (error) {
      toast.error(error.message || "Erro ao carregar inventário de espaços.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/spaces/allocate", {
        spaceId: selectedSpace.id,
        empresaId: selectedEmpresaId || null
      });
      toast.success(
        selectedEmpresaId
          ? "Espaço físico alocado com sucesso!"
          : "Espaço liberado com sucesso!"
      );
      setSelectedSpace(null);
      setSelectedEmpresaId("");
      fetchData();
    } catch (error) {
      toast.error(error.message || "Erro ao alterar alocação do espaço.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSpace = async (e) => {
    e.preventDefault();
    if (!newSpaceForm.identificador.trim()) {
      toast.warn("Identificador do espaço é obrigatório.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/spaces", newSpaceForm);
      toast.success("Novo espaço físico cadastrado no inventário do Pollen!");
      setIsNewSpaceModalOpen(false);
      setNewSpaceForm({ identificador: "", tipo: "SALA_PRIVATIVA", capacidade: 1 });
      fetchData();
    } catch (error) {
      toast.error(error.message || "Erro ao cadastrar espaço.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalOcupados = espacos.filter((e) => e.status === "OCUPADO").length;
  const taxaOcupacao = espacos.length > 0 ? Math.round((totalOcupados / espacos.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Infraestrutura do Parque Tecnológico</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Gestão & Ocupação de Espaços Físicos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Substituição da antiga planilha de controle físico: inventário de salas privativas, bancadas de coworking e módulos laboratoriais.
          </p>
        </div>

        <button
          onClick={() => setIsNewSpaceModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>+ Cadastrar Espaço</span>
        </button>
      </div>

      {/* Indicadores de Ocupação */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total de Espaços</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{espacos.length}</span>
        </div>
        <div className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Disponíveis</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{espacos.length - totalOcupados}</span>
        </div>
        <div className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Taxa de Ocupação</span>
          <span className="text-2xl font-black text-indigo-600 mt-1 block">{taxaOcupacao}%</span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Carregando inventário de infraestrutura física..." />
      ) : espacos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {espacos.map((esp) => (
            <div
              key={esp.id}
              className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {esp.tipo.replace(/_/g, " ")}
                  </span>
                  <Badge status={esp.status} />
                </div>

                <h3 className="text-base font-black text-slate-900">{esp.identificador}</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Capacidade: <strong>{esp.capacidade} pessoa(s)</strong>
                </p>

                {esp.empresa ? (
                  <div className="mt-4 p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                      Afiliado Alocado:
                    </span>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      {esp.empresa.razao_social}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      CNPJ: {esp.empresa.cnpj}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3.5 bg-emerald-50/50 rounded-2xl border border-dashed border-emerald-200 text-xs text-emerald-800 font-bold">
                    ✓ Livre para alocação imediata.
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedSpace(esp);
                    setSelectedEmpresaId(esp.empresa_id || "");
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold text-xs rounded-xl transition border border-transparent hover:border-indigo-100"
                >
                  {esp.empresa_id ? "Alterar / Liberar" : "Alocar Afiliado"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum espaço físico cadastrado"
          description="Cadastre as salas, laboratórios ou bancadas de coworking do Pollen Parque."
          actionLabel="+ Cadastrar Espaço"
          onAction={() => setIsNewSpaceModalOpen(true)}
        />
      )}

      {/* Modal de Alocação de Espaço */}
      <Modal
        isOpen={!!selectedSpace}
        onClose={() => setSelectedSpace(null)}
        title={`Gerenciar Ocupação: ${selectedSpace?.identificador}`}
      >
        <form onSubmit={handleAllocate} className="space-y-4">
          <p className="text-xs text-slate-500">
            Selecione qual empresa afiliada ocupará este espaço físico ou deixe em branco para liberar.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Empresa Afiliada
            </label>
            <select
              value={selectedEmpresaId}
              onChange={(e) => setSelectedEmpresaId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Nenhuma (Liberar Espaço)</option>
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.razao_social} ({emp.cnpj})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2.5 pt-3">
            <button
              type="button"
              onClick={() => setSelectedSpace(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs"
            >
              {submitting ? "Salvando..." : "Confirmar Alocação"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Cadastro de Novo Espaço */}
      <Modal
        isOpen={isNewSpaceModalOpen}
        onClose={() => setIsNewSpaceModalOpen(false)}
        title="Cadastrar Novo Espaço no Parque"
      >
        <form onSubmit={handleCreateSpace} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Identificador da Sala / Espaço *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Sala 204 - Bloco Tecnológico"
              value={newSpaceForm.identificador}
              onChange={(e) => setNewSpaceForm({ ...newSpaceForm, identificador: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tipo de Espaço *
            </label>
            <select
              value={newSpaceForm.tipo}
              onChange={(e) => setNewSpaceForm({ ...newSpaceForm, tipo: e.target.value })}
              className="w-full px-3.5 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white"
            >
              <option value="SALA_PRIVATIVA">Sala Privativa</option>
              <option value="BANCADA_COWORKING">Bancada de Coworking</option>
              <option value="MODULO_LAB">Módulo de Laboratório</option>
              <option value="BOX_EMPREENDEDOR">Box Empreendedor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Capacidade Máxima (Pessoas)
            </label>
            <input
              type="number"
              min="1"
              value={newSpaceForm.capacidade}
              onChange={(e) => setNewSpaceForm({ ...newSpaceForm, capacidade: parseInt(e.target.value) || 1 })}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white"
            />
          </div>

          <div className="flex justify-end space-x-2.5 pt-3">
            <button
              type="button"
              onClick={() => setIsNewSpaceModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs"
            >
              {submitting ? "Cadastrando..." : "Salvar no Inventário"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
