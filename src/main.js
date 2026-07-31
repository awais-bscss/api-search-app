import { store } from './modules/state.js';
import { fetchProducts, fetchCategories } from './modules/api.js';
import { debounce } from './utils/debounce.js';
import { escapeHTML } from './utils/dom.js';
import { DEBOUNCE_DELAY } from './config/constants.js';
import {
  renderLoadingState,
  renderErrorState,
  renderEmptyState,
  renderProductsGrid,
  renderStatusBar,
  renderPagination,
  renderRecentSearches,
  populateCategoriesSelect,
} from './modules/render/index.js';

const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const categorySelect = document.getElementById('category-select');
const sortSelect = document.getElementById('sort-select');
const limitSelect = document.getElementById('limit-select');

const statusContainer = document.getElementById('status-container');
const resultsContainer = document.getElementById('results-container');
const paginationContainer = document.getElementById('pagination-container');
const recentContainer = document.getElementById('recent-container');

const detailModal = document.getElementById('detail-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalContent = document.getElementById('modal-content');

function initApp() {
  store.subscribe(handleStateChange);
  setupEventListeners();
  executeSearch();

  fetchCategories().then((categories) => {
    populateCategoriesSelect(categorySelect, categories, store.getState().category);
  });
}

function handleStateChange(state) {
  if (state.query.length > 0) {
    clearSearchBtn.classList.remove('hidden');
  } else {
    clearSearchBtn.classList.add('hidden');
  }

  renderRecentSearches(recentContainer, state.recentSearches);
  renderStatusBar(statusContainer, state);

  switch (state.status) {
    case 'loading':
      renderLoadingState(resultsContainer, state.limit);
      paginationContainer.innerHTML = '';
      break;

    case 'error':
      renderErrorState(resultsContainer, state.errorMessage);
      paginationContainer.innerHTML = '';
      break;

    case 'empty':
      renderEmptyState(resultsContainer, state.query, state.category);
      paginationContainer.innerHTML = '';
      break;

    case 'success':
      renderProductsGrid(resultsContainer, state.items);
      renderPagination(paginationContainer, state);
      break;

    default:
      break;
  }
}

async function executeSearch() {
  const currentState = store.getState();
  store.setState({ status: 'loading', errorMessage: null });

  const startTime = Date.now();

  const result = await fetchProducts({
    query: currentState.query,
    category: currentState.category,
    page: currentState.page,
    limit: currentState.limit,
    sortBy: currentState.sortBy,
  });

  if (result.aborted) {
    return;
  }

  // Ensure minimum 300ms smooth skeleton display to prevent flickering
  const elapsedTime = Date.now() - startTime;
  if (elapsedTime < 300) {
    await new Promise((resolve) => setTimeout(resolve, 300 - elapsedTime));
  }

  if (result.error) {
    store.setState({
      status: 'error',
      errorMessage: result.error,
      items: [],
      total: 0,
      isCached: false,
    });
    return;
  }

  const { products, total } = result.data;

  if (!products || products.length === 0) {
    store.setState({
      status: 'empty',
      items: [],
      total: 0,
      isCached: result.isCached,
    });
    return;
  }

  if (currentState.query.trim()) {
    store.addRecentSearch(currentState.query.trim());
  }

  store.setState({
    status: 'success',
    items: products,
    total,
    isCached: result.isCached,
  });
}

const debouncedSearch = debounce(() => {
  store.setState({ page: 1 });
  executeSearch();
}, DEBOUNCE_DELAY);

function setupEventListeners() {
  const searchForm = document.getElementById('search-form');
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    debouncedSearch.cancel();
    const query = store.getState().query.trim();
    if (query.length >= 2) {
      store.addRecentSearch(query);
    }
    store.setState({ page: 1 });
    executeSearch();
  });

  searchInput.addEventListener('input', (e) => {
    store.setState({ query: e.target.value });
    debouncedSearch();
  });

  clearSearchBtn.addEventListener('click', () => {
    debouncedSearch.cancel();
    searchInput.value = '';
    store.setState({ query: '', page: 1 });
    executeSearch();
  });

  categorySelect.addEventListener('change', (e) => {
    debouncedSearch.cancel();
    store.setState({ category: e.target.value, page: 1 });
    executeSearch();
  });

  sortSelect.addEventListener('change', (e) => {
    debouncedSearch.cancel();
    store.setState({ sortBy: e.target.value });
    executeSearch();
  });

  limitSelect.addEventListener('change', (e) => {
    debouncedSearch.cancel();
    store.setState({ limit: Number(e.target.value), page: 1 });
    executeSearch();
  });

  paginationContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-page]');
    if (!btn || btn.disabled) return;

    const targetPage = Number(btn.dataset.page);
    if (!isNaN(targetPage) && targetPage !== store.getState().page) {
      store.setState({ page: targetPage });
      executeSearch();
      window.scrollTo({ top: resultsContainer.offsetTop - 80, behavior: 'smooth' });
    }
  });

  resultsContainer.addEventListener('click', (e) => {
    if (e.target.closest('#retry-btn')) {
      executeSearch();
      return;
    }

    if (e.target.closest('#clear-filters-btn')) {
      searchInput.value = '';
      categorySelect.value = 'all';
      sortSelect.value = 'default';
      store.setState({ query: '', category: 'all', sortBy: 'default', page: 1 });
      executeSearch();
      return;
    }

    const detailsBtn = e.target.closest('.view-details-btn');
    if (detailsBtn) {
      const productId = Number(detailsBtn.dataset.id);
      openProductModal(productId);
    }
  });

  recentContainer.addEventListener('click', (e) => {
    const tag = e.target.closest('.chip-tag');
    if (tag) {
      const term = tag.dataset.term;
      searchInput.value = term;
      store.setState({ query: term, page: 1 });
      executeSearch();
      return;
    }

    if (e.target.closest('.clear-history-btn')) {
      store.clearRecentSearches();
    }
  });

  closeModalBtn.addEventListener('click', closeProductModal);
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) closeProductModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !detailModal.classList.contains('hidden')) {
      closeProductModal();
    }
  });
}

function openProductModal(productId) {
  const { items } = store.getState();
  const product = items.find((p) => p.id === productId);

  if (!product) return;

  const { title, description, price, rating, category, brand, stock, thumbnail, discountPercentage } = product;
  const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

  modalContent.innerHTML = `
    <div class="modal-product-grid">
      <div class="modal-gallery">
        <img src="${escapeHTML(thumbnail)}" alt="${escapeHTML(title)}" class="modal-main-img" />
      </div>
      <div class="modal-info">
        <div class="modal-header-meta">
          <span class="category-badge">${escapeHTML(category ? category.replace(/-/g, ' ') : 'General')}</span>
          <span class="modal-rating">Rating: ${rating || 0} / 5.0</span>
        </div>
        <h2 class="modal-title">${escapeHTML(title)}</h2>
        <p class="modal-brand">Brand: <strong>${escapeHTML(brand || 'N/A')}</strong></p>
        <p class="modal-desc">${escapeHTML(description)}</p>
        <div class="modal-price-box">
          <span class="modal-price">${formattedPrice}</span>
          ${discountPercentage ? `<span class="modal-discount-badge">Save ${Math.round(discountPercentage)}%</span>` : ''}
        </div>
        <p class="modal-stock ${stock > 0 ? 'in-stock' : 'out-of-stock'}">
          ${stock > 0 ? `In Stock (${stock} available)` : 'Out of Stock'}
        </p>
      </div>
    </div>
  `;

  detailModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  closeModalBtn.focus();
}

function closeProductModal() {
  detailModal.classList.add('hidden');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', initApp);
