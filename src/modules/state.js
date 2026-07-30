import { STORAGE_KEYS, DEFAULT_LIMIT } from '../config/constants.js';

class StateStore {
  constructor() {
    this.listeners = new Set();
    this.state = {
      query: '',
      category: 'all',
      sortBy: 'default',
      page: 1,
      limit: DEFAULT_LIMIT,
      total: 0,
      items: [],
      status: 'idle',
      errorMessage: null,
      isCached: false,
      recentSearches: this.loadRecentSearches(),
    };
  }

  getState() {
    return { ...this.state };
  }

  setState(partialState) {
    this.state = {
      ...this.state,
      ...partialState,
    };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getState());

    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    const current = this.getState();
    this.listeners.forEach((listener) => listener(current));
  }

  addRecentSearch(term) {
    const sanitized = term.trim();
    if (!sanitized || sanitized.length < 3) return;

    let updated = this.state.recentSearches.filter(
      (item) => !sanitized.toLowerCase().startsWith(item.toLowerCase()) && item.toLowerCase() !== sanitized.toLowerCase()
    );
    updated.unshift(sanitized);
    updated = updated.slice(0, 5);

    try {
      localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save recent searches:', err);
    }

    this.setState({ recentSearches: updated });
  }

  clearRecentSearches() {
    try {
      localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
    } catch (err) {
      console.warn('Failed to clear recent searches:', err);
    }
    this.setState({ recentSearches: [] });
  }

  loadRecentSearches() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      return [];
    }
  }
}

export const store = new StateStore();
