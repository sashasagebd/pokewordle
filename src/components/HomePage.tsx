import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button'

export default function HomePage() {
    const [ dropdown, setDropdown ] = useState<boolean>(false);
    const [ selected, setSelected ] = useState<string[]>([])

    const generationNums = [[0, 151], [151, 251], [251, 386], [386, 493], [493, 649], [649, 721], [721, 809], [809, 905], [905, 1025]];
    const generations = ["Gen 1", "Gen 2", "Gen 3", "Gen 4", "Gen 5", "Gen 6", "Gen 7", "Gen 8", "Gen 9"];

    function handleGeneration(generation: string) {
        setSelected(prev => {
            if (prev.includes(generation)) {
            return prev.filter(g => g !== generation); // toggle off
            } else {
            return [...prev, generation]; // add
            }
        });   
    }

    return(
        <div className="w-screen h-screen flex flex-col">
            <div className="h-[70%] flex flex-col items-center justify-center gap-3">
                <Link to="pokewordle">
                    <Button variant="red">Play PokeWordle</Button>
                </Link>
                <Link to="higherlower">
                    <Button variant="red">Play Higher Or Lower</Button>
                </Link>
                <Link to="guesspokemon">
                    <Button variant="red">Play Who's That Pokemon</Button>
                </Link>
            </div>
            <div className="h-[30%] flex flex-col items-center">
                <div className="relative">
                <Button variant="red" onClick={() => setDropdown(!dropdown)}>Generation</Button>
                    <div id="dropdown" className="flex flex-col mt-1 gap-1 absolute left-1/2 -translate-x-1/2">
                        {dropdown && generations.map((generation, index) => (
                            <div
                                key={index}
                                onClick={() => handleGeneration(generation)}
                                className={`text-black cursor-pointer w-30 text-center rounded-md ${selected.includes(generation) ? "bg-red-600 hover:bg-red-700" : "bg-white hover:bg-red-200"}`}
                            >
                                {generation}
                            </div>
                        ))}

                    </div>
                </div>
            </div>
        </div>
    )
}