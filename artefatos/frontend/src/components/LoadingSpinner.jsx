"use client";

export default function LoadingSpinner({ text = "Carregando informações..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
        </div>
      </div>
      <p className="mt-4 text-xs font-bold text-slate-500 tracking-wide animate-pulse">{text}</p>
    </div>
  );
}
