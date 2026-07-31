import { escapeHTML } from '../../utils/dom.js';

export function populateCategoriesSelect(selectElement, categories = [], selectedCategory = 'all') {
  if (!selectElement) return;

  const defaultOption = '<option value="all">All Categories</option>';
  const optionsHtml = categories.map((cat) => {
    const slug = typeof cat === 'object' ? cat.slug : cat;
    const name = typeof cat === 'object' ? cat.name : cat.replace(/-/g, ' ');
    const isSelected = slug === selectedCategory ? 'selected' : '';
    return `<option value="${escapeHTML(slug)}" ${isSelected}>${escapeHTML(name)}</option>`;
  }).join('');

  selectElement.innerHTML = defaultOption + optionsHtml;
}
