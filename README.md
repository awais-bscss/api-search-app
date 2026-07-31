# API Search Application

**Live Demo:** [Open Live App](https://awais-bscss.github.io/api-search-app/)

---

## Overview

A Vanilla JavaScript API Search Application built without external libraries or frameworks. Demonstrates debouncing, request cancellation via AbortController, in-memory caching with TTL, state management, pagination, and UI state rendering.

Built using the [DummyJSON Products API](https://dummyjson.com/docs/products) as the data source.

---

## Key Features

1. **Debounced Search (`src/utils/debounce.js`)**
   - Delays API execution until user typing stops for `350ms`, preventing excessive network requests.
   - Includes `.cancel()` method to immediately clear pending timers on explicit user actions (filter change, form submit).

2. **Request Cancellation (`src/modules/api.js`)**
   - Uses `AbortController` to cancel in-flight fetch requests when a new search query or page change occurs.
   - Handles `AbortError` silently without triggering error UI — the cancelled request simply returns `{ aborted: true }`.

3. **In-Memory Caching (`src/modules/cache.js`)**
   - Caches API response payloads in a `Map` with a 5-minute TTL.
   - Composite cache key includes query, category, page, limit, and sort to avoid stale results.
   - Displays a `Served from Cache` badge in the status bar for cached results.

4. **State Management (`src/modules/state.js`)**
   - Class-based centralized store using the Observer pattern (`subscribe` / `notify`).
   - Shallow-merge `setState` triggers all subscribed listeners with a snapshot of current state.
   - Persists recent search history to `localStorage` with error-safe read/write.

5. **UI State Rendering (`src/modules/render/`)**
   - **Loading** — Skeleton card loaders with shimmer animation; count matches the current `limit` setting.
   - **Error** — Error message display with a Retry button to re-execute the last search.
   - **Empty** — Contextual "no results" message based on query and category, with a Clear Search action.
   - **Success** — Responsive product card grid with lazy-loaded images and discount badges.

6. **Pagination (`src/modules/render/renderPagination.js`)**
   - Previous / Next navigation with numbered page buttons and ellipsis for large ranges.
   - Auto-hides when total results fit within a single page.
   - Smooth scroll to results on page change.

7. **Category Filtering, Sorting & Per-Page Controls**
   - Dynamic category dropdown populated from the API's category list endpoint.
   - Client-side sorting by price, rating, and title.
   - Configurable items-per-page (12, 24, 36).

8. **Recent Search History**
   - Saves up to 5 recent searches in `localStorage`.
   - Clickable chip tags to quickly re-run past searches.
   - One-click clear history.

9. **Product Detail Modal**
   - Accessible modal (`role="dialog"`, `aria-modal`) with image, brand, description, price, discount, and stock info.
   - Closes on backdrop click, close button, or `Escape` key.
   - Prevents background scroll when open.

10. **Security**
    - All user-facing content is sanitized through `escapeHTML()` before DOM injection to prevent XSS.

---

## Project Structure

```
Api Search App/
├── index.html                         # Application entry point
├── README.md
└── src/
    ├── main.js                        # App bootstrap, event listeners, orchestration
    ├── config/
    │   └── constants.js               # API URL, debounce delay, cache TTL, storage keys
    ├── modules/
    │   ├── api.js                     # Fetch wrapper, AbortController, cache integration
    │   ├── cache.js                   # In-memory Map cache with TTL expiry
    │   ├── state.js                   # Central state store (Observer pattern)
    │   ├── render.js                  # Barrel re-export from render/
    │   └── render/
    │       ├── index.js               # Barrel export for all render functions
    │       ├── renderLoadingState.js   # Skeleton card shimmer loaders
    │       ├── renderErrorState.js     # Error message with Retry action
    │       ├── renderEmptyState.js     # Empty results with contextual message
    │       ├── renderProductsGrid.js   # Product card grid rendering
    │       ├── renderPagination.js     # Pagination controls with ellipsis
    │       ├── renderStatusBar.js      # Results count, query info, cache badge
    │       ├── renderRecentSearches.js # Recent search chip tags
    │       └── populateCategoriesSelect.js  # Dynamic category dropdown
    ├── styles/
    │   ├── style.css                  # CSS barrel (@import for all partials)
    │   ├── base.css                   # Reset, layout, header, footer
    │   ├── search.css                 # Search input, filters, chips, status bar
    │   ├── product-card.css           # Product cards, grid, skeleton, buttons
    │   ├── pagination.css             # Pagination nav and page buttons
    │   └── modal.css                  # Product detail modal styles
    └── utils/
        ├── debounce.js                # Debounce utility with .cancel()
        └── dom.js                     # escapeHTML utility for XSS prevention
```

---

## Module Responsibilities

| File                          | Responsibility                                                                                                                               |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `main.js`                     | App entry point — initializes state subscription, sets up all event listeners, orchestrates search execution and modal logic                 |
| `constants.js`                | Centralized configuration — API base URL, debounce delay (350ms), cache TTL (5 min), localStorage keys                                       |
| `api.js`                      | Fetch wrapper with AbortController cancellation, cache-first lookup, endpoint construction, client-side sorting                              |
| `cache.js`                    | In-memory `Map` cache with TTL — composite key generation, expiry checking, get/set/clear operations                                         |
| `state.js`                    | Class-based state store — Observer pattern with `subscribe`/`notify`, shallow-merge `setState`, localStorage persistence for recent searches |
| `render.js`                   | Barrel re-export forwarding all render functions from `render/index.js`                                                                      |
| `render/index.js`             | Barrel export aggregating all individual render modules                                                                                      |
| `renderLoadingState.js`       | Generates skeleton placeholder cards with shimmer animation matching current page limit                                                      |
| `renderErrorState.js`         | Renders error message with a Retry button for re-executing the failed search                                                                 |
| `renderEmptyState.js`         | Contextual empty state — different messages for query vs category vs general, with Clear Search action                                       |
| `renderProductsGrid.js`       | Builds responsive product card grid with lazy images, discount badges, and View Details buttons                                              |
| `renderPagination.js`         | Pagination nav — Previous/Next, numbered buttons, ellipsis for large page ranges, disabled state handling                                    |
| `renderStatusBar.js`          | Displays result count range, search query highlight, category filter info, and cached response badge                                         |
| `renderRecentSearches.js`     | Renders clickable chip tags for recent search terms with Clear History option                                                                |
| `populateCategoriesSelect.js` | Dynamically populates the category `<select>` from API data with proper slug/name handling                                                   |
| `debounce.js`                 | Generic debounce utility — delays function execution, returns wrapper with `.cancel()` method                                                |
| `dom.js`                      | `escapeHTML` function — sanitizes strings against `&`, `<`, `>`, `"`, `'` for safe innerHTML injection                                       |

---

## Technical Decisions

| Decision                    | Rationale                                                                                                                                                                                               |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Class-based StateStore**  | Encapsulates state, listeners, and localStorage logic in a single cohesive unit. The Observer pattern allows `main.js` to react to state changes without tight coupling to individual modules.          |
| **`Map` for caching**       | `Map` preserves insertion order and accepts any key type. Combined with a composite string key (`q:...\|cat:...\|p:...\|sort:...`), it ensures unique cache entries per search parameter combination.   |
| **Cache-first in `api.js`** | Checking cache before creating an `AbortController` avoids unnecessary abort calls and skips the network entirely for repeated searches within the TTL window.                                          |
| **Abort before fetch**      | Each `fetchProducts` call aborts any previous in-flight request first. This guarantees only the latest request resolves, preventing race conditions when the user types fast or switches pages rapidly. |
| **Render module split**     | Splitting render functions into individual files keeps each under 50 lines. The barrel export (`render/index.js`) provides a single clean import path while maintaining separation of concerns.         |
| **Client-side sorting**     | DummyJSON's `/search` endpoint does not support server-side sort parameters. Sorting is applied to the fetched result set before caching, so cached responses retain the correct sort order.            |
| **`escapeHTML` utility**    | All `innerHTML` assignments pass through `escapeHTML` to neutralize any HTML/JS in API response fields, preventing stored XSS from malicious product data.                                              |
| **Event delegation**        | Pagination clicks, retry button, clear filters, and product detail buttons are all handled via event delegation on parent containers. This avoids attaching/removing listeners on every re-render.      |

---

## Setup & Running Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/awais-bscss/api-search-app.git
   cd api-search-app
   ```

2. Open `index.html` directly in a browser, or use a local server:

   ```bash
   npx serve .
   ```

3. **Test the features:**
   - Type in the search bar → observe debounced API calls (network tab shows 350ms delay).
   - Switch pages rapidly → observe AbortController cancelling previous requests.
   - Repeat a recent search → observe the `Served from Cache` badge (no network request).
   - Disconnect internet → observe the error state with Retry button.
   - Search for a nonsense string → observe the empty state.

> **Note:** No build step, no `npm install`, no dependencies. This is a zero-dependency Vanilla JS application.
