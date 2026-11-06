import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PokemonContainer from './components/PokemonContainer';
import HomePage from './components/HomePage';
import LeaderboardPage from './components/LeaderboardPage';
import { GenerationsProvider } from './GenerationsContext';
import { PlayerProvider } from './PlayerContext';

function App() {

  return (
    <GenerationsProvider>
      <PlayerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pokewordle" element={<PokemonContainer gamemode="pokewordle"/>} />
            <Route path="/higherlower" element={<PokemonContainer gamemode="higherlower"/>} />
            <Route path="/guesspokemon" element={<PokemonContainer gamemode="guesspokemon" />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Routes>
        </BrowserRouter>
      </PlayerProvider>
    </GenerationsProvider>
  )
}

export default App
