import { describe, expect, it } from "vitest";
import { haversineDistanceKm } from "./distance";

describe("haversineDistanceKm", () => {
  it("retorna 0 para o mesmo ponto", () => {
    expect(haversineDistanceKm(-25.4284, -49.2733, -25.4284, -49.2733)).toBe(0);
  });

  it("calcula a distância entre Curitiba e Londrina (~300km em linha reta)", () => {
    const curitiba = { lat: -25.4284, lng: -49.2733 };
    const londrina = { lat: -23.3103, lng: -51.1628 };
    const distancia = haversineDistanceKm(
      curitiba.lat,
      curitiba.lng,
      londrina.lat,
      londrina.lng,
    );
    expect(distancia).toBeGreaterThan(295);
    expect(distancia).toBeLessThan(310);
  });

  it("é simétrica (distância de A->B == B->A)", () => {
    const a = { lat: -25.43, lng: -49.27 };
    const b = { lat: -23.31, lng: -51.16 };
    const ab = haversineDistanceKm(a.lat, a.lng, b.lat, b.lng);
    const ba = haversineDistanceKm(b.lat, b.lng, a.lat, a.lng);
    expect(ab).toBeCloseTo(ba, 10);
  });

  it("calcula corretamente distância curta (~1km) entre pontos próximos em Curitiba", () => {
    const pontoA = { lat: -25.4284, lng: -49.2733 };
    const pontoB = { lat: -25.4374, lng: -49.2733 };
    const distancia = haversineDistanceKm(
      pontoA.lat,
      pontoA.lng,
      pontoB.lat,
      pontoB.lng,
    );
    expect(distancia).toBeGreaterThan(0.9);
    expect(distancia).toBeLessThan(1.1);
  });
});
