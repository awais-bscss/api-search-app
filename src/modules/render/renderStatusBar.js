import { escapeHTML } from '../../utils/dom.js';

export function renderStatusBar(container, state) {
  const { total, page, limit, query, category, isCached, status } = state;

  if (status === 'loading') {
    container.innerHTML = `
      <div class="status-summary">
        <span class="spinner-sm"></span> Loading products...
      </div>
    `;
    return;
  }

  if (status === 'error' || status === 'empty' || total === 0) {
    container.innerHTML = '';
    return;
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const queryText = query ? ` for "<strong class="highlight">${escapeHTML(query)}</strong>"` : '';
  const categoryText = category !== 'all' ? ` in <em>${escapeHTML(category.replace(/-/g, ' '))}</em>` : '';

  container.innerHTML = `
    <div class="status-bar">
      <div class="status-info">
        Showing <strong>${start}–${end}</strong> of <strong>${total}</strong> results${queryText}${categoryText}
      </div>
      ${isCached ? `<span class="badge-cache" title="Loaded from memory cache">Served from Cache</span>` : ''}
    </div>
  `;
}
