// DOM manipulation: select, manipulate, render (Technical req 1A-C)
import { isFavorite } from './favorites.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

// Ternary operator for conditional class (req 2F)
const metacriticClass = (score) =>
  score >= 75 ? 'meta-green' : score >= 50 ? 'meta-yellow' : 'meta-red';

const starIcon = `<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const heartIcon = `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

// Format date string to readable year
const releaseYear = (dateStr) => (dateStr ? dateStr.slice(0, 4) : 'N/A');

// Truncate text with ellipsis
const truncate = (str, max) => (str && str.length > max ? `${str.slice(0, max)}…` : str ?? '');

// Strip HTML tags from description (RAWG returns HTML)
const stripHtml = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html ?? '';
  return div.textContent || '';
};

// ─── Skeleton loaders ────────────────────────────────────────────────────────

export const renderSkeletons = (container, count = 20) => {
  // Template literals (req 2B) + array iteration (req 2C)
  container.innerHTML = Array.from({ length: count })
    .map(
      () => `
      <div class="skeleton-card">
        <div class="skeleton skeleton-cover"></div>
        <div class="skeleton-body">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-sub"></div>
        </div>
      </div>`
    )
    .join('');
};

// ─── Game Card (grid view) ────────────────────────────────────────────────────

const buildGenreTags = (genres) =>
  // Array method: map + slice (req 2D)
  genres
    .slice(0, 3)
    .map((g) => `<span class="genre-tag">${g.name}</span>`)
    .join('');

const buildMetacriticBadge = (score) =>
  score
    ? `<span class="metacritic-badge ${metacriticClass(score)}" title="Metacritic">MC ${score}</span>`
    : '';

// Template literal for full card HTML (req 2B)
export const buildGameCard = (game) => {
  const fav = isFavorite(game.id);
  const coverUrl = game.background_image ?? '';
  const year = releaseYear(game.released);

  const card = document.createElement('article');
  card.className = 'game-card';
  card.setAttribute('tabindex', '0');
  card.dataset.id = game.id;

  card.innerHTML = `
    ${
      coverUrl
        ? `<img class="card-cover" data-src="${coverUrl}" alt="${game.name} cover" loading="lazy" />`
        : `<div class="card-cover-placeholder">🎮</div>`
    }
    <button class="card-fav-btn ${fav ? 'is-favorite' : ''}" data-id="${game.id}" title="${fav ? 'Remove from favorites' : 'Add to favorites'}" aria-label="Toggle favorite">
      ${heartIcon}
    </button>
    <div class="card-body">
      <h3 class="card-title">${game.name}</h3>
      <div class="card-meta">
        ${
          game.rating
            ? `<span class="rating-badge">${starIcon} ${game.rating.toFixed(1)}</span>`
            : ''
        }
        ${buildMetacriticBadge(game.metacritic)}
        <span class="card-year">${year}</span>
      </div>
      <div class="card-genres">
        ${buildGenreTags(game.genres ?? [])}
      </div>
    </div>`;

  return card;
};

// ─── Game Table Row ───────────────────────────────────────────────────────────

const buildPlatformTags = (platforms) =>
  platforms
    .slice(0, 4)
    .map((p) => `<span class="platform-tag">${p.platform.name}</span>`)
    .join('');

export const buildTableRow = (game) => {
  const fav = isFavorite(game.id);
  const year = releaseYear(game.released);
  const genres = (game.genres ?? []).map((g) => g.name).join(', ') || '—';
  const metacritic = game.metacritic
    ? `<span class="metacritic-badge ${metacriticClass(game.metacritic)}">${game.metacritic}</span>`
    : '—';
  const playtime = game.playtime ? `~${game.playtime}h` : '—';

  const tr = document.createElement('tr');
  tr.dataset.id = game.id;

  tr.innerHTML = `
    <td>
      ${
        game.background_image
          ? `<img class="table-cover" data-src="${game.background_image}" alt="${game.name}" />`
          : '<div class="table-cover" style="background:var(--bg-hover)"></div>'
      }
    </td>
    <td><span class="table-name" data-id="${game.id}">${truncate(game.name, 40)}</span></td>
    <td>${game.rating ? `<span class="rating-badge">${starIcon} ${game.rating.toFixed(1)}</span>` : '—'}</td>
    <td>${year}</td>
    <td>${genres}</td>
    <td><div class="table-platforms">${buildPlatformTags(game.platforms ?? [])}</div></td>
    <td>${metacritic}</td>
    <td>${playtime}</td>
    <td>
      <div class="table-actions">
        <button class="btn btn-ghost btn-sm card-fav-btn ${fav ? 'is-favorite' : ''}" data-id="${game.id}" title="Toggle favorite">${heartIcon}</button>
        <button class="btn btn-ghost btn-sm open-detail-btn" data-id="${game.id}" title="View details">Detail</button>
      </div>
    </td>`;

  return tr;
};

// ─── Render lists ─────────────────────────────────────────────────────────────

