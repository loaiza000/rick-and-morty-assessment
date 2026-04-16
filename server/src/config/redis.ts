import { createClient, RedisClientType } from 'redis';

const DEFAULT_TTL = 3600; // 1 hour

export class CacheService {
  private client: RedisClientType;
  private connected = false;

  constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        reconnectStrategy: (retries: number) => Math.min(retries * 100, 5000),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    }) as RedisClientType;

    this.client.on('error', (err: Error) =>
      console.error('[Redis] Error:', err.message),
    );
    this.client.on('connect', () => console.log('[Redis] Connected'));
    this.client.on('ready', () => {
      this.connected = true;
      console.log('[Redis] Ready');
    });
    this.client.on('end', () => {
      this.connected = false;
      console.log('[Redis] Disconnected');
    });
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.disconnect();
    }
  }

  get isConnected(): boolean {
    return this.connected;
  }

  // ─── Core cache operations ──────────────────────────────────────────────

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      if (raw) {
        console.log(`[Cache] HIT  → ${key}`);
        return JSON.parse(raw) as T;
      }
      console.log(`[Cache] MISS → ${key}`);
      return null;
    } catch {
      console.error(`[Cache] Error reading key: ${key}`);
      return null;
    }
  }

  async set(key: string, data: unknown, ttl: number = DEFAULT_TTL): Promise<void> {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(data));
    } catch {
      console.error(`[Cache] Error writing key: ${key}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch {
      console.error(`[Cache] Error deleting key: ${key}`);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      let cursor = 0;
      do {
        const result = await this.client.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = result.cursor;
        if (result.keys.length > 0) {
          await this.client.del(result.keys);
        }
      } while (cursor !== 0);
    } catch {
      console.error(`[Cache] Error invalidating pattern: ${pattern}`);
    }
  }

  buildKey(prefix: string, params: Record<string, unknown>): string {
    const sorted = Object.keys(params)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        if (params[k] !== undefined && params[k] !== null) {
          acc[k] = params[k];
        }
        return acc;
      }, {});
    return `${prefix}:${JSON.stringify(sorted)}`;
  }
}

export const cacheService = new CacheService();
