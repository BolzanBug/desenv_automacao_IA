"use client";

export default function EmptyState({
  title = "Nenhum registro encontrado",
  description = "Não há dados disponíveis para os critérios selecionados no momento.",
  actionLabel,
  onAction
}) {
  return (
    <div className="text-center py-12 px-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 my-4">
      <div className="mx-auto w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3.5 ring-1 ring-indigo-500/10">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
