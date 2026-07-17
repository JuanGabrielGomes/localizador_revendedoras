"use client";

import { useState, type FormEvent } from "react";
import type { SearchInput } from "@/lib/types";

interface SearchFormProps {
  onSearch: (input: SearchInput) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedCep = cep.trim();
    const trimmedRua = rua.trim();
    const trimmedBairro = bairro.trim();

    if (!trimmedCep && !trimmedRua && !trimmedBairro) {
      setValidationError("Informe ao menos um CEP, rua ou bairro.");
      return;
    }
    setValidationError(null);

    onSearch({
      cep: trimmedCep || undefined,
      rua: trimmedRua || undefined,
      numero: numero.trim() || undefined,
      bairro: trimmedBairro || undefined,
    });
  }

  const exemplos: Array<{ label: string; input: SearchInput }> = [
    { label: "CEP 80730-000 (Bigorrilho, Curitiba)", input: { cep: "80730-000" } },
    { label: "Centro, Curitiba", input: { bairro: "Centro", cidade: "Curitiba" } },
    { label: "Zona 01, Maringá", input: { bairro: "Zona 01", cidade: "Maringá" } },
  ];

  function handleExemploClick(input: SearchInput) {
    setCep(input.cep ?? "");
    setRua(input.rua ?? "");
    setNumero(input.numero ?? "");
    setBairro(input.bairro ?? "");
    setValidationError(null);
    onSearch(input);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
        <div className="flex flex-col gap-1">
          <label htmlFor="cep" className="text-sm font-medium text-slate-700">
            CEP
          </label>
          <input
            id="cep"
            name="cep"
            type="text"
            inputMode="numeric"
            placeholder="00000-000"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="rua" className="text-sm font-medium text-slate-700">
            Rua ou avenida
          </label>
          <input
            id="rua"
            name="rua"
            type="text"
            placeholder="Ex: Rua Padre Anchieta"
            value={rua}
            onChange={(e) => setRua(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
        <div className="flex flex-col gap-1">
          <label htmlFor="numero" className="text-sm font-medium text-slate-700">
            Número
          </label>
          <input
            id="numero"
            name="numero"
            type="text"
            placeholder="Ex: 123"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="bairro" className="text-sm font-medium text-slate-700">
            Bairro
          </label>
          <input
            id="bairro"
            name="bairro"
            type="text"
            placeholder="Ex: Bigorrilho"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}

      <p className="text-xs text-slate-500">
        Preencha o CEP, ou rua e/ou bairro (quanto mais campos, mais precisa a
        busca).
      </p>

      <div className="flex flex-wrap gap-2">
        {exemplos.map((exemplo) => (
          <button
            key={exemplo.label}
            type="button"
            disabled={isLoading}
            onClick={() => handleExemploClick(exemplo.input)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exemplo.label}
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="self-start rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Buscando..." : "Buscar revendedoras"}
      </button>
    </form>
  );
}
