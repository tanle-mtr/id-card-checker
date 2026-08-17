import { Redis } from '@upstash/redis';
import { User } from '@/types';

let redis: Redis | null = null;
let redisChecked = false;

// In-memory fallback so the app works without Upstash Redis configured
// (e.g. local dev / first deploy). Usage counters live only for the
// current server process.
const memoryStore = new Map<string, number>();

function getRedis(): Redis | null {
  if (redisChecked) return redis;
  redisChecked = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

function memGet(key: string): number {
  return memoryStore.get(key) ?? 0;
}

function memSet(key: string, value: number): void {
  memoryStore.set(key, value);
}

function memIncrBy(key: string, delta: number): void {
  memoryStore.set(key, memGet(key) + delta);
}

function memKeys(prefix: string): string[] {
  return [...memoryStore.keys()].filter((k) => k.startsWith(prefix));
}

const QUOTA_PREFIX = 'quota:';
const USAGE_PREFIX = 'usage:';

export class QuotaManager {
  static async incrementUsage(userId: string, tokens: number, cost: number): Promise<void> {
    const client = getRedis();
    const key = `${USAGE_PREFIX}${userId}`;
    if (client) {
      await client.incrby(key, tokens);
      await client.incrby(`usage:cost:${userId}`, cost);
    } else {
      memIncrBy(key, tokens);
      memIncrBy(`usage:cost:${userId}`, cost);
    }
  }

  static async checkQuota(userId: string, tokens: number): Promise<{ allowed: boolean; remaining: number }> {
    const client = getRedis();
    const userKey = `${QUOTA_PREFIX}${userId}`;
    const usageKey = `${USAGE_PREFIX}${userId}`;

    let currentQuota: number;
    let currentUsage: number;
    if (client) {
      currentQuota = ((await client.get(userKey)) as number) || 0;
      currentUsage = ((await client.get(usageKey)) as number) || 0;
    } else {
      currentQuota = memGet(userKey);
      currentUsage = memGet(usageKey);
    }

    const remaining = currentQuota - currentUsage;

    if (remaining < tokens) {
      return { allowed: false, remaining };
    }

    return { allowed: true, remaining };
  }

  static async resetMonthlyQuota(userId: string): Promise<void> {
    const key = `${QUOTA_PREFIX}${userId}`;
    const userKey = `${USAGE_PREFIX}${userId}`;

    // Get user plan to determine quota
    const plan = await this.getUserPlan(userId);
    if (!plan) return;

    let quota = 1000000; // Default free quota
    if (plan === 'professional') quota = 5000000;
    if (plan === 'team') quota = 10000000;

    const client = getRedis();
    if (client) {
      await client.set(key, quota);
      await client.set(userKey, 0);
    } else {
      memSet(key, quota);
      memSet(userKey, 0);
    }
  }

  static async getUserPlan(userId: string): Promise<User['plan'] | null> {
    // In a real implementation, this would fetch from database
    // For now, return free as default
    return 'free' as User['plan'];
  }

  static async getUsageStats(userId: string): Promise<{ used: number; total: number }> {
    const client = getRedis();
    const usageKey = `${USAGE_PREFIX}${userId}`;
    const quotaKey = `${QUOTA_PREFIX}${userId}`;

    let used: number;
    let total: number;
    if (client) {
      used = ((await client.get(usageKey)) as number) || 0;
      total = ((await client.get(quotaKey)) as number) || 0;
    } else {
      used = memGet(usageKey);
      total = memGet(quotaKey);
    }

    return { used, total };
  }

  static async getGlobalStats(): Promise<{ totalUsers: number; totalUsage: number; totalRevenue: number }> {
    const client = getRedis();
    let users: string[];
    let totalUsage: number;
    let totalRevenue: number;

    if (client) {
      users = await client.keys('quota:*');
      totalUsage = ((await client.get('global:usage')) as number) || 0;
      totalRevenue = ((await client.get('global:revenue')) as number) || 0;
    } else {
      users = memKeys('quota:');
      totalUsage = memGet('global:usage');
      totalRevenue = memGet('global:revenue');
    }

    return {
      totalUsers: users.length,
      totalUsage,
      totalRevenue,
    };
  }

  static async recordRevenue(amount: number): Promise<void> {
    const client = getRedis();
    if (client) {
      await client.incrby('global:revenue', amount);
    } else {
      memIncrBy('global:revenue', amount);
    }
  }
}
