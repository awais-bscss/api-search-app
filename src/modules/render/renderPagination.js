export function renderPagination(container, state) {
  const { page, limit, total, status } = state;

  if (status !== 'success' || total <= limit) {
    container.innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(total / limit);
  let middleButtonsHtml = '';

  const maxMiddleButtons = 2;
  let startPage = Math.max(2, page);
  let endPage = Math.min(totalPages - 1, startPage + maxMiddleButtons - 1);

  if (endPage - startPage < maxMiddleButtons - 1) {
    startPage = Math.max(2, endPage - maxMiddleButtons + 1);
  }

  const firstPageHtml = `<button class="pagination-num ${page === 1 ? 'active' : ''}" data-page="1" aria-label="Page 1">1</button>`;
  const leftEllipsis = startPage > 2 ? '<span class="ellipsis">...</span>' : '';

  for (let i = startPage; i <= endPage; i++) {
    if (i > 1 && i < totalPages) {
      middleButtonsHtml += `
        <button
          class="pagination-num ${i === page ? 'active' : ''}"
          data-page="${i}"
          aria-label="Page ${i}"
          ${i === page ? 'aria-current="page"' : ''}
        >
          ${i}
        </button>
      `;
    }
  }

  const rightEllipsis = endPage < totalPages - 1 ? '<span class="ellipsis">...</span>' : '';
  const lastPageHtml = totalPages > 1 ? `<button class="pagination-num ${page === totalPages ? 'active' : ''}" data-page="${totalPages}" aria-label="Page ${totalPages}">${totalPages}</button>` : '';

  container.innerHTML = `
    <nav class="pagination-nav" aria-label="Search Pagination">
      <button
        class="btn btn-outline btn-page"
        id="prev-page-btn"
        data-page="${page - 1}"
        ${page <= 1 ? 'disabled' : ''}
      >
        Previous
      </button>

      <div class="pagination-pages">
        ${firstPageHtml}
        ${leftEllipsis}
        ${middleButtonsHtml}
        ${rightEllipsis}
        ${lastPageHtml}
      </div>

      <button
        class="btn btn-outline btn-page"
        id="next-page-btn"
        data-page="${page + 1}"
        ${page >= totalPages ? 'disabled' : ''}
      >
        Next
      </button>
    </nav>
  `;
}
