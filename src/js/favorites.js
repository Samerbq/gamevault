// Personalisation: favorites saved to LocalStorage (Technical req 4B, Functional req 3A-C)
const STORAGE_KEY = 'gamevault_favorites';

// Return parsed array from localStorage, or empty array
export const getFavorites = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const persistFavorites = (list) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

export const addFavorite = (game) => {
  const favs = getFavorites();
  // Array method: find (req 2D) — avoid duplicates
  if (!favs.find((f) => f.id === game.id)) {
    favs.push(game);
    persistFavorites(favs);
  }
};

export const removeFavorite = (id) => {
  // Array method: filter (req 2D)
  const updated = getFavorites().filter((f) => f.id !== id);
  persistFavorites(updated);
};

export const isFavorite = (id) =>
  // Array method: some (req 2D)
  getFavorites().some((f) => f.id === id);

export const toggleFavorite = (game) => {
  // Ternary operator (req 2F)
  isFavorite(game.id) ? removeFavorite(game.id) : addFavorite(game);
  return isFavorite(game.id); // true = now a favorite
};
