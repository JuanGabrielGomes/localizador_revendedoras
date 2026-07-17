import { describe, expect, it } from "vitest";
import { isRateLimited } from "./rateLimit";

describe("isRateLimited", () => {
  it("permite as primeiras requisições dentro do limite", () => {
    const key = `client-${Math.random()}`;
    const now = 1_000_000;
    for (let i = 0; i < 20; i++) {
      expect(isRateLimited(key, now)).toBe(false);
    }
  });

  it("bloqueia a partir da 21ª requisição na mesma janela", () => {
    const key = `client-${Math.random()}`;
    const now = 2_000_000;
    for (let i = 0; i < 20; i++) {
      isRateLimited(key, now);
    }
    expect(isRateLimited(key, now)).toBe(true);
  });

  it("libera novamente depois que a janela de 60s expira", () => {
    const key = `client-${Math.random()}`;
    const start = 3_000_000;
    for (let i = 0; i < 21; i++) {
      isRateLimited(key, start);
    }
    expect(isRateLimited(key, start)).toBe(true);

    const afterWindow = start + 61_000;
    expect(isRateLimited(key, afterWindow)).toBe(false);
  });

  it("rastreia chaves (IPs) diferentes de forma independente", () => {
    const now = 4_000_000;
    const keyA = `client-a-${Math.random()}`;
    const keyB = `client-b-${Math.random()}`;

    for (let i = 0; i < 21; i++) {
      isRateLimited(keyA, now);
    }
    expect(isRateLimited(keyA, now)).toBe(true);
    expect(isRateLimited(keyB, now)).toBe(false);
  });
});
