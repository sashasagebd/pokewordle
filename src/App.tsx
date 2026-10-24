import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PokemonContainer from './components/PokemonContainer';
import HomePage from './components/HomePage';
import { GenerationsProvider } from './GenerationsContext';

function App() {

  return (
    <GenerationsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokewordle" element={<PokemonContainer gamemode="pokewordle"/>} />
          <Route path="/higherlower" element={<PokemonContainer gamemode="higherlower"/>} />
          <Route path="/guesspokemon" element={<PokemonContainer gamemode="guesspokemon" />} />
        </Routes>
      </BrowserRouter>
    </GenerationsProvider>
  )
}

export default App
