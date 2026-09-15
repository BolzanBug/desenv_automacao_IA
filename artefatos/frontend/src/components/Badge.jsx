"use client";

export default function Badge({ status, type = "status" }) {
  const getBadgeStyle = () => {
    const s = String(status || "").toUpperCase();

    // Status da Jornada da Empresa
    if (s === "ATIVA") return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/10";
    if (s === "INSCRITA") return "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/10";
    if (s === "EM_ANALISE") return "bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/10";
    if (s === "JURIDICO") return "bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/10";
    if (s === "ASSINATURA") return "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/10";
    if (s === "INADIMPLENTE") return "bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/10";
    if (s === "VENCIDA") return "bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-500/10";
    if (s === "CANCELADA") return "bg-slate-100 text-slate-700 border-slate-300";

    // Status Financeiro
    if (s === "PAGO") return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/10";
    if (s === "PENDENTE") return "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/10";
    if (s === "ATRASADO") return "bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/10";

    // Status de Assinatura Jurídica
    if (s === "AGUARDANDO_PROCURADORIA") return "bg-purple-50 text-purple-700 border-purple-200";
    if (s === "ASSINATURAS_PENDENTES") return "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "ASSINADO_CONCLUIDO") return "bg-emerald-50 text-emerald-700 border-emerald-200";

    // Tipo de Empresa
    if (s === "PADRAO") return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (s === "GRANDE_PORTE") return "bg-violet-50 text-violet-700 border-violet-200";
    if (s === "INTERNACIONAL") return "bg-cyan-50 text-cyan-700 border-cyan-200";

    // Espaço Físico
    if (s === "DISPONIVEL") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "OCUPADO") return "bg-blue-50 text-blue-700 border-blue-200";
    if (s === "MANUTENCAO") return "bg-orange-50 text-orange-700 border-orange-200";

    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getLabel = () => {
    const labels = {
      INSCRITA: "Inscrita",
      EM_ANALISE: "Em Análise",
      JURIDICO: "Procuradoria",
      ASSINATURA: "Em Assinatura",
      ATIVA: "Ativa",
      INADIMPLENTE: "Inadimplente",
      VENCIDA: "Vencida",
      CANCELADA: "Cancelada",
      PAGO: "Pago",
      PENDENTE: "Pendente",
      ATRASADO: "Atrasado",
      AGUARDANDO_PROCURADORIA: "Aguardando Procuradoria",
      ASSINATURAS_PENDENTES: "Assinaturas Pendentes",
      ASSINADO_CONCLUIDO: "Assinado & Concluído",
      PADRAO: "Afiliada Padrão",
      GRANDE_PORTE: "Grande Porte",
      INTERNACIONAL: "Internacional",
      DISPONIVEL: "Disponível",
      OCUPADO: "Ocupado",
      MANUTENCAO: "Manutenção"
    };
    return labels[status] || status || "Indefinido";
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-80"></span>
      {getLabel()}
    </span>
  );
}
