import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
    const [ dropdown, setDropdown ] = useState(false);
    const [ selected, setSelected ] = useState([])

    const generationNums = [[0, 151], [151, 251], [251, 386], [386, 493], [493, 649], [649, 721], [721, 809], [809, 905], [905, 1025]]
    const generations = ["Gen 1", "Gen 2", "Gen 3", "Gen 4", "Gen 5", "Gen 6", "Gen 7", "Gen 8", "Gen 9"];

    function handleGeneration(generation) {
        setSelected(prev => {
            if (prev.includes(generation)) {
            return prev.filter(g => g !== generation); // toggle off
            } else {
            return [...prev, generation]; // add
            }
        });s     
    }

    return(

        <div className="home-container">
            <button onClick={() => setDropdown(!dropdown)}>Generation</button>
            <div id="dropdown">
                {dropdown && generations.map((generation, index) => (
                    <div
                        key={index}
                        onClick={() => handleGeneration(generation)}
                        style={{
                            cursor: "pointer",
                            backgroundColor: selected.includes(generation) ? "red" : "black"
                        }}
                    >
                        {generation}
                    </div>
                ))}

            </div>
            <Link to="pokewordle">
                <button>Play</button>
            </Link>
        </div>
    )
}