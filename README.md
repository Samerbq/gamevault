```
 ██████╗  █████╗ ███╗   ███╗███████╗██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗
██╔════╝ ██╔══██╗████╗ ████║██╔════╝██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝
██║  ███╗███████║██╔████╔██║█████╗  ██║   ██║███████║██║   ██║██║     ██║
██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  ╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║
╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗ ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║
 ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝
```

> a dark-mode game discovery single-page application — vanilla javascript · rawg api

---

$\color{green}{\texttt{◆ FEATURES}}$

```
  →  browse 900,000+ games with cover art / ratings / genres / platforms
  →  grid view  /  table view  ( 8 columns )
  →  search by name  ( with form validation )
  →  filter  →  genre / platform / release year / minimum rating
  →  sort    →  popularity / metacritic / rating / release date / name
  →  favorites saved to localStorage — persisted between sessions
  →  infinite scroll via IntersectionObserver
  →  lazy image loading via IntersectionObserver
  →  user preferences ( view mode / sort order ) saved to localStorage
  →  adult content filter — blur overlay on explicit games
  →  game trailers in detail view ( via rawg )
  →  playtime linked to howlongtobeat.com
  →  fully responsive — mobile friendly
```

---

$\color{green}{\texttt{◆ API}}$

```
  rawg video games database
  →  rawg.io/apidocs
  →  used for : game list / detail / genres / platforms / trailers
```

---

$\color{green}{\texttt{◆ INSTALLATION}}$

```bash
# prerequisites
#   node.js v18+  →  nodejs.org
#   rawg api key  →  rawg.io/apidocs  ( free )

# 1 — clone and enter the folder
git clone https://github.com/Samerbq/gamevault.git
cd gamevault

# 2 — install dependencies
npm install

# 3 — add your api key
#     open  src/js/config.js
#     replace  YOUR_RAWG_API_KEY_HERE  with your key

# 4 — start dev server
npm run dev
#     open browser at  http://localhost:5173

# 5 — build for production
npm run build
```

---

$\color{green}{\texttt{◆ TECHNICAL REQUIREMENTS}}$

$\color{violet}{\texttt{1. DOM manipulation}}$

```
  selecting elements     →  main.js       const $ = (id) => document.getElementById(id)   ln 41-70
  manipulating elements  →  main.js       setView() / updateFavBadge() / classList.toggle()  ln 77-90
  attaching events       →  main.js       all addEventListener calls   ln 195-270
```

$\color{violet}{\texttt{2. modern javascript}}$

```
  const / let            →  throughout all files
  template literals      →  ui.js         buildGameCard() / buildTableRow() / renderDetailModal()
  array iteration        →  ui.js         games.forEach() / Array.from().map()
  array methods          →  favorites.js  .find() / .filter() / .some() / .map() / .push()
  arrow functions        →  every file    every function is written as an arrow function
  ternary operator       →  main.js       setView() function
  callback functions     →  observers.js  IntersectionObserver callback
  promises               →  main.js       Promise.all([fetchGenres(), fetchPlatforms()])
  async / await          →  api.js        apiFetch() / fetchGames()
  observer api           →  observers.js  IntersectionObserver — lazy loading + infinite scroll
```

$\color{violet}{\texttt{3. data \& api}}$

```
  fetch                  →  api.js        apiFetch()
  json manipulation      →  api.js        response.json() — rendered in ui.js
```

$\color{violet}{\texttt{4. storage \& validation}}$

```
  form validation        →  main.js       validateSearch()
  localstorage           →  favorites.js  ( favorites )
                         →  storage.js    ( user preferences )
```

$\color{violet}{\texttt{5. styling \& layout}}$

```
  flexbox + css grid     →  main.css      .games-grid / .app-layout / .toolbar
  css                    →  main.css + components.css
  user-friendly          →  remove buttons / heart toggle icons / toast notifications
```

$\color{violet}{\texttt{6. tooling \& structure}}$

```
  vite                   →  vite.config.js / package.json
  folder structure       →  html in root / css + js separated inside src/
```

---

$\color{green}{\texttt{◆ SOURCES}}$

```
  rawg api           →  rawg.io/apidocs
  howlongtobeat      →  howlongtobeat.com         ( playtime reference )
  mdn fetch          →  developer.mozilla.org     ( Fetch API )
  mdn observer       →  developer.mozilla.org     ( IntersectionObserver )
  mdn localstorage   →  developer.mozilla.org     ( localStorage )
  vite               →  vitejs.dev
  inter font         →  fonts.google.com
  ai assistance      →  claude ( anthropic )      ( code generation and structure )
```
