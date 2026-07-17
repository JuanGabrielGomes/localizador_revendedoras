import type { RevendedoraComDistancia } from "@/lib/types";
import { ResellerCard } from "./ResellerCard";

interface ResultsListProps {
  resultados: RevendedoraComDistancia[];
}

export function ResultsList({ resultados }: ResultsListProps) {
  if (resultados.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gold/30 bg-onyx-soft/40 p-6 text-center text-foreground/60">
        Nenhuma revendedora ativa encontrada perto desse endereço.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {resultados.map((revendedora, index) => (
        <ResellerCard
          key={revendedora.id}
          revendedora={revendedora}
          posicao={index + 1}
        />
      ))}
    </ul>
  );
}
