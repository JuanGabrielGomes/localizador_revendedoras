const USER_AGENT =
  "localizador-revendedoras/1.0 (teste tecnico; contato: juangabrielgomes.dev@gmail.com)";

/**
 * TTL do cache de geocodificação. Endereço -> coordenada praticamente nunca
 * muda, então um TTL longo é seguro. Usar `next: { revalidate }` em vez de
 * `cache: "force-cache"` puro faz o Next.js guardar a resposta no Data
 * Cache — que, na Vercel, é persistente entre invocações/cold starts (não é
 * só memória do processo), sem precisar de nenhuma infraestrutura extra.
 * Fora do runtime do Next (ex: scripts/geocode-seed.ts, rodado via `tsx`
 * puro), essa opção é simplesmente ignorada pelo fetch nativo — inofensivo.
 */
const GEOCODE_CACHE_REVALIDATE_SECONDS = 60 * 60 * 24 * 30; // 30 dias

export interface ViaCepResult {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export class ViaCepNotFoundError extends Error {
  constructor(cep: string) {
    super(`CEP não encontrado: ${cep}`);
    this.name = "ViaCepNotFoundError";
  }
}

export async function lookupCep(cep: string): Promise<ViaCepResult> {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length !== 8) {
    throw new ViaCepNotFoundError(cep);
  }

  const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
    headers: { Accept: "application/json" },
    next: { revalidate: GEOCODE_CACHE_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar ViaCEP (status ${response.status})`);
  }

  const data = (await response.json()) as ViaCepResult;
  if (data.erro) {
    throw new ViaCepNotFoundError(cep);
  }

  return data;
}

export interface AddressQueryInput {
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export function buildAddressQuery(input: AddressQueryInput): string {
  return [input.rua, input.numero, input.bairro, input.cidade, input.estado, "Brazil"]
    .filter((part) => Boolean(part && part.trim()))
    .join(", ");
}

export type GeocodeProvider = "nominatim" | "photon";

export interface GeocodeResult {
  lat: number;
  lng: number;
  label: string;
  provider: GeocodeProvider;
}

interface NominatimResponseItem {
  lat: string;
  lon: string;
  display_name: string;
}

/** Cache em memória do processo — atalho rápido além do Data Cache do fetch,
 * e o único jeito de cachear também o resultado "não encontrado" (o Data
 * Cache do Next só guarda respostas HTTP, não essa decisão derivada). */
const geocodeCache = new Map<string, GeocodeResult | null>();

/** Nominatim exige no máx. 1 req/s (política de uso). */
let lastNominatimRequestAt = 0;
const MIN_INTERVAL_MS = 1100;

async function throttleNominatim(): Promise<void> {
  const elapsed = Date.now() - lastNominatimRequestAt;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_INTERVAL_MS - elapsed),
    );
  }
  lastNominatimRequestAt = Date.now();
}

async function searchNominatim(
  query: string,
): Promise<Omit<GeocodeResult, "provider"> | null> {
  await throttleNominatim();

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "br");

  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
    next: { revalidate: GEOCODE_CACHE_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar Nominatim (status ${response.status})`);
  }

  const results = (await response.json()) as NominatimResponseItem[];
  if (results.length === 0) return null;

  const [first] = results;
  return {
    lat: Number.parseFloat(first.lat),
    lng: Number.parseFloat(first.lon),
    label: first.display_name,
  };
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: Record<string, string | undefined>;
}

interface PhotonResponse {
  features: PhotonFeature[];
}

/**
 * Geocoder de fallback: Photon (komoot), também gratuito e sem API key,
 * também baseado em dados OpenStreetMap — mas com índice/engine de busca
 * independente do Nominatim. Usado só quando o Nominatim falha (erro de
 * rede/indisponibilidade) ou não encontra nada, para não deixar a busca
 * inteira depender de um único provedor.
 */
async function searchPhoton(
  query: string,
): Promise<Omit<GeocodeResult, "provider"> | null> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");
  url.searchParams.set("lang", "pt");

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    next: { revalidate: GEOCODE_CACHE_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar Photon (status ${response.status})`);
  }

  const data = (await response.json()) as PhotonResponse;
  const feature = data.features?.[0];
  if (!feature) return null;

  const [lng, lat] = feature.geometry.coordinates;
  const props = feature.properties ?? {};
  const label =
    [props.name, props.street, props.city, props.state, props.country]
      .filter(Boolean)
      .join(", ") || query;

  return { lat, lng, label };
}

export async function geocodeAddress(
  query: string,
): Promise<GeocodeResult | null> {
  const cacheKey = query.trim().toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) ?? null;
  }

  let result: (Omit<GeocodeResult, "provider"> & { provider: GeocodeProvider }) | null =
    null;

  try {
    const nominatimResult = await searchNominatim(query);
    if (nominatimResult) result = { ...nominatimResult, provider: "nominatim" };
  } catch (error) {
    console.error(
      "Nominatim indisponível, tentando geocoder alternativo (Photon):",
      error,
    );
  }

  if (!result) {
    try {
      const photonResult = await searchPhoton(query);
      if (photonResult) result = { ...photonResult, provider: "photon" };
    } catch (error) {
      console.error("Geocoder alternativo (Photon) também falhou:", error);
    }
  }

  geocodeCache.set(cacheKey, result);
  return result;
}
