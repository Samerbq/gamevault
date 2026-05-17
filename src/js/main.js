// App entry point — ties all modules together
// DOM manipulation: select, manipulate, events (Technical req 1A-C)
// Modern JS: constants, arrow functions, template literals, etc. (req 2A-J)

import { fetchGames, fetchGameDetail, fetchGenres, fetchPlatforms } from './api.js';
import {
  renderGrid,
  renderTable,
  renderSkeletons,
  renderDetailModal,
  renderFavoritesPanel,
  populateSelect,
  showToast,
} from './ui.js';
import { getFavorites, isFavorite, toggleFavorite } from './favorites.js';
import { getPrefs, savePref } from './storage.js';
import { setupLazyImages, setupInfiniteScroll } from './observers.js';

// ─── App state (constants, req 2A) ───────────────────────────────────────────
const state = {
  games: [],
  currentPage: 1,
  hasNextPage: true,
  isLoading: false,
  filters: {
    search: '',
    genres: '',
    parent_platforms: '',
    dates: '',       // "YYYY-MM-DD,YYYY-MM-DD"
    ordering: '-rating',
    rating: 0,
  },
};

// ─── DOM element selection (req 1A) ─────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const searchForm      = $('searchForm');
const searchInput     = $('searchInput');
const searchError     = $('searchError');
const genreFilter     = $('genreFilter');
const platformFilter  = $('platformFilter');
const yearFrom        = $('yearFrom');
const yearTo          = $('yearTo');
const ratingFilter    = $('ratingFilter');
const ratingValue     = $('ratingValue');
const applyFilters    = $('applyFilters');
const clearFilters    = $('clearFilters');
const sortSelect      = $('sortSelect');
const gridViewBtn     = $('gridViewBtn');
const listViewBtn     = $('listViewBtn');
const gamesGrid       = $('gamesGrid');
const gamesTableWrapper = $('gamesTableWrapper');
const gamesTableBody  = $('gamesTableBody');
const loadingState    = $('loadingState');
const errorState      = $('errorState');
const errorMessage    = $('errorMessage');
const retryBtn        = $('retryBtn');
const resultsCount    = $('resultsCount');
const loadMoreTrigger = $('loadMoreTrigger');
const loadMoreSpinner = $('loadMoreSpinner');
const modalOverlay    = $('modalOverlay');
const modalClose      = $('modalClose');
const modalContent    = $('modalContent');
const favoritesBtn    = $('favoritesBtn');
const favCount        = $('favCount');
const favoritesOverlay = $('favoritesOverlay');
const closeFavoritesBtn = $('closeFavoritesBtn');
const favoritesList   = $('favoritesList');

// ─── View mode (from persisted prefs) ────────────────────────────────────────
let viewMode = getPrefs().viewMode; // 'grid' | 'list'
let scrollObserver = null;

// ─── Utility ─────────────────────────────────────────────────────────────────

// DOM manipulation: manipulate elements (req 1B)
const setView = (mode) => {
  viewMode = mode;
  savePref('viewMode', mode);

  // Ternary operator (req 2F)
  gamesGrid.classList.toggle('hidden', mode !== 'grid');
  gamesTableWrapper.classList.toggle('hidden', mode !== 'list');

  gridViewBtn.classList.toggle('active', mode === 'grid');
  listViewBtn.classList.toggle('active', mode === 'list');
};

const updateFavBadge = () => {
  const count = getFavorites().length;
  // Template literal (req 2B)
  favCount.textContent = `${count}`;
  favCount.classList.toggle('hidden', count === 0);
};

const showLoading = (initial = false) => {
  loadingState.classList.toggle('hidden', !initial);
  loadMoreSpinner.classList.toggle('hidden', initial);
  errorState.classList.add('hidden');
};

const hideLoading = () => {
  loadingState.classList.add('hidden');
  loadMoreSpinner.classList.add('hidden');
};

// ─── Search form validation (Technical req 4A) ────────────────────────────────
const validateSearch = (value) => {
  if (value.length === 1) {
    searchError.textContent = 'Enter at least 2 characters.';
    return false;
  }
  searchError.textContent = '';
  return true;
};

// ─── Build API params from current state ─────────────────────────────────────
const buildParams = (page = 1) => {
  const p = {
    page,
    ordering: state.filters.ordering,
  };
  // Conditional params (req 2F ternary / truthy checks)
  if (state.filters.search)           p.search = state.filters.search;
  if (state.filters.genres)           p.genres = state.filters.genres;
  if (state.filters.parent_platforms) p.parent_platforms = state.filters.parent_platforms;
  if (state.filters.dates)            p.dates = state.filters.dates;
  if (state.filters.rating > 0)       p.rating = `${state.filters.rating},5`;
  return p;
};