// DOM manipulation: element manipulation (req 1B)
export const renderGrid = (games, container, append = false) => {
  if (!append) container.innerHTML = '';

  if (games.length === 0 && !append) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">🔍</div>
        <h3>No games found</h3>
        <p>Try different filters or search terms.</p>
      </div>`;
    return;
  }

  // Array method: forEach (req 2D)
  games.forEach((game) => container.appendChild(buildGameCard(game)));
};

export const renderTable = (games, tbody, append = false) => {
  if (!append) tbody.innerHTML = '';

  if (games.length === 0 && !append) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-secondary)">No games found.</td></tr>`;
    return;
  }

  games.forEach((game) => tbody.appendChild(buildTableRow(game)));
};

// ─── Game Detail Modal ────────────────────────────────────────────────────────

export const renderDetailModal = (game) => {
  const fav = isFavorite(game.id);
  const description = truncate(stripHtml(game.description), 600);
  const platforms = (game.platforms ?? []).map((p) => p.platform.name).join(', ') || 'N/A';
  const genres = (game.genres ?? []).map((g) => g.name).join(', ') || 'N/A';
  const tags = (game.tags ?? []).slice(0, 10).map((t) => `<span class="detail-tag">${t.name}</span>`).join('');
  const esrb = game.esrb_rating?.name ?? 'Not Rated';

  // Template literal (req 2B)
  return `
    ${game.background_image ? `<img class="detail-hero" src="${game.background_image}" alt="${game.name}" />` : ''}
    <div class="detail-header">
      <h2 class="detail-title">${game.name}</h2>
      <div class="detail-badges">
        ${game.rating ? `<span class="detail-rating">${starIcon} ${game.rating.toFixed(1)} / 5</span>` : ''}
        ${game.metacritic ? `<span class="metacritic-badge ${metacriticClass(game.metacritic)}">Metacritic: ${game.metacritic}</span>` : ''}
        <button class="detail-fav-btn ${fav ? 'is-favorite' : ''}" data-id="${game.id}">
          ${heartIcon}
          ${fav ? 'In Favorites' : 'Add to Favorites'}
        </button>
      </div>
    </div>

    <div class="detail-grid">
      <div class="detail-info-block">
        <div class="detail-info-label">Released</div>
        <div class="detail-info-value">${game.released ?? 'N/A'}</div>
      </div>
      <div class="detail-info-block">
        <div class="detail-info-label">Playtime</div>
        <div class="detail-info-value">${game.playtime ? `~${game.playtime} hours` : 'N/A'}</div>
      </div>
      <div class="detail-info-block">
        <div class="detail-info-label">Genres</div>
        <div class="detail-info-value">${genres}</div>
      </div>
      <div class="detail-info-block">
        <div class="detail-info-label">ESRB Rating</div>
        <div class="detail-info-value">${esrb}</div>
      </div>
      <div class="detail-info-block" style="grid-column:1/-1">
        <div class="detail-info-label">Platforms</div>
        <div class="detail-info-value">${platforms}</div>
      </div>
    </div>

    ${description ? `<p class="detail-description">${description}</p>` : ''}

    ${tags ? `<div><div class="detail-info-label" style="margin-bottom:8px">Tags</div><div class="detail-tags">${tags}</div></div>` : ''}`;
};

// ─── Favorites Panel ──────────────────────────────────────────────────────────

export const renderFavoritesPanel = (favorites, container, onRemove) => {
  if (favorites.length === 0) {
    container.innerHTML = `
      <div class="fav-empty">
        <div class="fav-empty-icon">♡</div>
        <p>No favorites yet.<br/>Click the heart icon on any game.</p>
      </div>`;
    return;
  }

  // Array method: map to build HTML, then join (req 2D)
  container.innerHTML = favorites
    .map(
      (game) => `
      <div class="fav-item" data-id="${game.id}">
        ${
          game.background_image
            ? `<img class="fav-cover" src="${game.background_image}" alt="${game.name}" />`
            : '<div class="fav-cover"></div>'
        }
        <div class="fav-info">
          <div class="fav-title">${game.name}</div>
          <div class="fav-meta">${releaseYear(game.released)} · ⭐ ${game.rating?.toFixed(1) ?? 'N/A'}</div>
        </div>
        <button class="fav-remove" data-id="${game.id}" title="Remove from favorites" aria-label="Remove ${game.name}">&times;</button>
      </div>`
    )
    .join('');

  // DOM: attach remove event listeners (req 1C)
  container.querySelectorAll('.fav-remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onRemove(Number(btn.dataset.id));
    });
  });
};

// ─── Toast notifications ──────────────────────────────────────────────────────

export const showToast = (message, type = 'default') => {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  // Auto-remove after animation (3 seconds)
  setTimeout(() => toast.remove(), 3100);
};

// ─── Filter dropdowns ─────────────────────────────────────────────────────────

export const populateSelect = (select, items, valueKey, labelKey) => {
  // Array method: forEach to build options (req 2D)
  items.forEach((item) => {
    const opt = document.createElement('option');
    opt.value = item[valueKey];
    opt.textContent = item[labelKey];
    select.appendChild(opt);
  });
};
