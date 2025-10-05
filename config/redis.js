const Redis = require('ioredis');
const logger = require('../utils/logger');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryDelayOnClusterDown: 300,
  enableOfflineQueue: true,
  maxLoadingTimeout: 10000,
  enableReadyCheck: true,
  maxMemoryPolicy: 'allkeys-lru',
  // Connection pool settings
  family: 4,
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'bookworld:',
};

// Create Redis client with error handling
let redis;
let redisAvailable = false;

try {
  redis = new Redis(redisConfig);

  // Redis connection events
  redis.on('connect', () => {
    logger.info('Redis client connected');
    redisAvailable = true;
  });

  redis.on('ready', () => {
    logger.info('Redis client ready');
    redisAvailable = true;
  });

  redis.on('error', (err) => {
    logger.warn('Redis client error:', err.message);
    redisAvailable = false;
  });

  redis.on('close', () => {
    logger.warn('Redis client connection closed');
    redisAvailable = false;
  });

  redis.on('reconnecting', () => {
    logger.info('Redis client reconnecting...');
  });

} catch (error) {
  logger.warn('Redis initialization failed:', error.message);
  redisAvailable = false;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (redis && redisAvailable) {
    logger.info('Closing Redis connection...');
    await redis.quit();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (redis && redisAvailable) {
    logger.info('Closing Redis connection...');
    await redis.quit();
  }
  process.exit(0);
});

// Cache utility functions
class CacheService {
  constructor() {
    this.redis = redis;
    this.defaultTTL = 3600; // 1 hour
    this.available = redisAvailable;
  }

  // Check if Redis is available
  isAvailable() {
    return this.available && redis && redis.status === 'ready';
  }

  // Set cache with TTL
  async set(key, value, ttl = this.defaultTTL) {
    if (!this.isAvailable()) {
      logger.debug(`Cache set skipped (Redis unavailable): ${key}`);
      return false;
    }
    
    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.setex(key, ttl, serializedValue);
      logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      logger.warn(`Cache set error for key ${key}:`, error.message);
      return false;
    }
  }

  // Get cache
  async get(key) {
    if (!this.isAvailable()) {
      logger.debug(`Cache get skipped (Redis unavailable): ${key}`);
      return null;
    }
    
    try {
      const value = await this.redis.get(key);
      if (value) {
        logger.debug(`Cache hit: ${key}`);
        return JSON.parse(value);
      }
      logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      logger.warn(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  }

  // Delete cache
  async del(key) {
    try {
      const result = await this.redis.del(key);
      logger.debug(`Cache deleted: ${key}`);
      return result > 0;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  // Delete multiple keys
  async delPattern(pattern) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.debug(`Cache deleted pattern: ${pattern} (${keys.length} keys)`);
      }
      return keys.length;
    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  // Check if key exists
  async exists(key) {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  // Set cache with expiration
  async setex(key, value, ttl) {
    return this.set(key, value, ttl);
  }

  // Increment counter
  async incr(key, ttl = this.defaultTTL) {
    try {
      const result = await this.redis.incr(key);
      if (result === 1) {
        await this.redis.expire(key, ttl);
      }
      return result;
    } catch (error) {
      logger.error(`Cache incr error for key ${key}:`, error);
      return 0;
    }
  }

  // Get multiple keys
  async mget(keys) {
    try {
      const values = await this.redis.mget(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      logger.error(`Cache mget error for keys ${keys}:`, error);
      return [];
    }
  }

  // Set multiple keys
  async mset(keyValuePairs, ttl = this.defaultTTL) {
    try {
      const pipeline = this.redis.pipeline();
      for (const [key, value] of Object.entries(keyValuePairs)) {
        pipeline.setex(key, ttl, JSON.stringify(value));
      }
      await pipeline.exec();
      logger.debug(`Cache mset: ${Object.keys(keyValuePairs).length} keys`);
      return true;
    } catch (error) {
      logger.error(`Cache mset error:`, error);
      return false;
    }
  }

  // Get cache statistics
  async getStats() {
    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      return {
        memory: info,
        keyspace: keyspace,
        connected: this.redis.status === 'ready'
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return null;
    }
  }

  // Clear all cache
  async flushAll() {
    try {
      await this.redis.flushall();
      logger.info('All cache cleared');
      return true;
    } catch (error) {
      logger.error('Cache flush all error:', error);
      return false;
    }
  }

  // Health check
  async healthCheck() {
    if (!this.isAvailable()) {
      return false;
    }
    
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch (error) {
      logger.warn('Redis health check failed:', error.message);
      return false;
    }
  }
}

// Create cache service instance
const cacheService = new CacheService();

module.exports = {
  redis: redis || null,
  cacheService,
  CacheService,
  isRedisAvailable: () => redisAvailable
};
