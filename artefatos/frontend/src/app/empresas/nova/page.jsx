"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/utils/axios";
import { toast } from "react-toastify";

export default function NovaEmpresaPage() {
  const router = useRouter();
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
    dataFimVigencia: "",
    observacoes: ""
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.razaoSocial.trim()) errs.razaoSocial = "Razão social é obrigatória.";
    if (!formData.cnpj.trim()) errs.cnpj = "CNPJ ou Identificador é obrigatório.";
    if (!formData.nomeContato.trim()) errs.nomeContato = "Nome do responsável legal é obrigatório.";
    if (!formData.email.trim()) {
      errs.email = "E-mail de contato é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Informe um endereço de e-mail válido.";
    }
    if (!formData.telefone.trim()) errs.telefone = "Telefone/WhatsApp é obrigatório.";
    if (!formData.endereco.trim()) errs.endereco = "Endereço completo é obrigatório.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.warn("Preencha todos os campos obrigatórios corretamente.");
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await api.post("/companies", formData);
      toast.success("Empresa cadastrada com sucesso! Minuta jurídica pronta para geração.");
      router.push(`/empresas/${data.data.id}`);
    } catch (error) {
      toast.error(error.message || "Erro ao cadastrar empresa.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
        <Link href="/empresas" className="hover:text-indigo-600 transition">Afiliados</Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">Novo Cadastro</span>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xs border border-slate-100">
        <div className="border-b border-slate-100 pb-6 mb-6">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Porta de Entrada Oficial
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Cadastrar Empresa Afiliada
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Preencha os dados cadastrais da organização para iniciar a tramitação jurídica no Pollen Parque.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Linha 1: Tipo de Empresa */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
              Modalidade de Afiliação *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "PADRAO", label: "Padrão (Nacional)", desc: "Empresa de tecnologia convencional" },
                { id: "GRANDE_PORTE", label: "Grande Porte", desc: "Estrutura corporativa diferenciada" },
                { id: "INTERNACIONAL", label: "Internacional", desc: "Cadastro com ID e tax number global" }
              ].map((m) => (
                <label
                  key={m.id}
                  className={`border rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between ${
                    formData.tipoEmpresa === m.id
                      ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20"
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
                    <span className="block text-[11px] text-slate-500 mt-1">{m.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Linha 2: Razão Social & Nome Fantasia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Razão Social *
              </label>
              <input
                type="text"
                name="razaoSocial"
                value={formData.razaoSocial}
                onChange={handleChange}
                placeholder="Ex: Inova Soluções Tecnológicas LTDA"
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
                placeholder="Ex: InovaTech AI"
                className="w-full px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Linha 3: CNPJ & Fim de Vigência */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {formData.tipoEmpresa === "INTERNACIONAL" ? "ID / Tax Number *" : "CNPJ *"}
              </label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                placeholder={formData.tipoEmpresa === "INTERNACIONAL" ? "Ex: US-987654321" : "00.000.000/0000-00"}
                className={`w-full px-4 py-2.5 text-xs font-semibold border rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                  errors.cnpj ? "border-rose-300 bg-rose-50/50" : "border-slate-200"
                }`}
              />
              {errors.cnpj && <p className="text-xs text-rose-600 mt-1">{errors.cnpj}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Previsão de Término da Anuidade
              </label>
              <input
                type="date"
                name="dataFimVigencia"
                value={formData.dataFimVigencia}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Linha 4: Responsável Legal & Cargo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome do Responsável Legal (Assinante) *
              </label>
              <input
                type="text"
                name="nomeContato"
                value={formData.nomeContato}
                onChange={handleChange}
                placeholder="Ex: Carlos Eduardo da Silva"
                className={`w-full px-4 py-2.5 text-xs font-semibold border rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                  errors.nomeContato ? "border-rose-300 bg-rose-50/50" : "border-slate-200"
                }`}
              />
              {errors.nomeContato && <p className="text-xs text-rose-600 mt-1">{errors.nomeContato}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cargo / Função
              </label>
              <input
                type="text"
                name="cargoContato"
                value={formData.cargoContato}
                onChange={handleChange}
                placeholder="Ex: Diretor Executivo / CEO"
                className="w-full px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Linha 5: E-mail & Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                E-mail Corporativo Oficial *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contato@empresa.com.br"
                className={`w-full px-4 py-2.5 text-xs font-semibold border rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                  errors.email ? "border-rose-300 bg-rose-50/50" : "border-slate-200"
                }`}
              />
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Telefone / WhatsApp *
              </label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(49) 99999-0000"
                className={`w-full px-4 py-2.5 text-xs font-semibold border rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                  errors.telefone ? "border-rose-300 bg-rose-50/50" : "border-slate-200"
                }`}
              />
              {errors.telefone && <p className="text-xs text-rose-600 mt-1">{errors.telefone}</p>}
            </div>
          </div>

          {/* Linha 6: Endereço Completo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Endereço Completo da Empresa *
            </label>
            <input
              type="text"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              placeholder="Rua, número, complemento, bairro, cidade - UF e CEP"
              className={`w-full px-4 py-2.5 text-xs font-semibold border rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                errors.endereco ? "border-rose-300 bg-rose-50/50" : "border-slate-200"
              }`}
            />
            {errors.endereco && <p className="text-xs text-rose-600 mt-1">{errors.endereco}</p>}
          </div>

          {/* Linha 7: Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Observações Específicas
            </label>
            <textarea
              name="observacoes"
              rows={3}
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Necessidades especiais de laboratório, especificidades da minuta, etc."
              className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Link
              href="/empresas"
              className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Cadastrando...</span>
                </>
              ) : (
                <span>Salvar e Iniciar Tramitação</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
