export function renderLoadingState(container, count = 12) {
  const skeletonCards = Array.from({ length: count }).map(() => `
    <div class="product-card skeleton-card" aria-hidden="true">
      <div class="skeleton skeleton-thumb"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-tag"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-desc"></div>
        <div class="skeleton-footer">
          <div class="skeleton skeleton-price"></div>
          <div class="skeleton skeleton-btn"></div>
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = `<div class="product-grid">${skeletonCards}</div>`;
}
