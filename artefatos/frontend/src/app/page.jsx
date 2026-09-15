"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/utils/axios";
import { toast } from "react-toastify";
import MetricCard from "@/components/MetricCard";
import TableCard from "@/components/TableCard";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [recentCompanies, setRecentCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resMetrics, resCompanies] = await Promise.all([
        api.get("/dashboard/metrics"),
        api.get("/companies")
      ]);

      setMetrics(resMetrics.data.data);
      setRecentCompanies(resCompanies.data.data ? resCompanies.data.data.slice(0, 5) : []);
    } catch (error) {
      toast.error("Não foi possível carregar os dados do dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Consolidando indicadores executivos do Pollen Parque..." />;
  }

  return (
    <div className="space-y-8">
      {/* Top Banner Tecnológico & Executivo */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3 backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <span>Painel de Comando Unificado • Pollen Parque</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Gestão Estratégica de Afiliados
          </h1>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
            Centralização completa da jornada de formalização, emissão automatizada de contratos sem &quot;X&quot;,
            conciliação financeira e custódia de infraestrutura.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/empresas/nova"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-500/30 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>+ Cadastrar Empresa</span>
            </Link>

            <Link
              href="/financeiro"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-700 transition"
            >
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Lançar NF / Boleto</span>
            </Link>

            <Link
              href="/comunicacao"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-700 transition"
            >
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Disparar Comunicados</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Alerta de Vigência de Contratos */}
      {metrics?.contratosVencendo30Dias > 0 && (
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4.5 flex items-center justify-between text-amber-900 shadow-xs">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-amber-950">Atenção para Renovações de Termos de Afiliação</h4>
              <p className="text-xs text-amber-800 mt-0.5 font-medium">
                Existem <strong>{metrics.contratosVencendo30Dias} empresa(s)</strong> com vigência expirando nos próximos 30 dias.
              </p>
            </div>
          </div>
          <Link
            href="/empresas?expiringSoon=true"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shrink-0 shadow-xs"
          >
            Ver Lista
          </Link>
        </div>
      )}

      {/* Grid de Métricas Principais (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <MetricCard
          title="Total de Empresas Afiliadas"
          value={metrics?.totalEmpresas || 0}
          subtitle="Meta anual: 60 afiliados consolidados"
          trend={`${metrics?.empresasAtivas || 0} ativas`}
          color="indigo"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />

        <MetricCard
          title="Em Tramitação (Pipeline)"
          value={metrics?.empresasEmProcesso || 0}
          subtitle="Minuta, Procuradoria ou Assinaturas"
          trend="Fluxo Ativo"
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />

        <MetricCard
          title="Ocupação de Espaços Físicos"
          value={`${metrics?.taxaOcupacaoEspacos || 0}%`}
          subtitle={`${metrics?.espacosOcupados || 0} de ${metrics?.totalEspacos || 0} espaços ocupados`}
          trend="Salas & Coworking"
          color="purple"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          }
        />

        <MetricCard
          title="Receita Liquidada (Paga)"
          value={`R$ ${(metrics?.totalReceitaLiquida || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Taxas e anuidades compensadas"
          color="emerald"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <MetricCard
          title="Faturamento Pendente"
          value={`R$ ${(metrics?.totalPendente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Boletos e cobranças em aberto"
          color="amber"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <MetricCard
          title="Inadimplências / Atrasos"
          value={`R$ ${(metrics?.totalAtrasado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Requer acionamento da contabilidade"
          color="rose"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Seção de Empresas Recentes */}
      <div className="space-y-4">
        <TableCard
          title="Afiliados Recentes no Ecossistema"
          subtitle="Acompanhe o status e acesse a Ficha 360° com 1 clique"
          companies={recentCompanies}
          actionLabel="Ver todos os afiliados"
          actionHref="/empresas"
        />
      </div>
    </div>
  );
}
