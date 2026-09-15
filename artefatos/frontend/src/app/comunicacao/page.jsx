"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/utils/axios";
import { toast } from "react-toastify";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ComunicacaoPage() {
  const [empresas, setEmpresas] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form de Disparo
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [sendToAll, setSendToAll] = useState(true);
  const [template, setTemplate] = useState("boas_vindas");
  const [assunto, setAssunto] = useState("Boas-vindas ao Pollen Parque Científico e Tecnológico!");
  const [conteudo, setConteudo] = useState(
    "Prezado(a) Afiliado(a),\n\nÉ com grande satisfação que damos as boas-vindas à sua empresa no ecossistema de inovação do Pollen Parque. Seu processo de cadastro foi recebido com sucesso.\n\nAtenciosamente,\nEquipe do Programa Pollen."
  );

  const templates = {
    boas_vindas: {
      assunto: "Boas-vindas ao Pollen Parque Científico e Tecnológico!",
      conteudo:
        "Prezado(a) Afiliado(a),\n\nÉ com grande satisfação que damos as boas-vindas à sua empresa no ecossistema de inovação do Pollen Parque. Seu processo de cadastro foi recebido com sucesso.\n\nAtenciosamente,\nEquipe do Programa Pollen."
    },
    cobranca: {
      assunto: "Aviso de Emissão de Nota Fiscal e Vencimento de Parcela - Pollen Parque",
      conteudo:
        "Prezado(a) Afiliado(a),\n\nInformamos que sua Nota Fiscal e respectivo boleto bancário referente à anuidade/cota operacional já se encontram emitidos. Solicitamos a verificação da regularidade de pagamento até a data de vencimento indicada.\n\nAtenciosamente,\nSetor Contábil e Financeiro - Pollen Parque."
    },
    renovacao: {
      assunto: "Importante: Período de Renovação da Anuidade de Afiliação - Pollen Parque",
      conteudo:
        "Prezado(a) Afiliado(a),\n\nSeu termo de afiliação ao Pollen Parque está próximo do término de vigência. Convidamos sua equipe para dar início aos procedimentos de renovação e aditamento contratual para o próximo ciclo.\n\nAtenciosamente,\nEquipe de Gestão e Inovação."
    },
    geral: {
      assunto: "Comunicado Geral aos Afiliados - Eventos e Oportunidades",
      conteudo:
        "Prezados Afiliados,\n\nConvidamos todas as empresas residentes e associadas a participarem da nossa próxima rodada de mentoria e networking técnico nesta sexta-feira às 14h30.\n\nContamos com a sua presença!\nDiretoria do Pollen Parque."
    }
  };

  const handleTemplateChange = (key) => {
    setTemplate(key);
    if (templates[key]) {
      setAssunto(templates[key].assunto);
      setConteudo(templates[key].conteudo);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resEmp, resHist] = await Promise.all([
        api.get("/companies"),
        api.get("/communications/history")
      ]);
      setEmpresas(resEmp.data.data || []);
      setHistorico(resHist.data.data || []);
    } catch (error) {
      toast.error(error.message || "Erro ao carregar dados de comunicação.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSend = async (e) => {
    e.preventDefault();
    const ids = sendToAll ? empresas.map((e) => e.id) : selectedCompanies;

    if (ids.length === 0) {
      toast.warn("Selecione ao menos uma empresa destinatária.");
      return;
    }

    try {
      setSending(true);
      const { data } = await api.post("/communications/email", {
        companyIds: ids,
        assunto,
        conteudo,
        tipoEnvio: ids.length > 1 ? "MASSA" : "INDIVIDUAL"
      });
      toast.success(data.message || "E-mails disparados com sucesso!");
      fetchData();
    } catch (error) {
      toast.error(error.message || "Erro ao disparar comunicação.");
    } finally {
      setSending(false);
    }
  };

  const toggleSelectCompany = (id) => {
    setSelectedCompanies((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString("pt-BR");
    } catch {
      return String(dateStr);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
          <span>Central de Comunicação & Notificações</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Disparo de Comunicados & E-mails
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Elimine trocas avulsas de WhatsApp. Dispare comunicados individuais ou em lote para empresas afiliadas com histórico auditável.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Envio (2 colunas) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100">
          <h2 className="text-base font-bold text-slate-900 mb-4">Novo Disparo de Comunicado</h2>

          <form onSubmit={handleSend} className="space-y-5">
            {/* Seleção de Templates Rápidos */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Carregar Modelo Pré-definido
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: "boas_vindas", label: "🎉 Boas-vindas" },
                  { key: "cobranca", label: "💳 Cobrança / NF" },
                  { key: "renovacao", label: "⏱ Renovação" },
                  { key: "geral", label: "📢 Geral / Eventos" }
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => handleTemplateChange(t.key)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition ${
                      template === t.key
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Destinatários */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Destinatários
              </label>
              <div className="flex items-center space-x-4 mb-3">
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="destinatarios"
                    checked={sendToAll}
                    onChange={() => setSendToAll(true)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Todas as {empresas.length} empresas afiliadas</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="destinatarios"
                    checked={!sendToAll}
                    onChange={() => setSendToAll(false)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Selecionar empresas manualmente</span>
                </label>
              </div>

              {!sendToAll && (
                <div className="border border-slate-200 rounded-2xl p-3.5 max-h-40 overflow-y-auto space-y-1.5 bg-slate-50/50">
                  {empresas.map((emp) => (
                    <label key={emp.id} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer hover:text-indigo-600">
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(emp.id)}
                        onChange={() => toggleSelectCompany(emp.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-semibold">{emp.razao_social}</span>
                      <span className="text-slate-400">({emp.email})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Assunto */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assunto da Mensagem *
              </label>
              <input
                type="text"
                required
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            {/* Conteúdo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Conteúdo do Comunicado *
              </label>
              <textarea
                required
                rows={6}
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans bg-white"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center space-x-2 disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Disparando e-mails...</span>
                  </>
                ) : (
                  <span>Disparar Comunicação</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Histórico Recente (1 coluna) */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 flex flex-col h-full">
          <h2 className="text-base font-bold text-slate-900 mb-4">Últimas Comunicações</h2>

          {loading ? (
            <LoadingSpinner text="Carregando histórico..." />
          ) : historico.length > 0 ? (
            <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
              {historico.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl text-xs space-y-1 hover:bg-slate-100/60 transition">
                  <div className="flex justify-between items-start font-bold text-slate-900">
                    <span className="font-extrabold">{item.assunto}</span>
                    <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-2">
                      {formatDate(item.enviado_em)}
                    </span>
                  </div>
                  <p className="text-slate-600 line-clamp-2 leading-relaxed">{item.conteudo}</p>
                  <div className="text-[11px] text-indigo-700 font-bold pt-1">
                    {item.tipo_envio === "MASSA" ? "Disparo em Lote" : "Individual"} &bull; {item.destinatarios}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem envios registrados"
              description="Os e-mails disparados serão arquivados nesta lista para consulta e auditoria."
            />
          )}
        </div>
      </div>
    </div>
  );
}
