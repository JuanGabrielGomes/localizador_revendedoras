import type { SearchInput, SearchResponse } from "@localizador/shared";

/**
 * O app mobile não duplica geocoding/distância/dados — ele é um cliente fino
 * da mesma API do app web (app/api/search/route.ts no projeto raiz), já
 * publicada. Sobrescrevível via variável de ambiente EXPO_PUBLIC_API_BASE_URL
 * (ex: para apontar para localhost durante o desenvolvimento).
 */
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "https://localizador-revendedoras.vercel.app";

export class SearchError extends Error {}

export async function searchRevendedoras(
  input: SearchInput,
): Promise<SearchResponse> {
  const response = await fetch(`${API_BASE_URL}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new SearchError(data.error ?? "Erro ao buscar revendedoras.");
  }

  return data as SearchResponse;
}
