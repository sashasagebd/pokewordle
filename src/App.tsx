import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PokemonContainer from './components/PokemonContainer';
import HomePage from './components/HomePage';
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pokewordle" element={<PokemonContainer gamemode="pokewordle"/>} />
        <Route path="/higherlower" element={<PokemonContainer gamemode="higherlower"/>} />
        <Route path="/guesspokemon" element={<PokemonContainer gamemode="guesspokemon" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
