# GameVault 🎮

A dark-mode game discovery single-page application built with vanilla JavaScript and the [RAWG Video Games Database API](https://rawg.io/apidocs).

![GameVault Screenshot](screenshots/preview.png)

---

## Features

- Browse 500 000+ games with cover art, ratings, genres, and platforms
- Switch between **grid view** and **table view** (8 columns)
- **Search** by name with form validation
- **Filter** by genre, platform, release year, and minimum rating
- **Sort** by rating, release date, name, or Metacritic score
- **Favorites** — saved to LocalStorage, persisted between sessions
- **Infinite scroll** via IntersectionObserver
- Lazy image loading via IntersectionObserver
- User preferences (view mode, sort order) saved to LocalStorage
- Fully responsive design (mobile-friendly)

---

## API Used

| API | URL | Purpose |
|-----|-----|---------|
| RAWG Video Games Database | https://rawg.io/apidocs | Game data — list, detail, genres, platforms |

---

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- A free RAWG API key from [rawg.io/apidocs](https://rawg.io/apidocs)

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd gamevault

# 2. Install dependencies
npm install

# 3. Add your API key
#    Open src/js/config.js and replace YOUR_RAWG_API_KEY_HERE

# 4. Start the dev server
npm run dev

# 5. Build for production
npm run build
```

---

## Folder Structure

```
gamevault/
├── index.html              # HTML entry point
├── vite.config.js          # Vite configuration
├── package.json
├── .gitignore
├── README.md
├── public/                 # Static assets
└── src/
    ├── css/
    │   ├── main.css        # Global styles, layout, variables
    │   └── components.css  # Card, table, modal, panel components
    └── js/
        ├── config.js       # API key + base URL
        ├── api.js          # All RAWG API calls
        ├── ui.js           # DOM rendering functions
        ├── favorites.js    # LocalStorage favorites management
        ├── storage.js      # User preferences in LocalStorage
        ├── observers.js    # IntersectionObserver (lazy load + infinite scroll)
        └── main.js         # App entry — state, events, init
```

---

## Technical Requirements — Implementation Map

### 1. DOM Manipulation
| Requirement | Location | Line |
|-------------|----------|------|
| A. Selecting elements | `src/js/main.js` | `const $ = (id) => document.getElementById(id)` — lines 41–70 |
| B. Manipulating elements | `src/js/main.js` | `setView()`, `updateFavBadge()`, `classList.toggle()` — lines 77–90 |
| C. Attaching events | `src/js/main.js` | All `addEventListener` calls — lines 195–270 |

### 2. Modern JavaScript
| Requirement | Location | Example |
|-------------|----------|---------|
| A. Constants (`const`) | Throughout | `const state = { ... }` — `main.js` line 32 |
| B. Template literals | `src/js/ui.js` | `buildGameCard()`, `buildTableRow()`, `renderDetailModal()` |
| C. Array iteration | `src/js/ui.js` | `games.forEach(...)`, `Array.from({length}).map(...)` |
| D. Array methods | `src/js/favorites.js` | `.find()`, `.filter()`, `.some()`, `.map()`, `.push()` |
| E. Arrow functions | Throughout | Every function is an arrow function |
| F. Ternary operator | `src/js/main.js` | `viewMode === 'grid' ? ... : ...` — `setView()` |
| G. Callback functions | `src/js/observers.js` | `IntersectionObserver` callback |
| H. Promises | `src/js/main.js` | `Promise.all([fetchGenres(), fetchPlatforms()])` — `initFilters()` |
| I. Async & Await | `src/js/api.js` | `apiFetch()`, `fetchGames()` |
| J. Observer API | `src/js/observers.js` | `IntersectionObserver` — lazy images + infinite scroll |

### 3. Data & API
| Requirement | Location |
|-------------|----------|
| A. Fetch | `src/js/api.js` — `apiFetch()` |
| B. JSON manipulation | `src/js/api.js` — `response.json()`, rendering in `ui.js` |

### 4. Storage & Validation
| Requirement | Location |
|-------------|----------|
| A. Form validation | `src/js/main.js` — `validateSearch()` |
| B. LocalStorage | `src/js/favorites.js` (favorites), `src/js/storage.js` (preferences) |

### 5. Styling & Layout
| Requirement | Location |
|-------------|----------|
| A. Flexbox + CSS Grid | `src/css/main.css` — `.games-grid`, `.app-layout`, `.toolbar` |
| B. CSS | `src/css/main.css`, `src/css/components.css` |
| C. User-friendly elements | Remove buttons (favorites panel), heart toggle icons, toast notifications |

### 6. Tooling & Structure
| Requirement | Location |
|-------------|----------|
| A. Vite | `vite.config.js`, `package.json` |
| B. Folder structure | See structure above — separate `html`, `css`, `js` in `src/` |

---

## Sources

- [RAWG API Documentation](https://rawg.io/apidocs)
- [MDN Web Docs — IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [MDN Web Docs — Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN Web Docs — LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Vite Documentation](https://vitejs.dev/)
- [Inter font — Google Fonts](https://fonts.google.com/specimen/Inter)
- AI assistance: Claude (Anthropic) — used for code generation and structure
