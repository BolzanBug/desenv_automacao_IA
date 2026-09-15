"use client";

import Link from "next/link";
import Badge from "@/components/Badge";

export default function TableCard({
  title,
  subtitle,
  companies,
  data,
  actionLabel,
  actionHref,
  onOpenDeleteModal,
  onOpenStatusModal
}) {
  const companyList = companies || data || [];
  const getInitials = (name) => {
    if (!name) return "EP";
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

  return (
    <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Header do Card */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            <span>{actionLabel}</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {/* Tabela de Empresas */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/80">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Empresa Afiliada
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Modalidade
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status da Jornada
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Contato Principal
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Término de Vigência
              </th>
              <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-slate-100">
            {companyList.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-xs text-slate-400">
                  Nenhuma empresa afiliada cadastrada ou localizada com estes filtros.
                </td>
              </tr>
            ) : (
              companyList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Razão Social e CNPJ com Avatar */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {getInitials(item.razao_social)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition">
                          <Link href={`/empresas/${item.id}`}>{item.razao_social}</Link>
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          {item.nome_fantasia ? `${item.nome_fantasia} • ` : ""}
                          CNPJ: {item.cnpj}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Modalidade */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge status={item.tipo_empresa} type="tipo" />
                  </td>

                  {/* Status da Jornada */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge status={item.status_jornada} />
                  </td>

                  {/* Contato Principal */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-semibold text-slate-800">{item.nome_contato}</div>
                    <div className="text-xs text-slate-400">{item.email}</div>
                  </td>

                  {/* Vigência e dias restantes */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-semibold text-slate-700">
                      {formatDate(item.data_fim_vigencia)}
                    </div>
                    {item.diasRestantesVigencia !== undefined && item.diasRestantesVigencia !== null && (
                      <div
                        className={`text-[11px] font-bold mt-0.5 ${
                          item.diasRestantesVigencia <= 30
                            ? "text-rose-600"
                            : item.diasRestantesVigencia <= 60
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {item.diasRestantesVigencia > 0
                          ? `⏱ ${item.diasRestantesVigencia} dias restantes`
                          : "⚠️ Vencido"}
                      </div>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center space-x-1.5">
                      <Link
                        href={`/empresas/${item.id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/50 rounded-lg text-xs font-bold transition shadow-2xs"
                      >
                        Ficha 360°
                      </Link>

                      {onOpenStatusModal && (
                        <button
                          onClick={() => onOpenStatusModal(item)}
                          className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition"
                        >
                          Status
                        </button>
                      )}

                      {onOpenDeleteModal && (
                        <button
                          onClick={() => onOpenDeleteModal(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Excluir Empresa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
