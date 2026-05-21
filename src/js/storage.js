// onthoudt je settings ( ook LocalStorage )

const PREFS_KEY = 'gamevault_preferences';

const DEFAULT_PREFS = {
  viewMode: 'grid', 
  ordering: '-added',
};

export const getPrefs = () => {
  const stored = localStorage.getItem(PREFS_KEY);
  return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : { ...DEFAULT_PREFS };
};

export const savePref = (key, value) => {
  const prefs = getPrefs();
  prefs[key] = value;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
};
