"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                P
              </div>
              <div>
                <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight block leading-tight">
                  Pollen Parque
                </span>
                <span className="text-[10px] sm:text-xs text-indigo-600 font-bold tracking-wider uppercase block">
                  Parque Científico & Tecnológico
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Actions & User Header */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/inscricao"
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 border border-indigo-200 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/80 rounded-xl text-xs font-bold transition shadow-2xs"
            >
              <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="hidden sm:inline">Formulário Público de Inscrição</span>
              <span className="sm:hidden">Inscrição</span>
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center space-x-2.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                PP
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-none">
                  Gestão de Afiliados
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                  Operação Digital
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
