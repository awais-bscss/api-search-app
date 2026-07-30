import { escapeHTML } from '../../utils/dom.js';

export function renderProductsGrid(container, products) {
  if (!products || products.length === 0) return;

  const cardsHtml = products.map((product) => {
    const { id, title, description, price, rating, category, thumbnail, discountPercentage } = product;

    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);

    const formattedCategory = category ? category.replace(/-/g, ' ') : 'General';

    return `
      <article class="product-card" data-id="${id}">
        <div class="card-thumb-wrap">
          <img
            src="${escapeHTML(thumbnail)}"
            alt="${escapeHTML(title)}"
            class="card-thumb"
            loading="lazy"
            onerror="this.onerror=null; this.src='https://via.placeholder.com/260x180?text=Product+Image';"
          />
          ${discountPercentage ? `<span class="badge-discount">-${Math.round(discountPercentage)}%</span>` : ''}
        </div>
        <div class="card-content">
          <div class="card-meta">
            <span class="category-badge">${escapeHTML(formattedCategory)}</span>
            <span class="rating-badge">Rating: ${rating || '4.5'}</span>
          </div>
          <h3 class="card-title" title="${escapeHTML(title)}">${escapeHTML(title)}</h3>
          <p class="card-desc">${escapeHTML(description)}</p>
          <div class="card-footer">
            <div class="price-wrap">
              <span class="price-val">${formattedPrice}</span>
            </div>
            <button class="btn btn-sm btn-outline view-details-btn" data-id="${id}">
              Details
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  container.innerHTML = `<div class="product-grid">${cardsHtml}</div>`;
}
