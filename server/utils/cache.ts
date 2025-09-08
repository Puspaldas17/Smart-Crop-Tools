type Entry<T> = { value: T; expires: number };
const store = new Map<string, Entry<any>>();

export function getCache<T>(key: string): T | null {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() > e.expires) {
    store.delete(key);
    return null;
  }
  return e.value as T;
}

export function setCache<T>(key: string, value: T, ttlMs: number) {
  store.set(key, { value, expires: Date.now() + ttlMs });
}

export function makeKey(parts: (string | number | undefined | null)[]) {
  return parts.map((p) => String(p ?? "")).join("|");
}
