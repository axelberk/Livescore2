const MEMORY_CACHE = new Map();
const CACHE_PREFIX = "apiCache:";
const EXPIRY_MS = 1000 * 60 * 5; // 5 minutes

const buildCacheKey = (url, params) =>
  `${CACHE_PREFIX}${url}?${JSON.stringify(params || {})}`;

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    if (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED") {
      try {
        sessionStorage.setItem(key, value); // fallback to sessionStorage
      } catch (err) {
        console.warn("Both localStorage and sessionStorage quota exceeded");
      }
    } else {
      console.warn("Storage error:", e);
    }
  }
};

const loadFromStorage = (key) => {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
};

const removeFromStorage = (key) => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};

export const fetchWithCache = async (url, options = {}) => {
  const key = buildCacheKey(url, options.params);

  if (MEMORY_CACHE.has(key)) {
    return MEMORY_CACHE.get(key);
  }

  const cached = loadFromStorage(key);
  if (cached) {
    try {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < EXPIRY_MS) {
        MEMORY_CACHE.set(key, data);
        return data;
      } else {
        removeFromStorage(key);
      }
    } catch {
      removeFromStorage(key);
    }
  }

  try {
    const axios = await import("axios");
    const response = await axios.default.get(url, options);
    const responseData = response.data;

    const serialized = JSON.stringify({
      timestamp: Date.now(),
      data: responseData,
    });

    saveToStorage(key, serialized);
    MEMORY_CACHE.set(key, responseData);

    return responseData;
  } catch (err) {
    console.error("Fetch with cache failed:", err);
    throw err;
  }
};
