// hier beheren we de favorieten ( is met LocalStorage )


const STORAGE_KEY = 'gamevault_favorites';


export const getFavorites = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const persistFavorites = (list) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

export const addFavorite = (game) => {
  const favs = getFavorites();
  if (!favs.find((f) => f.id === game.id)) {
    favs.push(game);
    persistFavorites(favs);
  }
};

export const removeFavorite = (id) => {
  const updated = getFavorites().filter((f) => f.id !== id);
  persistFavorites(updated);
};

export const isFavorite = (id) =>
  getFavorites().some((f) => f.id === id);

export const toggleFavorite = (game) => {
  isFavorite(game.id) ? removeFavorite(game.id) : addFavorite(game);
  return isFavorite(game.id);
};
