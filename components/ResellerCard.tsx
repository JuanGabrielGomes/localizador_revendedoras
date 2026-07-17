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
    <li className="flex items-start justify-between gap-3 rounded-xl border border-cream-line bg-cream p-4 shadow-sm">
      <div className="flex gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-semibold text-onyx">
          {posicao}
        </span>
        <div>
          <p className="font-serif text-base text-onyx">{revendedora.nome}</p>
          <p className="text-sm text-onyx/70">
            {revendedora.rua}, {revendedora.numero} - {revendedora.bairro},{" "}
            {revendedora.cidade}/{revendedora.estado}
          </p>
          <p className="text-sm text-onyx/50">CEP {revendedora.cep}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="whitespace-nowrap text-sm font-semibold text-gold-dark">
          {revendedora.distanciaKm.toFixed(1)} km
        </span>
        <a
          href={buildRouteUrl(revendedora.lat, revendedora.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap rounded-full border border-gold/50 px-3 py-1.5 text-xs font-medium text-gold-dark transition hover:border-gold hover:bg-gold/10"
        >
          Ver rota
        </a>
      </div>
    </li>
  );
}
