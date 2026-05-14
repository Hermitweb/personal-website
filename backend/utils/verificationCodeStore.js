/**
 * 验证码存储服务
 * 优先使用 Redis，未配置时自动回退到内存存储
 */

const { Map } = require('./memoryStore');

class VerificationCodeStore {
  constructor() {
    this.redis = null;
    this.memoryStore = new Map();
    this.useRedis = false;
    this.prefix = 'verify_code:';
    this.initRedis();
  }

  /**
   * 初始化 Redis 连接
   */
  initRedis() {
    try {
      const redis = require('redis');
      const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST;

      if (redisUrl) {
        const client = redis.createClient({
          url: redisUrl.startsWith('redis://') ? redisUrl : `redis://${redisUrl}`,
          socket: {
            connectTimeout: 5000,
            reconnectStrategy: (retries) => {
              if (retries > 3) {
                console.warn('[验证码存储] Redis 连接失败超过3次，回退到内存存储');
                this.useRedis = false;
                return false;
              }
              return Math.min(retries * 500, 3000);
            }
          }
        });

        client.on('error', (err) => {
          console.warn('[验证码存储] Redis 错误，回退到内存存储:', err.message);
          this.useRedis = false;
        });

        client.on('connect', () => {
          this.useRedis = true;
          console.log('[验证码存储] Redis 连接成功');
        });

        this.redis = client;
        client.connect().catch(() => {
          this.useRedis = false;
        });
      } else {
        console.log('[验证码存储] 未配置 Redis，使用内存存储');
      }
    } catch (err) {
      // redis 模块未安装
      console.log('[验证码存储] redis 模块未安装，使用内存存储');
    }
  }

  /**
   * 存储验证码
   * @param {string} key - 存储键（通常为邮箱）
   * @param {Object} data - 验证码数据 { code, expires, attempts }
   * @param {number} ttlSeconds - 过期时间（秒）
   */
  async set(key, data, ttlSeconds = 600) {
    const serialized = JSON.stringify(data);

    if (this.useRedis && this.redis) {
      try {
        await this.redis.set(`${this.prefix}${key}`, serialized, {
          EX: ttlSeconds
        });
        return;
      } catch (err) {
        console.warn('[验证码存储] Redis 写入失败，回退到内存:', err.message);
      }
    }

    // 内存存储回退
    this.memoryStore.set(key, {
      ...data,
      _expires: Date.now() + ttlSeconds * 1000
    });
  }

  /**
   * 获取验证码
   * @param {string} key - 存储键
   * @returns {Object|null} 验证码数据
   */
  async get(key) {
    if (this.useRedis && this.redis) {
      try {
        const data = await this.redis.get(`${this.prefix}${key}`);
        if (data) {
          return JSON.parse(data);
        }
        return null;
      } catch (err) {
        console.warn('[验证码存储] Redis 读取失败，回退到内存:', err.message);
      }
    }

    // 内存存储回退
    const data = this.memoryStore.get(key);
    if (!data) return null;

    // 检查过期
    if (data._expires && data._expires < Date.now()) {
      this.memoryStore.delete(key);
      return null;
    }

    return data;
  }

  /**
   * 更新验证码（部分更新）
   * @param {string} key - 存储键
   * @param {Object} updates - 要更新的字段
   */
  async update(key, updates) {
    const existing = await this.get(key);
    if (!existing) return false;

    const updated = { ...existing, ...updates };
    // 计算剩余 TTL
    const remainingTTL = existing.expires
      ? Math.max(0, Math.floor((new Date(existing.expires).getTime() - Date.now()) / 1000))
      : 600;

    await this.set(key, updated, remainingTTL);
    return true;
  }

  /**
   * 删除验证码
   * @param {string} key - 存储键
   */
  async delete(key) {
    if (this.useRedis && this.redis) {
      try {
        await this.redis.del(`${this.prefix}${key}`);
      } catch (err) {
        console.warn('[验证码存储] Redis 删除失败:', err.message);
      }
    }

    this.memoryStore.delete(key);
  }

  /**
   * 检查是否存在
   * @param {string} key - 存储键
   * @returns {boolean}
   */
  async has(key) {
    const data = await this.get(key);
    return data !== null;
  }

  /**
   * 获取当前存储类型
   * @returns {string} 'redis' | 'memory'
   */
  getStorageType() {
    return this.useRedis ? 'redis' : 'memory';
  }
}

// 导出单例
const verificationCodeStore = new VerificationCodeStore();

module.exports = verificationCodeStore;
