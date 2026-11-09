import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Mode } from '../types';
import { ROOM_CODE, createRoom, errorMessage, leaveQueue, queueFor } from '../services/pokeApi';
import { GENERATIONS } from '../generations';
import { useGenerations } from '../useGenerations';
import { useServerNow } from '../useRoom';
import GameLayout from './GameLayout';
import Card from './Card';
import Button from './Button';

const MODES: { mode: Mode, title: string }[] = [
    { mode: "wordle", title: "PokéWordle" },
    { mode: "higher_lower", title: "Higher or Lower" },
    { mode: "whos_that", title: "Who's That?" },
];

// How often a quick-match wait asks again. The server counts one silent for
// 10 seconds as gone.
const ASK_EVERY = 2000;

// Quick match, or make a room (with the generations picked on the home page),
// or join one by its code. The room page does the joining.
export default function VersusHome() {
    const navigate = useNavigate();
    const { selected } = useGenerations();
    const [ code, setCode ] = useState<string>('');
    const [ creating, setCreating ] = useState<boolean>(false);
    const [ error, setError ] = useState<string>('');
    const [ quickMode, setQuickMode ] = useState<Mode>("higher_lower");
    // When the quick-match wait began, while there is one
    const [ waitingSince, setWaitingSince ] = useState<number | null>(null);
    const now = useServerNow(0, waitingSince !== null, 1000);
    // For leaving the queue on leaving the page: waiting, and not for a room
    const waiting = useRef<boolean>(false);
    const matched = useRef<boolean>(false);

    const gens = selected.length ? selected.map(i => GENERATIONS[i].label).join(", ") : "All generations";
    const tidied = code.trim().toUpperCase();

    // While waiting: ask, and keep asking, until there's a room
    useEffect(() => {
        if(waitingSince === null) return;
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;
        async function ask() {
            try {
                const res = await queueFor(quickMode, selected);
                if(cancelled) return;
                if(res.status === "matched") {
                    matched.current = true;
                    navigate(`/versus/${res.code}`);
                    return;
                }
                setError('');
            } catch(err) {
                if(cancelled) return;
                console.error(err);
                setError(errorMessage(err, "Can't reach the server. Still trying…"));
            }
            timer = setTimeout(ask, ASK_EVERY);
        }
        ask();
        return () => { cancelled = true; clearTimeout(timer); };
    }, [waitingSince, quickMode, selected, navigate]);

    useEffect(() => { waiting.current = waitingSince !== null; }, [waitingSince]);
    useEffect(() => () => {
        if(waiting.current && !matched.current) leaveQueue().catch(() => {});
    }, []);

    function cancel() {
        setWaitingSince(null);
        setError('');
        leaveQueue().catch(console.error);
    }

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

    const waited = waitingSince === null ? 0 : Math.max(0, Math.floor((now - waitingSince) / 1000));

    return(
        <GameLayout title="Versus" subtitle="Race other players, live">
            <div className="w-full max-w-2xl grid gap-4 sm:grid-cols-2">
                <Card className="sm:col-span-2 p-5 flex flex-col gap-3">
                    <div>
                        <h2 className="text-xl font-semibold">Quick match</h2>
                        <p className="text-sm text-muted">
                            Race someone else who's looking for a game, in the same mode and generations
                            (<span className="text-white">{gens}</span>). It starts as soon as you're both in.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {MODES.map(m => (
                            <button
                                key={m.mode}
                                onClick={() => setQuickMode(m.mode)}
                                disabled={waitingSince !== null}
                                className={`rounded-xl border px-3 py-2 font-display font-semibold text-sm transition cursor-pointer disabled:cursor-default ${quickMode === m.mode ? "border-poke bg-poke/15" : "border-line bg-surface-2 text-muted hover:text-white"} ${waitingSince !== null && quickMode !== m.mode ? "opacity-50" : ""}`}
                            >
                                {m.title}
                            </button>
                        ))}
                    </div>
                    {waitingSince === null ? (
                        <Button onClick={() => { setError(''); setWaitingSince(Date.now()); }}>Find a match</Button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <p className="flex-1 text-sm">
                                <span className="inline-block w-2 h-2 rounded-full bg-gold animate-pulse mr-2" />
                                Looking for an opponent… <span className="text-muted tabular-nums">{Math.floor(waited / 60)}:{String(waited % 60).padStart(2, '0')}</span>
                            </p>
                            <Button variant="secondary" onClick={cancel}>Cancel</Button>
                        </div>
                    )}
                </Card>
                <Card className="p-5 flex flex-col gap-3">
                    <h2 className="text-xl font-semibold">Make a room</h2>
                    <p className="text-sm text-muted flex-1">
                        You'll get a code to send your friends: up to 4 of you race at the same game, in any of the three modes.
                        You pick the mode and generations in the lobby.
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
