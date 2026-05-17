A dark mode game discovery single page application built with vanilla JavaScript ( and the RAWG video games database API : https://rawg.io/apidocs )


---

features : 


- browse games with cover art / ratings / genres and platforms

- switch between grid view and table view 

- search by name with form validation

- filter by genre / platform / release year and minimum rating

- sort by rating / name / metacritic score and release date 

- favorites are saved to LocalStorage and persisted between sessions !

- infinite scroll        ( via IntersectionObserver )

- lazy image loading     ( via IntersectionObserver )

- user preferences       ( view mode / sort order   ) saved to LocalStorage

- full responsive design ( and is mobile friendly : ) ! ) 


---


API used : 

RAWG Video Games Database (  https://rawg.io/apidocs ) 

purpose :  Game data — list , detail , genres , platforms 


---

installation !

Prerequisites

- [Node.js] (https://nodejs.org/) v18 or higher
- A free RAWG API key from [rawg.io/apidocs](https://rawg.io/apidocs)

steps : 

1. clone the repository and open the gamevault folder !

2. open a terminal in that folder and run : npm install

3. open src / js / config.js and replace YOUR_RAWG_API_KEY_HERE with your RAWG key

4. start the dev server with: npm dev

5. open your browser and go to http://localhost:5173

to build for production run : npm run build

---

Technical Requirements  Implementation Map

1. DOM Manipulation

Selecting elements: src/js/main.js  const $ = (id) => document.getElementById(id), lines 4170
Manipulating elements: src/js/main.js  setView(), updateFavBadge(), classList.toggle(), lines 7790
Attaching events: src/js/main.js  all addEventListener calls, lines 195270

---



2. Modern JavaScript

Constants (const): used throughout  example: const state = { ... } in main.js line 32

Template literals: src/js/ui.js  buildGameCard(), buildTableRow(), renderDetailModal()

Array iteration: src/js/ui.js  games.forEach(...), Array.from({length}).map(...)

Array methods: src/js/favorites.js  .find(), .filter(), .some(), .map(), .push()

Arrow functions: used in every file, every function is written as an arrow function

Ternary operator: src/js/main.js  setView() function
Callback functions: src/js/observers.js  IntersectionObserver callback

Promises: src/js/main.js  Promise.all([fetchGenres(), fetchPlatforms()]) in initFilters()

Async & Await: src/js/api.js  apiFetch(), fetchGames()

Observer API: src/js/observers.js  IntersectionObserver used for lazy image loading and infinite scroll

---



3. Data & API

Fetch: src/js/api.js  apiFetch()

JSON manipulation: src/js/api.js  response.json(), further processed and rendered in ui.js

---


4. Storage & Validation

Form validation: src/js/main.js  validateSearch()

LocalStorage: src/js/favorites.js for favorites, src/js/storage.js for user preferences

---


5. Styling & Layout

Flexbox + CSS Grid: src/css/main.css  .games-grid, .app-layout, .toolbar

CSS: src/css/main.css and src/css/components.css

User-friendly elements: remove buttons in favorites panel, heart toggle icons, toast notifications

---


6. Tooling & Structure

Vite: vite.config.js and package.json

Folder structure: html in root , css and js separated inside src/Sources

RAWG API Documentation  rawg.io/apidocs

MDN Web Docs  IntersectionObserver API

MDN Web Docs  Fetch API

MDN Web Docs  LocalStorage

Vite Documentation  vitejs.dev

Inter font  Google Fonts

AI assistance: Claude (Anthropic)  used for code generation and structure

---