"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { SearchForm } from "@/components/SearchForm";
import { ResultsList } from "@/components/ResultsList";
import type { SearchInput, SearchResponse } from "@/lib/types";

const MapView = dynamic(
  () => import("@/components/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
        Carregando mapa...
      </div>
    ),
  },
);

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);

  async function handleSearch(input: SearchInput) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Erro ao buscar revendedoras.");
        return;
      }

      setResult(data as SearchResponse);
    } catch {
      setError(
        "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Localizador de Revendedoras
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Informe seu CEP, ou rua e bairro, para encontrar as revendedoras
            mais próximas.
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            Buscando revendedoras mais próximas...
          </div>
        )}

        {!isLoading && result && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <p className="text-sm text-slate-600">
                Endereço encontrado:{" "}
                <span className="font-medium text-slate-900">
                  {result.enderecoResolvido.label}
                </span>
              </p>
              <ResultsList resultados={result.resultados} />
            </div>

            <div className="h-[400px] overflow-hidden rounded-xl border border-slate-200 shadow-sm lg:h-auto lg:min-h-[500px]">
              <MapView
                userLocation={result.enderecoResolvido}
                revendedoras={result.resultados}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
