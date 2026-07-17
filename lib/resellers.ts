import { readFileSync } from "node:fs";
import path from "node:path";
import { haversineDistanceKm } from "./distance";
import { RevendedoraSchema, type Revendedora, type RevendedoraComDistancia } from "./types";

let cachedRevendedoras: Revendedora[] | null = null;

function loadRevendedoras(): Revendedora[] {
  if (cachedRevendedoras) return cachedRevendedoras;

  const filePath = path.join(process.cwd(), "data", "revendedoras.json");
  const raw = JSON.parse(readFileSync(filePath, "utf-8"));
  cachedRevendedoras = RevendedoraSchema.array().parse(raw);
  return cachedRevendedoras;
}

export interface NearestOptions {
  limit?: number;
}

export function findNearestRevendedoras(
  origemLat: number,
  origemLng: number,
  options: NearestOptions = {},
): RevendedoraComDistancia[] {
  const { limit = 10 } = options;

  return loadRevendedoras()
    .filter((r) => r.status === "Ativa" && r.geocodePrecision !== "failed")
    .map((r) => ({
      ...r,
      distanciaKm: haversineDistanceKm(origemLat, origemLng, r.lat, r.lng),
    }))
    .sort((a, b) => a.distanciaKm - b.distanciaKm)
    .slice(0, limit);
}