// ─── Render current game list to active view ─────────────────────────────────
const renderGames = (games, append = false) => {
  if (viewMode === 'grid') {
    renderGrid(games, gamesGrid, append);
  } else {
    renderTable(games, gamesTableBody, append);
  }
  setupLazyImages(); // Observer API (req 2J)
};

// ─── Load (first page) ───────────────────────────────────────────────────────
const loadGames = async () => {
  if (state.isLoading) return;
  state.isLoading = true;
  state.currentPage = 1;
  state.games = [];

  showLoading(true);
  renderSkeletons(gamesGrid);
  gamesGrid.classList.remove('hidden');
  gamesTableWrapper.classList.add('hidden'); // hide table during skeleton

  try {
    const data = await fetchGames(buildParams(1)); // async/await (req 2I), Promises (req 2H)
    state.games = data.results;
    state.hasNextPage = Boolean(data.next);

    setView(viewMode); // restore correct view

    if (state.games.length === 0) {
      gamesGrid.classList.remove('hidden');
      gamesTableWrapper.classList.add('hidden');
    }

    renderGames(state.games, false);

    // Template literal for count display (req 2B)
    resultsCount.innerHTML = `Showing <strong>${state.games.length}</strong> of <strong>${data.count.toLocaleString()}</strong> games`;
  } catch (err) {
    console.error(err);
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
    errorMessage.textContent = err.message.includes('YOUR_RAWG')
      ? 'Please set your RAWG API key in src/js/config.js'
      : err.message;
  } finally {
    hideLoading();
    state.isLoading = false;
  }
};

// ─── Load next page (infinite scroll) ───────────────────────────────────────
const loadMore = async () => {
  if (state.isLoading || !state.hasNextPage) return;
  state.isLoading = true;
  state.currentPage += 1;

  loadMoreSpinner.classList.remove('hidden');

  try {
    const data = await fetchGames(buildParams(state.currentPage));
    state.games.push(...data.results);      // array spread (req 2C)
    state.hasNextPage = Boolean(data.next);
    renderGames(data.results, true);        // append = true
    setupLazyImages();
    resultsCount.innerHTML = `Showing <strong>${state.games.length}</strong> of <strong>${data.count.toLocaleString()}</strong> games`;
  } catch (err) {
    showToast('Failed to load more games.', 'danger');
  } finally {
    loadMoreSpinner.classList.add('hidden');
    state.isLoading = false;
  }
};

// ─── Game detail modal ───────────────────────────────────────────────────────
const openDetail = async (id) => {
  modalContent.innerHTML = '<div style="padding:40px;text-align:center"><div class="spinner"></div></div>';
  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  try {
    const game = await fetchGameDetail(id);
    modalContent.innerHTML = renderDetailModal(game);

    // DOM: attach event to the favorite button inside the modal (req 1C)
    const detailFavBtn = modalContent.querySelector('.detail-fav-btn');
    if (detailFavBtn) {
      detailFavBtn.addEventListener('click', () => handleFavToggle(game, detailFavBtn));
    }
  } catch (err) {
    modalContent.innerHTML = `<p style="color:var(--danger);padding:24px">${err.message}</p>`;
  }
};

const closeModal = () => {
  modalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
};

