import { escapeHTML } from '../../utils/dom.js';

export function renderRecentSearches(container, recentSearches = []) {
  if (!recentSearches || recentSearches.length === 0) {
    container.innerHTML = '';
    return;
  }

  const chipsHtml = recentSearches.map((term) => `
    <button class="chip-tag" data-term="${escapeHTML(term)}" aria-label="Search ${escapeHTML(term)}">
      ${escapeHTML(term)}
    </button>
  `).join('');

  container.innerHTML = `
    <div class="recent-searches">
      <span class="recent-label">Recent:</span>
      <div class="chips-list">
        ${chipsHtml}
        <button class="clear-history-btn" title="Clear History">Clear</button>
      </div>
    </div>
  `;
}
