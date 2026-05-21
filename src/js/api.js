// hier halen we data op van rawg : ) ez


import { API_KEY, BASE_URL, PAGE_SIZE } from './config.js';
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


const apiFetch = async (url) => {
  const response = await fetch(url); 
  if (!response.ok) throw new Error(`API error ${response.status}: ${response.statusText}`);
  return response.json(); 
};


export const fetchGames = (params = {}) => {
  const url = buildUrl('/games', { page_size: PAGE_SIZE, ...params });
  return apiFetch(url);
};

// fetch voor full detail for a single game

export const fetchGameDetail = (id) => {
  const url = buildUrl(`/games/${id}`);
  return apiFetch(url);
};


export const fetchGenres = () => apiFetch(buildUrl('/genres'));


export const fetchPlatforms = () => apiFetch(buildUrl('/platforms/lists/parents'));