// ─── Favorites panel ─────────────────────────────────────────────────────────
const openFavorites = () => {
  refreshFavoritesPanel();
  favoritesOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

const closeFavorites = () => {
  favoritesOverlay.classList.add('hidden');
  document.body.style.overflow = '';
};

const refreshFavoritesPanel = () => {
  renderFavoritesPanel(getFavorites(), favoritesList, (id) => {
    toggleFavorite({ id });
    updateFavBadge();
    refreshFavoritesPanel();
    updateFavButtons(id);
    showToast('Removed from favorites.', 'danger');
  });
};

// ─── Favorite toggle (used from card, table, and modal) ──────────────────────
const handleFavToggle = (game, btn) => {
  const nowFav = toggleFavorite(game);
  updateFavBadge();
  // Update button appearance immediately (DOM manipulation req 1B)
  btn.classList.toggle('is-favorite', nowFav);
  if (btn.classList.contains('detail-fav-btn')) {
    btn.innerHTML = `${heartIcon} ${nowFav ? 'In Favorites' : 'Add to Favorites'}`;
  }
  showToast(nowFav ? `Added "${game.name}" to favorites` : `Removed from favorites`, nowFav ? 'success' : 'danger');
};

// Heart icon SVG (re-used in detail toggle)
const heartIcon = `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

// Sync all visible heart buttons for a given game id after toggle
const updateFavButtons = (id) => {
  const numId = Number(id);
  const isFav = isFavorite(numId);
  document.querySelectorAll(`[data-id="${numId}"].card-fav-btn`).forEach((btn) => {
    btn.classList.toggle('is-favorite', isFav);
  });
};

// ─── Event delegation: card clicks ───────────────────────────────────────────
// DOM: events attached to elements (req 1C)
const handleGameAreaClick = async (e) => {
  const favBtn = e.target.closest('.card-fav-btn');
  const detailBtn = e.target.closest('.open-detail-btn');
  const nameBtn = e.target.closest('.table-name');
  const card = e.target.closest('.game-card');

  if (favBtn) {
    e.stopPropagation();
    const id = Number(favBtn.dataset.id);
    // Find game from state (array method: find, req 2D)
    const game = state.games.find((g) => g.id === id) ?? { id };
    handleFavToggle(game, favBtn);
    updateFavButtons(id);
    return;
  }

  if (detailBtn || nameBtn) {
    const id = Number((detailBtn ?? nameBtn).dataset.id);
    await openDetail(id);
    return;
  }

  if (card) {
    const id = Number(card.dataset.id);
    await openDetail(id);
  }
};

// ─── Populate filter dropdowns ───────────────────────────────────────────────
const initFilters = async () => {
  try {
    // Fetch genres and platforms in parallel (Promises, req 2H)
    const [genresData, platformsData] = await Promise.all([fetchGenres(), fetchPlatforms()]);
    populateSelect(genreFilter, genresData.results, 'slug', 'name');
    populateSelect(platformFilter, platformsData.results, 'id', 'name');
  } catch {
    // Non-critical — filters just won't have options
  }
};

// ─── Filter application ───────────────────────────────────────────────────────
const applyFilterValues = () => {
  state.filters.genres = genreFilter.value;
  state.filters.parent_platforms = platformFilter.value;

  // Build date range string for RAWG (req 2B template literal)
  const from = yearFrom.value;
  const to   = yearTo.value;
  state.filters.dates = from && to ? `${from}-01-01,${to}-12-31` : '';

  state.filters.rating = parseFloat(ratingFilter.value) || 0;
  loadGames();
};

// ─── Event listeners (DOM req 1C) ─────────────────────────────────────────────

// Search submit — includes form validation (req 4A)
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = searchInput.value.trim();
  if (!validateSearch(val)) return;
  state.filters.search = val;
  loadGames();
});

// Live rating label update
ratingFilter.addEventListener('input', () => {
  const v = parseFloat(ratingFilter.value);
  // Ternary (req 2F)
  ratingValue.textContent = v > 0 ? `${v}+` : 'Any';
});

// Sort order change
sortSelect.addEventListener('change', () => {
  state.filters.ordering = sortSelect.value;
  savePref('ordering', sortSelect.value);
  loadGames();
});

// View toggle
gridViewBtn.addEventListener('click', () => setView('grid'));
listViewBtn.addEventListener('click', () => setView('list'));

// Apply filters button
applyFilters.addEventListener('click', applyFilterValues);

// Clear all filters
clearFilters.addEventListener('click', () => {
  genreFilter.value = '';
  platformFilter.value = '';
  yearFrom.value = '';
  yearTo.value = '';
  ratingFilter.value = 0;
  ratingValue.textContent = 'Any';
  searchInput.value = '';
  searchError.textContent = '';
  state.filters = { search: '', genres: '', parent_platforms: '', dates: '', ordering: state.filters.ordering, rating: 0 };
  loadGames();
});

// Retry on error
retryBtn.addEventListener('click', loadGames);

// Table column header sort click
document.querySelector('.games-table thead').addEventListener('click', (e) => {
  const th = e.target.closest('th.sortable');
  if (!th) return;
  const col = th.dataset.col;
  state.filters.ordering = col;
  sortSelect.value = col;
  savePref('ordering', col);
  loadGames();
});

// Event delegation on game containers (req 1C)
gamesGrid.addEventListener('click', handleGameAreaClick);
gamesTableBody.addEventListener('click', handleGameAreaClick);

// Modal close
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Favorites panel
favoritesBtn.addEventListener('click', openFavorites);
closeFavoritesBtn.addEventListener('click', closeFavorites);
favoritesOverlay.addEventListener('click', (e) => {
  if (e.target === favoritesOverlay) closeFavorites();
});

// Keyboard: close modal/panel on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeFavorites();
  }
});

// ─── Restore persisted preferences ───────────────────────────────────────────
const restorePrefs = () => {
  const prefs = getPrefs();
  // Restore sort preference
  if (prefs.ordering) {
    state.filters.ordering = prefs.ordering;
    sortSelect.value = prefs.ordering;
  }
  setView(prefs.viewMode);
};

// ─── Initialise ───────────────────────────────────────────────────────────────
const init = async () => {
  restorePrefs();
  updateFavBadge();

  // Parallel init (Promises, req 2H)
  await Promise.all([initFilters(), loadGames()]);

  // IntersectionObserver for infinite scroll (req 2J)
  scrollObserver = setupInfiniteScroll(loadMoreTrigger, loadMore);
};

init();
