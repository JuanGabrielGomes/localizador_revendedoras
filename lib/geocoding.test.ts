import { describe, expect, it } from "vitest";
import { buildAddressQuery } from "./geocoding";

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
