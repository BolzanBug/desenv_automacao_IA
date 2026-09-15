"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const sections = [
    {
      group: "Visão Geral",
      items: [
        {
          href: "/",
          label: "Dashboard Executivo",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          )
        }
      ]
    },
    {
      group: "Gestão Operacional",
      items: [
        {
          href: "/empresas",
          label: "Afiliados & Ficha 360°",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )
        },
        {
          href: "/financeiro",
          label: "Contabilidade & NFs",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          href: "/comunicacao",
          label: "Central de Comunicação",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )
        },
        {
          href: "/espacos",
          label: "Ocupação de Espaços",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          )
        }
      ]
    },
    {
      group: "Ações do Parque",
      items: [
        {
          href: "/empresas/nova",
          label: "+ Cadastrar Nova Empresa",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )
        }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 hidden md:flex border-r border-slate-800 shrink-0">
      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              {section.group}
            </div>
            <nav className="mt-2 space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-extrabold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                    }`}
                  >
                    <span className={isActive ? "text-white" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Info Card de Expansão */}
      <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 backdrop-blur-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">
            Escalonamento 2026
          </span>
        </div>
        <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed font-medium">
          Salto de <strong>22 para 60 empresas</strong> em gestão unificada sem planilhas manuais.
        </p>
      </div>
    </aside>
  );
}
