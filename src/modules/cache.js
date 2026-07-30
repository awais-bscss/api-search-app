import { CACHE_TTL_MS, DEFAULT_LIMIT } from '../config/constants.js';

class ResponseCache {
  constructor(ttlMs = CACHE_TTL_MS) {
    this.cache = new Map();
    this.ttlMs = ttlMs;
  }

  createKey(params = {}) {
    const {
      query = '',
      category = 'all',
      page = 1,
      limit = DEFAULT_LIMIT,
      sortBy = 'default',
    } = params;

    const sanitizedQuery = query.trim().toLowerCase();
    return `q:${sanitizedQuery}|cat:${category}|p:${page}|lim:${limit}|sort:${sortBy}`;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const entry = this.cache.get(key);
    const isExpired = Date.now() - entry.timestamp > this.ttlMs;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key) {
    return this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

export const apiCache = new ResponseCache();
