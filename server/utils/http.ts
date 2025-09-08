export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 7000,
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function retry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 300,
) {
  let lastErr: any = null;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < attempts - 1)
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}
