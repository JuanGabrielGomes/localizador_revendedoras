/**
 * Geocodifica as 200 revendedoras do CSV uma única vez (build-time) e grava o
 * resultado em data/revendedoras.json. Isso evita depender do Nominatim (rate
 * limit de 1 req/s) em tempo de execução para os dados estáticos — só o endereço
 * digitado pelo usuário é geocodificado em runtime (ver lib/geocoding.ts).
 *
 * Estratégia de fallback por linha: tenta o endereço completo (rua + número +
 * bairro + cidade + UF) e, se o Nominatim não encontrar, recua para bairro +
 * cidade + UF e depois só cidade + UF, marcando a precisão do resultado.
 *
 * Uso: npm run geocode-seed
 * Para testar com poucas linhas: GEOCODE_LIMIT=5 npm run geocode-seed
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { geocodeAddress } from "../lib/geocoding";
import type { GeocodePrecision, Revendedora, RevendedoraStatus } from "../lib/types";

interface RawRow {
  id: number;
  nome: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  status: RevendedoraStatus;
}

function parseCsv(content: string): RawRow[] {
  const [headerLine, ...lines] = content.trim().split(/\r?\n/);
  const columns = headerLine.split(";");

  return lines
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const values = line.split(";");
      const row = Object.fromEntries(
        columns.map((col, i) => [col, values[i]?.trim() ?? ""]),
      );
      return {
        id: Number(row.id),
        nome: row.nome_revendedora,
        rua: row.rua,
        numero: row.numero,
        bairro: row.bairro,
        cidade: row.cidade,
        estado: row.estado,
        cep: row.cep,
        status: row.status as RevendedoraStatus,
      };
    });
}

async function geocodeRow(
  row: RawRow,
): Promise<{ lat: number; lng: number; precision: GeocodePrecision }> {
  const attempts: Array<{ query: string; precision: GeocodePrecision }> = [
    {
      query: `${row.rua}, ${row.numero}, ${row.bairro}, ${row.cidade}, ${row.estado}, Brazil`,
      precision: "exact",
    },
    {
      query: `${row.bairro}, ${row.cidade}, ${row.estado}, Brazil`,
      precision: "approximate",
    },
    {
      query: `${row.cidade}, ${row.estado}, Brazil`,
      precision: "approximate",
    },
  ];

  for (const attempt of attempts) {
    const result = await geocodeAddress(attempt.query);
    if (result) {
      return { lat: result.lat, lng: result.lng, precision: attempt.precision };
    }
  }

  return { lat: 0, lng: 0, precision: "failed" };
}

async function main() {
  const inputPath = resolve(__dirname, "../data/revendedoras-raw.csv");
  const outputPath = resolve(__dirname, "../data/revendedoras.json");

  const rows = parseCsv(readFileSync(inputPath, "utf-8"));
  const limit = process.env.GEOCODE_LIMIT
    ? Number(process.env.GEOCODE_LIMIT)
    : rows.length;
  const rowsToProcess = rows.slice(0, limit);

  const revendedoras: Revendedora[] = [];
  const failures: number[] = [];

  for (const [index, row] of rowsToProcess.entries()) {
    const { lat, lng, precision } = await geocodeRow(row);
    if (precision === "failed") failures.push(row.id);

    revendedoras.push({
      id: row.id,
      nome: row.nome,
      rua: row.rua,
      numero: row.numero,
      bairro: row.bairro,
      cidade: row.cidade,
      estado: row.estado,
      cep: row.cep,
      status: row.status,
      lat,
      lng,
      geocodePrecision: precision,
    });

    console.log(
      `[${index + 1}/${rowsToProcess.length}] #${row.id} ${row.nome} -> ${precision} (${lat}, ${lng})`,
    );
  }

  writeFileSync(outputPath, JSON.stringify(revendedoras, null, 2), "utf-8");
  console.log(`\nGravado ${revendedoras.length} registros em ${outputPath}`);
  if (failures.length > 0) {
    console.warn(`Falha ao geocodificar ${failures.length} registros: ${failures.join(", ")}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
