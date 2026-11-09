import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROOM_CODE, createRoom, errorMessage } from '../services/pokeApi';
import { GENERATIONS } from '../generations';
import { useGenerations } from '../useGenerations';
import GameLayout from './GameLayout';
import Card from './Card';
import Button from './Button';

// Make a room (with the generations picked on the home page) or join one by
// its code. The room page does the joining.
export default function VersusHome() {
    const navigate = useNavigate();
    const { selected } = useGenerations();
    const [ code, setCode ] = useState<string>('');
    const [ creating, setCreating ] = useState<boolean>(false);
    const [ error, setError ] = useState<string>('');

    const gens = selected.length ? selected.map(i => GENERATIONS[i].label).join(", ") : "All generations";
    const tidied = code.trim().toUpperCase();

    async function create() {
        setCreating(true);
        setError('');
        try {
            navigate(`/versus/${await createRoom(selected)}`);
        } catch(err) {
            console.error(err);
            setError(errorMessage(err, "Couldn't make a room. Try again."));
            setCreating(false);
        }
    }

    function join(e: FormEvent) {
        e.preventDefault();
        if(!ROOM_CODE.test(tidied)) {
            setError("Room codes are 6 letters and numbers, like K7QX2M.");
            return;
        }
        navigate(`/versus/${tidied}`);
    }

    return(
        <GameLayout title="Versus" subtitle="Race your friends to the same Pokémon">
            <div className="w-full max-w-2xl grid gap-4 sm:grid-cols-2">
                <Card className="p-5 flex flex-col gap-3">
                    <h2 className="text-xl font-semibold">Make a room</h2>
                    <p className="text-sm text-muted flex-1">
                        You'll get a code to send your friends: up to 4 of you race at the same PokéWordle.
                        You can change the generations in the lobby. Now: <span className="text-white">{gens}</span>.
                    </p>
                    <Button onClick={create} disabled={creating}>{creating ? "Making it…" : "Make a room"}</Button>
                </Card>
                <Card className="p-5">
                    <form onSubmit={join} className="flex flex-col gap-3 h-full">
                        <h2 className="text-xl font-semibold">Join a room</h2>
                        <input
                            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-2xl text-center font-display tracking-[0.3em] uppercase placeholder:text-muted placeholder:tracking-normal placeholder:text-base outline-none focus:border-poke focus:ring-4 focus:ring-poke/20 transition"
                            placeholder="Room code"
                            value={code}
                            maxLength={8}
                            onChange={e => { setCode(e.target.value); setError(''); }}
                            autoComplete="off"
                            spellCheck={false}
                        />
                        <Button type="submit" variant="secondary" className="mt-auto">Join</Button>
                    </form>
                </Card>
                {error && <p className="sm:col-span-2 text-sm text-bad">{error}</p>}
            </div>
        </GameLayout>
    )
}
