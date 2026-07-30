import { escapeHTML } from '../../utils/dom.js';

export function renderEmptyState(container, query = '', category = 'all') {
  const queryMessage = query
    ? `We couldn't find any results for "<strong>${escapeHTML(query)}</strong>".`
    : category !== 'all'
    ? `We couldn't find any results in category "<strong>${escapeHTML(category)}</strong>".`
    : 'No products available.';

  container.innerHTML = `
    <div class="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <h3>No products found</h3>
      <p>${queryMessage} Try checking your spelling or using different keywords.</p>
      <button id="clear-filters-btn" class="btn btn-secondary btn-sm">Clear Search</button>
    </div>
  `;
}
