// Data & API: Fetch + JSON manipulation (Technical req 3A, 3B)
import { API_KEY, BASE_URL, PAGE_SIZE } from './config.js';

// Build a URL with query params, always appending the API key
const buildUrl = (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('key', API_KEY);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) {
      url.searchParams.set(k, v);
    }
  });
  return url.toString();
};

// Shared fetch wrapper — throws with a readable message on failure
const apiFetch = async (url) => {
  const response = await fetch(url); // Promises + async/await (req 2H, 2I)
  if (!response.ok) throw new Error(`API error ${response.status}: ${response.statusText}`);
  return response.json(); // JSON manipulation (req 3B)
};

// Fetch paginated list of games with optional filters/search/sort
export const fetchGames = (params = {}) => {
  const url = buildUrl('/games', { page_size: PAGE_SIZE, ...params });
  return apiFetch(url);
};

// Fetch full detail for a single game
export const fetchGameDetail = (id) => {
  const url = buildUrl(`/games/${id}`);
  return apiFetch(url);
};

// Fetch all genres for filter dropdown
export const fetchGenres = () => apiFetch(buildUrl('/genres'));

// Fetch parent platforms for filter dropdown
export const fetchPlatforms = () => apiFetch(buildUrl('/platforms/lists/parents'));

// Fetch trailers/clips for a game (may be empty for many games)
export const fetchGameMovies = (id) => apiFetch(buildUrl(`/games/${id}/movies`));
