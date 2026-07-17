"use client";

import { useState, type FormEvent } from "react";
import type { SearchInput } from "@/lib/types";

interface SearchFormProps {
  onSubmit: (input: SearchInput) => void;
  initialValues?: SearchInput;
}

const inputClass =
  "rounded-md border border-onyx-line bg-onyx-soft px-3 py-2 text-sm text-foreground placeholder:text-foreground/35 outline-none transition focus:border-gold focus:ring-1 focus:ring-gold";

const labelClass = "text-sm font-medium text-foreground/80";

export function SearchForm({ onSubmit, initialValues }: SearchFormProps) {
  const [cep, setCep] = useState(initialValues?.cep ?? "");
  const [rua, setRua] = useState(initialValues?.rua ?? "");
  const [numero, setNumero] = useState(initialValues?.numero ?? "");
  const [bairro, setBairro] = useState(initialValues?.bairro ?? "");
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

    onSubmit({
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
    onSubmit(input);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-onyx-line bg-onyx-soft/60 p-6 shadow-[0_0_0_1px_rgba(201,162,39,0.08)] backdrop-blur sm:p-8"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cep" className={labelClass}>
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
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rua" className={labelClass}>
            Rua ou avenida
          </label>
          <input
            id="rua"
            name="rua"
            type="text"
            placeholder="Ex: Rua Padre Anchieta"
            value={rua}
            onChange={(e) => setRua(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="numero" className={labelClass}>
            Número
          </label>
          <input
            id="numero"
            name="numero"
            type="text"
            placeholder="Ex: 123"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="bairro" className={labelClass}>
            Bairro
          </label>
          <input
            id="bairro"
            name="bairro"
            type="text"
            placeholder="Ex: Bigorrilho"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {validationError && (
        <p className="text-sm text-red-400" role="alert">
          {validationError}
        </p>
      )}

      <p className="text-xs text-foreground/50">
        Preencha o CEP, ou rua e/ou bairro (quanto mais campos, mais precisa a
        busca).
      </p>

      <div className="flex flex-wrap gap-2">
        {exemplos.map((exemplo) => (
          <button
            key={exemplo.label}
            type="button"
            onClick={() => handleExemploClick(exemplo.input)}
            className="rounded-full border border-onyx-line bg-onyx px-3 py-1 text-xs text-foreground/60 transition hover:border-gold hover:text-gold-light"
          >
            {exemplo.label}
          </button>
        ))}
      </div>

      <button
        type="submit"
        className="self-start rounded-md bg-gold px-6 py-2.5 text-sm font-semibold text-onyx transition hover:bg-gold-light"
      >
        Buscar revendedoras
      </button>
    </form>
  );
}
