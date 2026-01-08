export function nowMs() {
  return Date.now();
}

export function measure(fn) {
  const start = nowMs();
  const result = fn();
  const durationMs = nowMs() - start;
  return { result, durationMs };
}

export async function measureAsync(fn) {
  const start = nowMs();
  const result = await fn();
  const durationMs = nowMs() - start;
  return { result, durationMs };
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
