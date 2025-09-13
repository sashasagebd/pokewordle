import { useState } from 'react';
import getOnePokemon from './PokemonContainer';

export default function SearchBar() {
    const [ search, setSearch ] = useState('');

    function handleInput(event) {
        setSearch(event.target.value);
    }


    return(
        <div>
            <input type="text" value={search} onChange={handleInput}/>
            <button type="submit">Submit</button>   
        </div>
    )
}