import type { RevendedoraComDistancia } from "@/lib/types";

function buildRouteUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

interface ResellerCardProps {
  revendedora: RevendedoraComDistancia;
  posicao: number;
}

export function ResellerCard({ revendedora, posicao }: ResellerCardProps) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-xl border border-onyx-line bg-onyx-soft p-4 shadow-[0_0_0_1px_rgba(217,164,65,0.06)] transition hover:border-gold/40">
      <div className="flex gap-3">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-semibold text-onyx"
        >
          {posicao}
        </span>
        <div>
          <p className="font-serif text-base text-foreground">
            {revendedora.nome}
          </p>
          <p className="text-sm text-foreground/60">
            {revendedora.rua}, {revendedora.numero} - {revendedora.bairro},{" "}
            {revendedora.cidade}/{revendedora.estado}
          </p>
          <p className="text-sm text-foreground/60">CEP {revendedora.cep}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="whitespace-nowrap text-sm font-semibold text-gold-light">
          {revendedora.distanciaKm.toFixed(1)} km
        </span>
        <a
          href={buildRouteUrl(revendedora.lat, revendedora.lng)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ver rota até ${revendedora.nome} no Google Maps (abre em nova aba)`}
          className="whitespace-nowrap rounded-full border border-gold/50 px-3 py-1.5 text-xs font-medium text-gold-light transition hover:border-gold hover:bg-gold/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Ver rota
        </a>
      </div>
    </li>
  );
}
