# PokéWordle

Three browser games for testing how well you know your Pokémon, built with React and the free [PokéAPI](https://pokeapi.co/).

## Game modes

### PokéWordle
Guess the mystery Pokémon. Each guess shows how its height, weight and types compare to the answer, with arrows pointing toward the right height and weight. Keep guessing until you find it.

### Higher or Lower
Two Pokémon side by side: is the second one taller (or heavier) than the first? Switch between height and weight at any time. Every right answer adds to your streak; one wrong answer resets it.

### Who's That Pokémon?
Name the Pokémon from its silhouette. You get one guess: right and your streak grows, wrong and it resets. You can also give up to see the answer.

## Features

- **Generation filter.** Pick any mix of Gens 1–9 on the home page. Every mode only uses Pokémon from those generations, and so do the name suggestions. All generations are selected by default, and selecting none also means all of them.
- **Saved progress.** Your generation selection and your best streaks are saved in your browser (`localStorage`), so they're still there next time. They don't sync between devices or browsers.
- **No waiting between rounds.** The streak modes load the next few Pokémon and their images in the background.
- **Name autocomplete.** Type a few letters and choose from suggestions using the mouse or the arrow keys and Enter.

## Running it locally

You'll need [Node.js](https://nodejs.org/) 20.19 or newer (required by Vite 7).

```bash
npm install
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173).

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server with hot reload |
| `npm run build` | Builds the site for production into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Checks the code with ESLint |

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for the dev server and builds
- [Tailwind CSS 4](https://tailwindcss.com/) for styling
- [React Router](https://reactrouter.com/) for the game routes
- [PokéAPI](https://pokeapi.co/) for Pokémon data and sprites

## Project structure

```
src/
├── components/
│   ├── HomePage.tsx          # Mode picker and generation filter
│   ├── PokemonContainer.tsx  # Loads shared data and renders the chosen mode
│   ├── SearchBar.tsx         # PokéWordle
│   ├── HigherLower.tsx       # Higher or Lower
│   ├── GuessPokemon.tsx      # Who's That Pokémon?
│   ├── PokemonSearch.tsx     # Name input with autocomplete, shared by the guessing modes
│   └── ...                   # Smaller UI pieces (cards, buttons, streak badge, icons)
├── services/pokeApi.ts       # PokéAPI requests
├── generations.ts            # Generation ID ranges and random picking
├── GenerationsContext.tsx    # Shares and saves the selected generations
├── usePokemonQueue.ts        # Preloads upcoming Pokémon for the streak modes
├── useBestScore.ts           # Saves best streaks
└── types.ts
```

## Credits

Pokémon data and sprites come from [PokéAPI](https://pokeapi.co/). Pokémon and Pokémon character names are trademarks of Nintendo, Game Freak and Creatures Inc. This is an unofficial fan project and isn't affiliated with or endorsed by them.
