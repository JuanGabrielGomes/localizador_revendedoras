import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  buildAddressQuery,
  geocodeAddress,
  lookupCep,
  ViaCepNotFoundError,
} from "@/lib/geocoding";
import { findNearestRevendedoras } from "@/lib/resellers";
import { SearchInputSchema, type SearchResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido, esperado JSON." },
      { status: 400 },
    );
  }

  const parsed = SearchInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Entrada inválida." },
      { status: 400 },
    );
  }
  const input = parsed.data;

  try {
    let rua = input.rua;
    let bairro = input.bairro;
    let cidade = input.cidade;
    let estado: string | undefined;

    if (input.cep) {
      const viaCep = await lookupCep(input.cep);
      rua = rua || viaCep.logradouro;
      bairro = bairro || viaCep.bairro;
      cidade = cidade || viaCep.localidade;
      estado = viaCep.uf;
    }

    const fullQuery = buildAddressQuery({
      rua,
      numero: input.numero,
      bairro,
      cidade,
      estado,
    });

    let geocoded = await geocodeAddress(fullQuery);

    if (!geocoded && bairro) {
      const fallbackQuery = buildAddressQuery({ bairro, cidade, estado });
      geocoded = await geocodeAddress(fallbackQuery);
    }

    if (!geocoded) {
      return NextResponse.json(
        {
          error:
            "Não foi possível localizar esse endereço. Tente simplificar (ex: apenas bairro e cidade) ou confira o CEP.",
        },
        { status: 422 },
      );
    }

    const resultados = findNearestRevendedoras(geocoded.lat, geocoded.lng, {
      limit: 10,
    });

    const response: SearchResponse = {
      enderecoResolvido: {
        label: geocoded.label,
        lat: geocoded.lat,
        lng: geocoded.lng,
      },
      resultados,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ViaCepNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Dados de revendedoras inválidos no servidor." },
        { status: 500 },
      );
    }
    console.error("Erro na busca de revendedoras:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar revendedoras. Tente novamente." },
      { status: 500 },
    );
  }
}
