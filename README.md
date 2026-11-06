# PokéWordle

Three browser games for testing how well you know your Pokémon, built with React. The games run on its own backend, [pokewordle-api](https://github.com/sashasagebd/pokewordle-api), which holds the answers (so they can't be read from the page) and is seeded from the free [PokéAPI](https://pokeapi.co/).

**Play it at [pokewordle.sashasagebd.com](https://pokewordle.sashasagebd.com/)**

## Game modes

### PokéWordle
Guess the mystery Pokémon. Each guess shows how its height, weight and types compare to the answer, with arrows pointing toward the right height and weight. Keep guessing until you find it.

### Higher or Lower
Two Pokémon side by side: is the second one taller (or heavier) than the first? Switch between height and weight at any time. Every right answer adds to your streak; one wrong answer ends it and starts a new game.

### Who's That Pokémon?
Name the Pokémon from its silhouette. You get one guess: right and your streak grows, wrong and it ends. You can also give up to see the answer. The silhouette is drawn by the server, so the answer isn't hidden anywhere in the page.

## Features

- **Generation filter.** Pick any mix of Gens 1–9 on the home page. Every mode only uses Pokémon from those generations, and so do the name suggestions. All generations are selected by default, and selecting none also means all of them.
- **Leaderboards.** Every mode has a leaderboard for each set of generations: fewest guesses in PokéWordle, longest streak in the others. Scores are counted by the server, from games it ran.
- **Accounts, optional.** You start as a guest. Claim a name (and a password) to get on the leaderboards, keeping everything you've played, and log in with it on other devices. Logging in on a device where you've played as a guest brings that progress with you.
- **Saved progress.** Your generation selection and your player token are saved in your browser (`localStorage`), and a game in progress picks up where it was after a reload. Best scores are kept on the server.
- **No waiting between rounds.** The streak modes load the next round's image in the background.
- **Name autocomplete.** Type a few letters and choose from suggestions using the mouse or the arrow keys and Enter.

## Running it locally

You'll need [Node.js](https://nodejs.org/) 20.19 or newer (required by Vite 7).

```bash
npm install
npm run dev
```

It uses the live API at `https://pokewordle-api.sashasagebd.com`, which allows requests from `http://localhost:5173`. To use another one (say a local copy of pokewordle-api), set `VITE_API_URL`, e.g. in a `.env.local` file: `VITE_API_URL=http://localhost:8080`.

Then open the address Vite prints (usually http://localhost:5173).

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server with hot reload |
| `npm run build` | Builds the site for production into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Checks the code with ESLint |

## Deployment

The site is hosted on [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) as static assets. Every push to `main` builds it with `npm run build` and deploys `dist/` with `npx wrangler deploy`. The settings are in `wrangler.jsonc`, which serves it at pokewordle.sashasagebd.com (a Workers custom domain) and sends unknown paths to `index.html` so the game routes work when you refresh or open a link directly.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for the dev server and builds
- [Tailwind CSS 4](https://tailwindcss.com/) for styling
- [React Router](https://reactrouter.com/) for the game routes
- [pokewordle-api](https://github.com/sashasagebd/pokewordle-api) (Go + Postgres, on my home server) for Pokémon data and the games
- [PokéAPI](https://pokeapi.co/) sprites
- [Cloudflare Workers](https://workers.cloudflare.com/) for hosting

## Project structure

```
src/
├── components/
│   ├── HomePage.tsx          # Mode picker, generation filter, account
│   ├── PokemonContainer.tsx  # Loads the Pokémon list and renders the chosen mode
│   ├── SearchBar.tsx         # PokéWordle
│   ├── HigherLower.tsx       # Higher or Lower
│   ├── GuessPokemon.tsx      # Who's That Pokémon?
│   ├── PokemonSearch.tsx     # Name input with autocomplete, shared by the guessing modes
│   ├── AccountCard.tsx       # Guest, claim a name, log in and out
│   ├── LeaderboardPage.tsx   # Leaderboards
│   └── ...                   # Smaller UI pieces (cards, buttons, streak badge, icons)
├── services/pokeApi.ts       # API requests (player token, games, silhouettes) and sprite URLs
├── generations.ts            # Generation ID ranges
├── GenerationsContext.tsx    # Shares and saves the selected generations
├── useGame.ts                # Starts or resumes the server-side game of a mode
├── useSilhouettes.ts         # Fetches and preloads Who's That silhouettes
├── PlayerContext.tsx         # Shares the player's name and best scores
├── useBestScore.ts           # The best score for a mode and the selected generations
└── types.ts
```

## Credits

Pokémon data and sprites come from [PokéAPI](https://pokeapi.co/). Pokémon and Pokémon character names are trademarks of Nintendo, Game Freak and Creatures Inc. This is an unofficial fan project and isn't affiliated with or endorsed by them.
