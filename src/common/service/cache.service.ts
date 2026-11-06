import { createClient, RedisClientType } from "redis";
import { REDIS_URI } from "../../config";



export class CacheService {
    private readonly client: RedisClientType;

    constructor() {
        this.client = createClient({ url: REDIS_URI});
        void this.connect();
    }

    async connect(): Promise<void> {
        try {
            await this.client.connect();
            console.log("REDIS Connected Successfully");
        } catch (error) {
            console.error("Failed to connect to Redis", error);
        }
    }

 async set({ key, value, ttl }: { key: string; value: any; ttl?: number | undefined }) {
    if (typeof value === "object") {
        value = JSON.stringify(value);
    }
    return await this.client.set(key, value, { ...(ttl ? { EX: ttl } : {}) });
}

async get({ key }: { key: string }) {
    let value = await this.client.get(key);

    try {
        return JSON.parse(value as string);
    } catch (error) {
        return value;
    }
}
    
    async exist({ key }: { key: string }): Promise<number> {
        return this.client.exists(key);
    }


    async update({ key, value, ttl=undefined }: { key: string; value: unknown; ttl?: number }) {
        if (!(await this.exist({ key }))) {
            return 0;
        }
        return this.set({ key, value, ...(ttl === undefined ? {} : { ttl }) });
    }


    async del({ key }: { key: string | string[] }): Promise<number> {
        return this.client.del(key);
    }


    
    async expire({ key, ttl }: { key: string; ttl: number }): Promise<number> {
        return this.client.expire(key, ttl);
    }

    async ttl({ key }: { key: string }): Promise<number> {
        return this.client.ttl(key);
    }

    async keys({ prefix = "" }: { prefix?: string } = {}): Promise<string[]> {
        return this.client.keys(`${prefix}*`);
    }

    async incrBy({ key, value = 1 }: { key: string; value?: number }): Promise<number> {
        return this.client.incrBy(key, value);
    }
}

export default new CacheService();