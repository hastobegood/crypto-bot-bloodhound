import Keyv from 'keyv';

export class MemoryCache {
  private cache: Keyv;

  constructor(ttl?: number) {
    this.cache = new Keyv({ ttl: ttl });
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.cache.set(key, value);
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.cache.get(key);

    return value !== null && value !== undefined ? value : null;
  }
}
