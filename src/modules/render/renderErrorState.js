import { escapeHTML } from '../../utils/dom.js';

export function renderErrorState(container, message = 'Failed to fetch products.') {
  container.innerHTML = `
    <div class="empty-state">
      <p>${escapeHTML(message)}</p>
      <button id="retry-btn" class="btn btn-sm btn-outline" style="margin-top: 0.75rem;">
        Try Again
      </button>
    </div>
  `;
}
