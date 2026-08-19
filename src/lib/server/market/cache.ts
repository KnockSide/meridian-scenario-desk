type Entry<T> = { value: T; exp: number };

const mem = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = mem.get(key);
  if (hit && hit.exp > now) return Promise.resolve(hit.value as T);
  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;
  const p = fn()
    .then((value) => {
      mem.set(key, { value, exp: Date.now() + ttlMs });
      inflight.delete(key);
      return value;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });
  inflight.set(key, p);
  return p;
}

export function cacheGet<T>(key: string): T | undefined {
  const hit = mem.get(key);
  if (!hit || hit.exp <= Date.now()) return undefined;
  return hit.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number) {
  mem.set(key, { value, exp: Date.now() + ttlMs });
}
