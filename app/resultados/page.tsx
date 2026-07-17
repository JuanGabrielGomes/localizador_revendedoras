"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import { ResultsList } from "@/components/ResultsList";
import type { SearchInput, SearchResponse } from "@/lib/types";

const MapView = dynamic(
  () => import("@/components/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-sm text-foreground/40">
        Carregando mapa...
      </div>
    ),
  },
);

function ResultadosContent() {
  const searchParams = useSearchParams();
  const paramsString = searchParams.toString();

  const input: SearchInput = useMemo(
    () => ({
      cep: searchParams.get("cep") ?? undefined,
      rua: searchParams.get("rua") ?? undefined,
      numero: searchParams.get("numero") ?? undefined,
      bairro: searchParams.get("bairro") ?? undefined,
      cidade: searchParams.get("cidade") ?? undefined,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paramsString],
  );

  const hasQuery = Boolean(input.cep || input.rua || input.bairro);

  const [isLoading, setIsLoading] = useState(hasQuery);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);

  useEffect(() => {
    if (!hasQuery) return;

    let cancelled = false;

    async function run() {
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
        if (cancelled) return;

        if (!response.ok) {
          setError(data.error ?? "Erro ao buscar revendedoras.");
          return;
        }
        setResult(data as SearchResponse);
      } catch {
        if (!cancelled) {
          setError(
            "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [input, hasQuery]);

  return (
    <div className="flex flex-1 flex-col">
      <BrandHeader backHref="/" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        {!hasQuery && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-onyx-line bg-onyx-soft/60 p-10 text-center">
            <p className="text-foreground/70">
              Nenhum endereço foi informado para a busca.
            </p>
            <Link
              href="/"
              className="rounded-md bg-gold px-5 py-2 text-sm font-semibold text-onyx transition hover:bg-gold-light"
            >
              Voltar para a busca
            </Link>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-3 text-sm text-foreground/60">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-onyx-line border-t-gold" />
            Buscando revendedoras mais próximas...
          </div>
        )}

        {!isLoading && error && (
          <p
            role="alert"
            className="rounded-lg border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        {!isLoading && result && (
          <div className="flex flex-col gap-6">
            <p className="text-sm text-foreground/60">
              Endereço encontrado:{" "}
              <span className="font-medium text-gold-light">
                {result.enderecoResolvido.label}
              </span>
            </p>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ResultsList resultados={result.resultados} />

              <div className="h-[400px] overflow-hidden rounded-2xl border border-gold/40 shadow-[0_0_0_1px_rgba(201,162,39,0.15)] lg:h-auto lg:min-h-[500px]">
                <MapView
                  userLocation={result.enderecoResolvido}
                  revendedoras={result.resultados}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ResultadosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 flex-col">
          <BrandHeader backHref="/" />
          <div className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-8 text-sm text-foreground/60 sm:px-6">
            Carregando...
          </div>
        </div>
      }
    >
      <ResultadosContent />
    </Suspense>
  );
}
