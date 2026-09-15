"use client";

export default function MetricCard({ title, value, subtitle, icon, trend, color = "indigo" }) {
  const colorMap = {
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100",
      ring: "ring-indigo-500/20"
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      ring: "ring-emerald-500/20"
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
      ring: "ring-blue-500/20"
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
      ring: "ring-amber-500/20"
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100",
      ring: "ring-purple-500/20"
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-100",
      ring: "ring-rose-500/20"
    }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        {icon && (
          <div className={`w-10 h-10 rounded-xl ${scheme.bg} ${scheme.text} flex items-center justify-center ring-1 ${scheme.ring}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h2>
        {trend && (
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>}
    </div>
  );
}
