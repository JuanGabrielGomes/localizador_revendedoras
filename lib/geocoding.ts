const USER_AGENT =
  "localizador-revendedoras/1.0 (teste tecnico; contato: juangabrielgomes.dev@gmail.com)";

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

export interface GeocodeResult {
  lat: number;
  lng: number;
  label: string;
}

interface NominatimResponseItem {
  lat: string;
  lon: string;
  display_name: string;
}

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

export async function geocodeAddress(
  query: string,
): Promise<GeocodeResult | null> {
  const cacheKey = query.trim().toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) ?? null;
  }

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
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar Nominatim (status ${response.status})`);
  }

  const results = (await response.json()) as NominatimResponseItem[];
  if (results.length === 0) {
    geocodeCache.set(cacheKey, null);
    return null;
  }

  const [first] = results;
  const result: GeocodeResult = {
    lat: Number.parseFloat(first.lat),
    lng: Number.parseFloat(first.lon),
    label: first.display_name,
  };
  geocodeCache.set(cacheKey, result);
  return result;
}
