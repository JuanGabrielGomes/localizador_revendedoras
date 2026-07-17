/**
 * Rate limiter best-effort em memória (por instância). Em serverless (Vercel)
 * isso não é distribuído nem sobrevive a cold starts — não substitui um
 * limiter real (ex: Upstash Redis) num cenário de produção com tráfego alto,
 * mas já evita abuso trivial de um único cliente sem exigir infraestrutura
 * paga adicional.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const MAX_TRACKED_KEYS = 5000;

const requestLog = new Map<string, number[]>();

export function isRateLimited(
  key: string,
  now: number = Date.now(),
): boolean {
  const timestamps = (requestLog.get(key) ?? []).filter(
    (t) => now - t < WINDOW_MS,
  );
  timestamps.push(now);
  requestLog.set(key, timestamps);

  if (requestLog.size > MAX_TRACKED_KEYS) {
    for (const [trackedKey, trackedTimestamps] of requestLog) {
      if (trackedTimestamps.every((t) => now - t >= WINDOW_MS)) {
        requestLog.delete(trackedKey);
      }
    }
  }

  return timestamps.length > MAX_REQUESTS_PER_WINDOW;
}

export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}
