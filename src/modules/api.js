import { apiCache } from './cache.js';
import { API_BASE_URL, DEFAULT_LIMIT } from '../config/constants.js';

let currentAbortController = null;

export async function fetchProducts({
  query = '',
  category = 'all',
  page = 1,
  limit = DEFAULT_LIMIT,
  sortBy = 'default',
}) {
  const cacheKey = apiCache.createKey({ query, category, page, limit, sortBy });
  const cachedData = apiCache.get(cacheKey);

  if (cachedData) {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
    return {
      data: cachedData,
      isCached: true,
    };
  }

  if (currentAbortController) {
    currentAbortController.abort();
  }

  currentAbortController = new AbortController();
  const { signal } = currentAbortController;

  try {
    const skip = (page - 1) * limit;
    const sanitizedQuery = query.trim();

    let endpoint = '';
    if (sanitizedQuery) {
      endpoint = `${API_BASE_URL}/search?q=${encodeURIComponent(sanitizedQuery)}&limit=${limit}&skip=${skip}`;
    } else if (category && category !== 'all') {
      endpoint = `${API_BASE_URL}/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`;
    } else {
      endpoint = `${API_BASE_URL}?limit=${limit}&skip=${skip}`;
    }

    const response = await fetch(endpoint, { signal });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const rawData = await response.json();

    let products = Array.isArray(rawData.products) ? [...rawData.products] : [];
    
    if (sanitizedQuery && category && category !== 'all') {
      products = products.filter(
        (p) => p.category && p.category.toLowerCase() === category.toLowerCase()
      );
    }

    products = sortProducts(products, sortBy);

    const resultData = {
      products,
      total: rawData.total || products.length,
      skip: rawData.skip || 0,
      limit: rawData.limit || limit,
    };

    apiCache.set(cacheKey, resultData);
    currentAbortController = null;

    return {
      data: resultData,
      isCached: false,
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { data: null, isCached: false, aborted: true };
    }

    currentAbortController = null;
    return {
      data: null,
      isCached: false,
      error: err.message || 'Unable to connect to server. Please check your connection.',
    };
  }
}

export async function fetchCategories() {
  const cacheKey = 'categories_list';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${API_BASE_URL}/category-list`);
    if (!res.ok) throw new Error('Category fetch failed');
    const categories = await res.json();
    apiCache.set(cacheKey, categories);
    return categories;
  } catch (err) {
    return [
      'beauty',
      'fragrances',
      'furniture',
      'groceries',
      'home-decoration',
      'kitchen-accessories',
      'laptops',
      'mens-shirts',
      'mens-shoes',
      'mens-watches',
      'mobile-accessories',
      'motorcycle',
      'skin-care',
      'smartphones',
      'sports-accessories',
      'sunglasses',
      'tops',
      'womens-bags',
      'womens-dresses',
      'womens-jewellery',
      'womens-shoes',
      'womens-watches',
    ];
  }
}

function sortProducts(items, sortBy) {
  if (!sortBy || sortBy === 'default') return items;

  return items.sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating-desc':
        return (b.rating || 0) - (a.rating || 0);
      case 'title-asc':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
}
