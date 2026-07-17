import { describe, expect, it } from "vitest";
import { SearchInputSchema } from "./types";

describe("SearchInputSchema", () => {
  it("aceita busca só com CEP", () => {
    expect(SearchInputSchema.safeParse({ cep: "80730-000" }).success).toBe(true);
  });

  it("aceita busca só com bairro", () => {
    expect(
      SearchInputSchema.safeParse({ bairro: "Centro", cidade: "Curitiba" })
        .success,
    ).toBe(true);
  });

  it("aceita busca só com rua", () => {
    expect(
      SearchInputSchema.safeParse({ rua: "Rua XV de Novembro" }).success,
    ).toBe(true);
  });

  it("rejeita entrada totalmente vazia", () => {
    const result = SearchInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejeita entrada com apenas número (sem CEP/rua/bairro)", () => {
    const result = SearchInputSchema.safeParse({ numero: "123" });
    expect(result.success).toBe(false);
  });
});
