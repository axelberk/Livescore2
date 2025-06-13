const MEMORY_CACHE = new Map();
const CACHE_PREFIX = "apiCache:";
const EXPIRY_MS = 1000 * 60 * 5; // 5 minutes

const buildCacheKey = (url, params) =>
  `${CACHE_PREFIX}${url}?${JSON.stringify(params || {})}`;

export const fetchWithCache = async (url, options = {}) => {
  const key = buildCacheKey(url, options.params);

  // 1. Check in-memory cache
  if (MEMORY_CACHE.has(key)) {
    return MEMORY_CACHE.get(key);
  }

  // 2. Check localStorage
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < EXPIRY_MS) {
        MEMORY_CACHE.set(key, data); // hydrate memory cache
        return data;
      } else {
        localStorage.removeItem(key); // expired
      }
    } catch {
      localStorage.removeItem(key); // corrupted
    }
  }

  // 3. Fetch from API
  try {
    const axios = await import("axios");
    const response = await axios.default.get(url, options);

    MEMORY_CACHE.set(key, response);
    localStorage.setItem(
      key,
      JSON.stringify({ timestamp: Date.now(), data: response })
    );

    return response;
  } catch (err) {
    console.error("Fetch with cache failed:", err);
    throw err;
  }
};
