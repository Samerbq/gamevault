// het hart van de app bij wijze van spreken : ) ( alles is samengebracht ) 

// bij deze gedeelde werd ik wel geholpen van Ai om een goede prestatie te hebben op mijn website en wil deze namelijk nog later gebruiken en zelfs beter maken om dit te hebben op mijn public github ( claude )

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

// app state 

const state = {
  games: [],
  currentPage: 1,
  hasNextPage: true,
  isLoading: false,
  filters: {
    search: '',
    genres: '',
    parent_platforms: '',
    dates: '',                   // "YYYY-MM-DD,YYYY-MM-DD  -> op deze manier had ik het gevraagd aan Ai en dat werkt goed voor de api"
    ordering: '-added',
    rating: 0,
  },
};

// dom elements selectie

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

// view mode 


let viewMode = getPrefs().viewMode; // 'grid' | 'list'
let scrollObserver = null;

// utility ( lol geen grenades )

// dom manipulation


const setView = (mode) => {
  viewMode = mode;
  savePref('viewMode', mode);

  gamesGrid.classList.toggle('hidden', mode !== 'grid');
  gamesTableWrapper.classList.toggle('hidden', mode !== 'list');

  gridViewBtn.classList.toggle('active', mode === 'grid');
  listViewBtn.classList.toggle('active', mode === 'list');
};

