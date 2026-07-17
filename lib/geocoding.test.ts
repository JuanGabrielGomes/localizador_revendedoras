import { afterEach, describe, expect, it, vi } from "vitest";
import { buildAddressQuery, geocodeAddress } from "./geocoding";

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
  } as Response;
}

describe("buildAddressQuery", () => {
  it("monta a query com todos os campos preenchidos", () => {
    const query = buildAddressQuery({
      rua: "Rua Padre Anchieta",
      numero: "2392",
      bairro: "Bigorrilho",
      cidade: "Curitiba",
      estado: "PR",
    });
    expect(query).toBe(
      "Rua Padre Anchieta, 2392, Bigorrilho, Curitiba, PR, Brazil",
    );
  });

  it("ignora campos ausentes sem deixar vírgulas soltas", () => {
    const query = buildAddressQuery({
      bairro: "Centro",
      cidade: "Curitiba",
    });
    expect(query).toBe("Centro, Curitiba, Brazil");
  });

  it("ignora strings vazias ou só com espaços", () => {
    const query = buildAddressQuery({
      rua: "  ",
      bairro: "Centro",
      cidade: "Curitiba",
    });
    expect(query).toBe("Centro, Curitiba, Brazil");
  });

  it("retorna apenas 'Brazil' quando nenhum campo é informado", () => {
    expect(buildAddressQuery({})).toBe("Brazil");
  });
});

describe("geocodeAddress (fallback Nominatim -> Photon)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("retorna resultado do Nominatim quando a busca funciona", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse([
          { lat: "-25.43", lon: "-49.27", display_name: "Endereço Teste, Curitiba" },
        ]),
      ),
    );

    const result = await geocodeAddress("endereco-teste-nominatim-ok");
    expect(result).toEqual({
      lat: -25.43,
      lng: -49.27,
      label: "Endereço Teste, Curitiba",
      provider: "nominatim",
    });
  });

  it("recorre ao Photon quando o Nominatim lança erro de rede", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        if (input.toString().includes("nominatim")) {
          throw new Error("network down");
        }
        return jsonResponse({
          features: [
            {
              geometry: { coordinates: [-49.3, -25.44] },
              properties: { name: "Local Teste", city: "Curitiba", country: "Brasil" },
            },
          ],
        });
      }),
    );

    const result = await geocodeAddress("endereco-teste-fallback-erro");
    expect(result?.provider).toBe("photon");
    expect(result?.lat).toBe(-25.44);
    expect(result?.lng).toBe(-49.3);
  });

  it("recorre ao Photon quando o Nominatim não encontra nada", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        if (input.toString().includes("nominatim")) {
          return jsonResponse([]);
        }
        return jsonResponse({
          features: [
            {
              geometry: { coordinates: [-49.1, -25.1] },
              properties: { name: "Outro Local" },
            },
          ],
        });
      }),
    );

    const result = await geocodeAddress("endereco-teste-fallback-vazio");
    expect(result?.provider).toBe("photon");
  });

  it("retorna null quando os dois geocoders falham", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse([])),
    );

    const result = await geocodeAddress("endereco-teste-tudo-falha");
    expect(result).toBeNull();
  });

  it("usa cache e não repete a chamada de rede pra mesma query", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse([{ lat: "-25.0", lon: "-49.0", display_name: "Cache Teste" }]),
    );
    vi.stubGlobal("fetch", fetchMock);

    const query = "endereco-teste-cache-unico";
    await geocodeAddress(query);
    await geocodeAddress(query);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
