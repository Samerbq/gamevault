// Storage & validation: LocalStorage for user preferences (Technical req 4B)
const PREFS_KEY = 'gamevault_preferences';

const DEFAULT_PREFS = {
  viewMode: 'grid',   // 'grid' | 'list'
  ordering: '-rating',
};

export const getPrefs = () => {
  const stored = localStorage.getItem(PREFS_KEY);
  // Array methods: spread to merge defaults (req 2D)
  return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : { ...DEFAULT_PREFS };
};

export const savePref = (key, value) => {
  const prefs = getPrefs();
  prefs[key] = value;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
};