const updateFavBadge = () => {
  const count = getFavorites().length;
  favCount.textContent = `${count}`;
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


const validateSearch = (value) => {
  if (value.length === 1) {
    searchError.textContent = 'Enter at least 2 characters.';
    return false;
  }
  searchError.textContent = '';
  return true;
};

const buildParams = (page = 1) => {
  const p = {
    page,
    ordering: state.filters.ordering,
  };
  if (state.filters.search)           p.search = state.filters.search;
  if (state.filters.genres)           p.genres = state.filters.genres;
  if (state.filters.parent_platforms) p.parent_platforms = state.filters.parent_platforms;
  if (state.filters.dates)            p.dates = state.filters.dates;
  if (state.filters.rating > 0)       p.rating = `${state.filters.rating},5`;
  return p;
};


const renderGames = (games, append = false) => {
  if (viewMode === 'grid') {
    renderGrid(games, gamesGrid, append);
  } else {
    renderTable(games, gamesTableBody, append);
  }
  setupLazyImages(); // Observer API (req 2J)
};


const loadGames = async () => {
  if (state.isLoading) return;
  state.isLoading = true;
  state.currentPage = 1;
  state.games = [];

  showLoading(true);
  renderSkeletons(gamesGrid);
  gamesGrid.classList.remove('hidden');
  gamesTableWrapper.classList.add('hidden'); // hide table during skeleton yeah . . 

  try {
    const data = await fetchGames(buildParams(1)); 
    state.games = data.results;
    state.hasNextPage = Boolean(data.next);

    setView(viewMode); 

    if (state.games.length === 0) {
      gamesGrid.classList.remove('hidden');
      gamesTableWrapper.classList.add('hidden');
    }

    renderGames(state.games, false);

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

const loadMore = async () => {
  if (state.isLoading || !state.hasNextPage) return;
  state.isLoading = true;
  state.currentPage += 1;

  loadMoreSpinner.classList.remove('hidden');

  try {
    const data = await fetchGames(buildParams(state.currentPage));
    state.games.push(...data.results); 
    state.hasNextPage = Boolean(data.next);
    renderGames(data.results, true);       
    setupLazyImages();
    resultsCount.innerHTML = `Showing <strong>${state.games.length}</strong> of <strong>${data.count.toLocaleString()}</strong> games`;
  } catch (err) {
    showToast('Failed to load more games.', 'danger');
  } finally {
    loadMoreSpinner.classList.add('hidden');
    state.isLoading = false;
  }
};

// game detail modal
const openDetail = async (id) => {
  modalContent.innerHTML = '<div style="padding:40px;text-align:center"><div class="spinner"></div></div>';
  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  try {
    const game = await fetchGameDetail(id);
    modalContent.innerHTML = renderDetailModal(game);

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

const handleFavToggle = (game, btn) => {
  const nowFav = toggleFavorite(game);
  updateFavBadge();

  btn.classList.toggle('is-favorite', nowFav);
  if (btn.classList.contains('detail-fav-btn')) {
    btn.innerHTML = `${heartIcon} ${nowFav ? 'In Favorites' : 'Add to Favorites'}`;
  }
  showToast(nowFav ? `Added "${game.name}" to favorites` : `Removed from favorites`, nowFav ? 'success' : 'danger');
};

// heart icon ( is een svg die ik zelf heb gemaakt )
const heartIcon = `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

const updateFavButtons = (id) => {
  const numId = Number(id);
  const isFav = isFavorite(numId);
  document.querySelectorAll(`[data-id="${numId}"].card-fav-btn`).forEach((btn) => {
    btn.classList.toggle('is-favorite', isFav);
  });
};


const handleGameAreaClick = async (e) => {
  const adultOverlay = e.target.closest('[data-adult-overlay]');
  if (adultOverlay) {
    adultOverlay.remove();
    return;
  }

  const favBtn = e.target.closest('.card-fav-btn');
  const detailBtn = e.target.closest('.open-detail-btn');
  const nameBtn = e.target.closest('.table-name');
  const card = e.target.closest('.game-card');

  if (favBtn) {
    e.stopPropagation();
    const id = Number(favBtn.dataset.id);
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

const initFilters = async () => {
  try {
    const [genresData, platformsData] = await Promise.all([fetchGenres(), fetchPlatforms()]);
    populateSelect(genreFilter, genresData.results, 'slug', 'name');
    populateSelect(platformFilter, platformsData.results, 'id', 'name');
  } catch {
  }
};

const applyFilterValues = () => {
  state.filters.genres = genreFilter.value;
  state.filters.parent_platforms = platformFilter.value;
  const from = yearFrom.value;
  const to   = yearTo.value;
  state.filters.dates = from && to ? `${from}-01-01,${to}-12-31` : '';

  state.filters.rating = parseFloat(ratingFilter.value) || 0;
  loadGames();
};

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = searchInput.value.trim();
  if (!validateSearch(val)) return;
  state.filters.search = val;
  loadGames();
});


ratingFilter.addEventListener('input', () => {
  const v = parseFloat(ratingFilter.value);
  ratingValue.textContent = v > 0 ? `${v}+` : 'Any';
});

// is een sort order change 

sortSelect.addEventListener('change', () => {
  state.filters.ordering = sortSelect.value;
  savePref('ordering', sortSelect.value);
  loadGames();
});

gridViewBtn.addEventListener('click', () => setView('grid'));
listViewBtn.addEventListener('click', () => setView('list'));

applyFilters.addEventListener('click', applyFilterValues);

clearFilters.addEventListener('click', () => {
  genreFilter.value = '';
  platformFilter.value = '';
  yearFrom.value = '';
  yearTo.value = '';
  ratingFilter.value = 0;
  ratingValue.textContent = 'Any';
  searchInput.value = '';
  searchError.textContent = '';
  state.filters = { search: '', genres: '', parent_platforms: '', dates: '', ordering: '-added', rating: 0 };
  sortSelect.value = '-added';
  loadGames();
});

retryBtn.addEventListener('click', loadGames);

document.querySelector('.games-table thead').addEventListener('click', (e) => {
  const th = e.target.closest('th.sortable');
  if (!th) return;
  const col = th.dataset.col;
  state.filters.ordering = col;
  sortSelect.value = col;
  savePref('ordering', col);
  loadGames();
});

gamesGrid.addEventListener('click', handleGameAreaClick);
gamesTableBody.addEventListener('click', handleGameAreaClick);

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

favoritesBtn.addEventListener('click', openFavorites);
closeFavoritesBtn.addEventListener('click', closeFavorites);
favoritesOverlay.addEventListener('click', (e) => {
  if (e.target === favoritesOverlay) closeFavorites();
});

document.querySelector('.nav-brand').addEventListener('click', () => {
  searchInput.value = '';
  searchError.textContent = '';
  genreFilter.value = '';
  platformFilter.value = '';
  yearFrom.value = '';
  yearTo.value = '';
  ratingFilter.value = 0;
  ratingValue.textContent = 'Any';
  state.filters = { search: '', genres: '', parent_platforms: '', dates: '', ordering: '-added', rating: 0 };
  sortSelect.value = '-added';
  loadGames();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeFavorites();
  }
});

const restorePrefs = () => {
  const prefs = getPrefs();
  // Restore sort preference
  if (prefs.ordering) {
    state.filters.ordering = prefs.ordering;
    sortSelect.value = prefs.ordering;
  }
  setView(prefs.viewMode);
};

const init = async () => {
  restorePrefs();
  updateFavBadge();

  await Promise.all([initFilters(), loadGames()]);

  scrollObserver = setupInfiniteScroll(loadMoreTrigger, loadMore);
};

init();
