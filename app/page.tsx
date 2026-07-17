"use client";

import { useRouter } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { SearchForm } from "@/components/SearchForm";
import type { SearchInput } from "@/lib/types";

function buildResultsHref(input: SearchInput): string {
  const params = new URLSearchParams();
  if (input.cep) params.set("cep", input.cep);
  if (input.rua) params.set("rua", input.rua);
  if (input.numero) params.set("numero", input.numero);
  if (input.bairro) params.set("bairro", input.bairro);
  if (input.cidade) params.set("cidade", input.cidade);
  return `/resultados?${params.toString()}`;
}

export default function Home() {
  const router = useRouter();

  function handleSubmit(input: SearchInput) {
    router.push(buildResultsHref(input));
  }

  return (
    <div className="flex flex-1 flex-col">
      <BrandHeader />

      <main className="relative flex flex-1 flex-col overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,162,39,0.12),_transparent_60%)]"
        />

        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-10 px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex max-w-2xl flex-col items-center gap-5 text-center">
            <span className="flex items-center gap-3 text-xs font-medium tracking-[0.3em] text-gold uppercase">
              <span className="h-px w-8 bg-gold/50" />
              Rede de Revendedoras
              <span className="h-px w-8 bg-gold/50" />
            </span>
            <h1 className="max-w-xl text-3xl leading-tight font-extrabold text-foreground sm:text-5xl">
              Encontre a revendedora{" "}
              <span className="text-gold">mais próxima de você</span>
            </h1>
            <p className="max-w-xl text-sm text-foreground/60 sm:text-base">
              Informe seu CEP, ou rua e bairro, e veja as revendedoras
              disponíveis na sua região, ordenadas por distância, com mapa e
              rota até cada uma delas.
            </p>
          </div>

          <div className="w-full max-w-2xl">
            <SearchForm onSubmit={handleSubmit} />
          </div>
        </div>
      </main>

      <footer className="border-t border-onyx-line px-4 py-6 text-center text-xs text-foreground/40 sm:px-6">
        Localizador de Revendedoras — projeto desenvolvido como teste técnico,
        com identidade visual inspirada na Sorelly Joias.
      </footer>
    </div>
  );
}
