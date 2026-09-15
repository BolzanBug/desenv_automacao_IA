"use client";

import { useState } from "react";
import api from "@/utils/axios";
import { toast } from "react-toastify";

export default function InscricaoPublicaPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    tipoEmpresa: "PADRAO",
    nomeContato: "",
    cargoContato: "",
    email: "",
    telefone: "",
    endereco: "",
    observacoes: ""
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.razaoSocial.trim()) errs.razaoSocial = "Razão social é obrigatória.";
    if (!formData.cnpj.trim()) errs.cnpj = "CNPJ ou Identificador Internacional é obrigatório.";
    if (!formData.nomeContato.trim()) errs.nomeContato = "Nome do responsável legal é obrigatório.";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Informe um e-mail corporativo válido.";
    }
    if (!formData.telefone.trim()) errs.telefone = "Telefone/WhatsApp é obrigatório.";
    if (!formData.endereco.trim()) errs.endereco = "Endereço completo é obrigatório.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.warn("Por favor, revise os campos obrigatórios informados.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/companies", formData);
      setSubmitted(true);
      toast.success("Inscrição submetida com sucesso!");
    } catch (error) {
      toast.error(error.message || "Erro ao enviar inscrição.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center border border-emerald-100">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Inscrição Enviada com Sucesso!</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Seus dados foram integrados diretamente ao ecossistema do <strong>Pollen Parque Científico e Tecnológico</strong>.
            Nossa equipe técnica já iniciou a geração da minuta de afiliação e entrará em contato
            via e-mail oficial para validação dos documentos exigidos em edital.
          </p>
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 font-medium">
            Dúvidas? Entre em contato pelo e-mail oficial: <strong>equipe.pollen@instituicao.edu.br</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 space-y-8">
        <div className="text-center space-y-2 border-b border-slate-100 pb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-extrabold border border-indigo-200">
            <span>Pollen Parque Científico & Tecnológico</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Formulário Oficial de Afiliação
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed font-medium">
            Preencha as informações cadastrais da sua empresa para emissão do Termo de Afiliação
            e abertura do processo institucional junto à Procuradoria Jurídica.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Modalidade */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Tipo de Organização *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "PADRAO", label: "Nacional Padrão", desc: "Pequeno/médio porte convencional" },
                { id: "GRANDE_PORTE", label: "Grande Porte", desc: "Em alteração contratual" },
                { id: "INTERNACIONAL", label: "Internacional", desc: "Empresa com sede no exterior" }
              ].map((m) => (
                <label
                  key={m.id}
                  className={`border rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between ${
                    formData.tipoEmpresa === m.id
                      ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="tipoEmpresa"
                    value={m.id}
                    checked={formData.tipoEmpresa === m.id}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div>
                    <span className="block text-xs font-black text-slate-900">{m.label}</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">{m.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Razão Social Oficial *
              </label>
              <input
                type="text"
                name="razaoSocial"
                value={formData.razaoSocial}
                onChange={handleChange}
                placeholder="Nome empresarial conforme contrato social"
                className={`w-full px-4 py-2.5 text-xs font-semibold border rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                  errors.razaoSocial ? "border-rose-300 bg-rose-50/50" : "border-slate-200"
                }`}
              />
              {errors.razaoSocial && <p className="text-xs text-rose-600 mt-1">{errors.razaoSocial}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome Fantasia
              </label>
              <input
                type="text"
                name="nomeFantasia"
                value={formData.nomeFantasia}
                onChange={handleChange}
                placeholder="Marca ou nome comercial"
                className="w-full px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {formData.tipoEmpresa === "INTERNACIONAL" ? "Tax ID / Registro Internacional *" : "CNPJ *"}
              </label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                placeholder={formData.tipoEmpresa === "INTERNACIONAL" ? "ID Fiscal Internacional" : "00.000.000/0000-00"}
                className={`w-full px-4 py-2.5 text-xs font-semibold border rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                  errors.cnpj ? "border-rose-300 bg-rose-50/50" : "border-slate-200"
                }`}
              />
              {errors.cnpj && <p className="text-xs text-rose-600 mt-1">{errors.cnpj}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Telefone / WhatsApp para Notificações *
              </label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className={`w-full px-4 py-2.5 text-xs font-semibold border rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                  errors.telefone ? "border-rose-300 bg-rose-50/50" : "border-slate-200"
                }`}
              />
              {errors.telefone && <p className="text-xs text-rose-600 mt-1">{errors.telefone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Representante Legal (Signatário do Contrato) *
              </label>
              <input
                type="text"
                name="nomeContato"
                value={formData.nomeContato}
                onChange={handleChange}
                placeholder="Nome completo do signatário"
                className={`w-full px-4 py-2.5 text-xs font-semibold border rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                  errors.nomeContato ? "border-rose-300 bg-rose-50/50" : "border-slate-200"
                }`}
              />
              {errors.nomeContato && <p className="text-xs text-rose-600 mt-1">{errors.nomeContato}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                E-mail Corporativo do Responsável *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@empresa.com"
                className={`w-full px-4 py-2.5 text-xs font-semibold border rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                  errors.email ? "border-rose-300 bg-rose-50/50" : "border-slate-200"
                }`}
              />
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Endereço Completo da Sede *
            </label>
            <input
              type="text"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              placeholder="Logradouro, número, complemento, bairro, cidade, estado e CEP"
              className={`w-full px-4 py-2.5 text-xs font-semibold border rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                errors.endereco ? "border-rose-300 bg-rose-50/50" : "border-slate-200"
              }`}
            />
            {errors.endereco && <p className="text-xs text-rose-600 mt-1">{errors.endereco}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Observações / Necessidades de Infraestrutura
            </label>
            <textarea
              name="observacoes"
              rows={3}
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Interesse em sala privativa, laboratório de prototipagem ou coworking..."
              className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Enviando Inscrição...</span>
              </>
            ) : (
              <span>Submeter Inscrição ao Pollen Parque</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
