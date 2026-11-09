import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Comparison, Game, Pokemon, PokemonInfo, Room, RoomRound, RoundPlayer, Tile } from '../types';
import { ROOM_CODE, getPokemonList, spriteUrl } from '../services/pokeApi';
import { GENERATIONS, isInGens } from '../generations';
import { useRoom, useServerNow, type Connection, type RoomError } from '../useRoom';
import GameLayout from './GameLayout';
import Card from './Card';
import Button from './Button';
import PokemonSearch from './PokemonSearch';
import Guesses, { guessGrid } from './Guesses';
import { ArrowDown, ArrowUp, Check } from './Icons';

type Send = (message: object) => boolean;

// "1:05" from milliseconds
function clock(ms: number): string {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// "12.3s" from milliseconds
function seconds(ms: number): string {
    return `${(ms / 1000).toFixed(1)}s`;
}

// The room page: the lobby between rounds (with the last round's results),
// the countdown and the race. Everything comes from the server over the
// room's socket; this only draws it and sends the player's moves.
export default function VersusRoom() {
    const code = (useParams().code ?? '').toUpperCase();
    if(!ROOM_CODE.test(code)) {
        return (
            <GameLayout title="Versus">
                <Closed reason="That isn't a room code: they're 6 letters and numbers, like K7QX2M." />
            </GameLayout>
        );
    }
    return <RoomPage code={code} key={code} />;
}

function RoomPage({ code }: { code: string }) {
    const { room, game, connection, closedReason, offset, error, clearError, send } = useRoom(code);
    const [ pokemon, setPokemon ] = useState<Pokemon[]>([]);

    useEffect(() => {
        getPokemonList().then(setPokemon).catch(console.error);
    }, []);

    // Suggest only the room's generations (the API numbers them 1 to 9)
    const gens = room?.gens;
    const pokemonInfo = useMemo<PokemonInfo[]>(() => {
        const indexes = (gens ?? []).map(g => g - 1);
        return pokemon
            .filter(p => isInGens(p.id, indexes))
            .map(p => ({ name: p.name, sprite: spriteUrl(p.id) }));
    }, [pokemon, gens]);

    const ticking = room?.status === "playing" || !!room?.members.some(m => !m.connected);
    const now = useServerNow(offset, ticking);

    return (
        <GameLayout title="Versus" subtitle={`Room ${code}`}>
            <div className="w-full max-w-3xl flex flex-col gap-4">
                <ConnectionNote connection={connection} />
                {connection === "closed" ? (
                    <Closed reason={closedReason} />
                ) : !room ? (
                    <p className="text-center text-muted py-10">Joining the room…</p>
                ) : room.status === "playing" && room.round ? (
                    <Race room={room} round={room.round} game={game} now={now} send={send}
                        error={error} clearError={clearError} pokemonInfo={pokemonInfo} />
                ) : (
                    <Lobby room={room} now={now} send={send} error={error} />
                )}
            </div>
        </GameLayout>
    );
}

function ConnectionNote({ connection }: { connection: Connection }) {
    if(connection !== "reconnecting") return null;
    return (
        <p className="text-center text-sm text-warn rounded-xl border border-warn/40 bg-warn/10 py-2">
            Reconnecting… your place is kept for 30 seconds.
        </p>
    );
}

function Closed({ reason }: { reason: string }) {
    const navigate = useNavigate();
    return (
        <Card className="p-6 text-center flex flex-col items-center gap-4">
            <p className="text-lg">{reason}</p>
            <Button onClick={() => navigate("/versus")}>Make or join another</Button>
        </Card>
    );
}

// --- The lobby ------------------------------------------------------------------

function Lobby({ room, now, send, error }: { room: Room, now: number, send: Send, error: RoomError | null }) {
    const navigate = useNavigate();
    const [ copied, setCopied ] = useState<boolean>(false);
    const isHost = room.host === room.you;
    const me = room.members.find(m => m.id === room.you);
    const others = room.members.filter(m => m.id !== room.host);
    const everyoneReady = others.every(m => m.ready);
    const canStart = room.members.length >= 2 && everyoneReady;
    const last = room.round?.finishedAt ? room.round : undefined;

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // No clipboard (an insecure page, say): the code is on screen
        }
    }

    function toggleGen(gen: number) {
        const gens = room.gens.includes(gen) ? room.gens.filter(g => g !== gen) : [...room.gens, gen].sort((a, b) => a - b);
        send({ type: "settings", gens }); // none means all, as on the home page
    }

    function leave() {
        send({ type: "leave" });
        navigate("/versus");
    }

    return (
        <>
            {last && <Results room={room} round={last} />}

            <Card className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                    <p className="text-sm text-muted">Send your friends the code</p>
                    <p className="font-display text-4xl font-bold tracking-[0.25em]">{room.code}</p>
                </div>
                <Button variant="secondary" onClick={copyLink}>{copied ? "Copied!" : "Copy link"}</Button>
            </Card>

            <Card className="p-5 flex flex-col gap-3">
                <h2 className="text-lg font-semibold">Players <span className="text-muted font-normal">({room.members.length}/4)</span></h2>
                <ul className="flex flex-col gap-2">
                    {room.members.map(m => (
                        <li key={m.id} className="flex items-center gap-3 rounded-xl bg-surface-2 border border-line px-4 py-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${m.connected ? "bg-good" : "bg-muted"}`} title={m.connected ? "Connected" : "Disconnected"} />
                            <span className="font-semibold flex-1 truncate">
                                {m.name}{m.id === room.you && <span className="text-muted font-normal"> (you)</span>}
                            </span>
                            {!m.connected && m.graceEndsAt && (
                                <span className="text-xs text-warn">reconnecting… {clock(Date.parse(m.graceEndsAt) - now)}</span>
                            )}
                            {m.id === room.host
                                ? <span className="text-xs font-semibold text-gold">Host</span>
                                : <span className={`text-xs font-semibold ${m.ready ? "text-good" : "text-muted"}`}>{m.ready ? "Ready" : "Not ready"}</span>}
                        </li>
                    ))}
                </ul>
            </Card>

            <Card className="p-5">
                <h2 className="text-lg font-semibold">Generations</h2>
                <p className="text-sm text-muted mb-3">
                    {isHost ? "Pick which generations the next round uses. Changing them unreadies everyone." : "The host picks the generations."}
                </p>
                <div className="flex flex-wrap gap-2">
                    {GENERATIONS.map((generation, index) => {
                        const gen = index + 1;
                        const on = room.gens.includes(gen);
                        return (
                            <button
                                key={generation.label}
                                onClick={() => toggleGen(gen)}
                                disabled={!isHost}
                                className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition ${isHost ? "cursor-pointer" : "cursor-default"} ${on ? "bg-poke border-poke text-white" : "bg-surface-2 border-line text-muted"} ${isHost && !on ? "hover:text-white hover:border-muted" : ""}`}
                            >
                                {generation.label}
                            </button>
                        );
                    })}
                </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                {isHost ? (
                    <Button onClick={() => send({ type: "start" })} disabled={!canStart} className="sm:flex-1">
                        {last ? "Start a rematch" : "Start the race"}
                    </Button>
                ) : (
                    <Button onClick={() => send({ type: "ready", ready: !me?.ready })} variant={me?.ready ? "secondary" : "primary"} className="sm:flex-1">
                        {me?.ready ? "Not ready" : "Ready"}
                    </Button>
                )}
                <Button variant="secondary" onClick={leave}>Leave</Button>
            </div>
            <p className="text-sm text-muted text-center -mt-1">
                {room.members.length < 2 ? "Waiting for someone to join…"
                    : !everyoneReady ? (isHost ? "Waiting for everyone to be ready…" : "The host starts once everyone's ready.")
                    : isHost ? "Everyone's ready!" : "Waiting for the host to start…"}
            </p>
            {error && error.for !== "guess" && <p className="text-sm text-bad text-center">{error.message}</p>}
        </>
    );
}

// --- The race ---------------------------------------------------------------------

function Race({ room, round, game, now, send, error, clearError, pokemonInfo }: {
    room: Room, round: RoomRound, game: Game | undefined, now: number, send: Send,
    error: RoomError | null, clearError: () => void, pokemonInfo: PokemonInfo[],
}) {
    const me = round.players.find(p => p.id === room.you);
    const startsIn = Date.parse(round.startsAt) - now;
    const left = Date.parse(round.endsAt) - now;
    const guesses = [...(game?.guesses ?? [])].reverse();
    const done = !me || !me.racing;
    // A guess waits for the one before; numbered so a resend can't count twice
    const pending = useRef<number>(0);
    const next = (game?.guesses?.length ?? 0) + 1;
    // Answered: the game moved on, or the guess was refused
    useEffect(() => { pending.current = 0; }, [next]);
    useEffect(() => { if(error?.for === "guess") pending.current = 0; }, [error]);

    function guess(name: string) {
        if(done || startsIn > 0 || pending.current) return;
        if(send({ type: "guess", n: next, name })) pending.current = next;
    }

    function forfeit() {
        if(window.confirm("Give up this round? You'll stay in the room for the next one.")) {
            send({ type: "forfeit" });
        }
    }

    if(startsIn > 0) {
        return (
            <Card className="p-10 flex flex-col items-center gap-2">
                <p className="text-muted">Round {round.n} starts in</p>
                <p key={Math.ceil(startsIn / 1000)} className="font-display text-8xl font-bold text-poke animate-pop">
                    {Math.ceil(startsIn / 1000)}
                </p>
                {!me && <p className="text-sm text-muted">You joined mid-round: you'll play the next one.</p>}
            </Card>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted">Round {round.n}</p>
                <p className={`font-display text-2xl font-bold tabular-nums ${left < 30_000 ? "text-bad" : ""}`}>{clock(left)}</p>
            </div>

            <Standings room={room} round={round} now={now} />

            {!me ? (
                <p className="text-center text-muted py-6">A round is on: you'll play the next one.</p>
            ) : (
                <>
                    <div>
                        <PokemonSearch
                            pokemonInfo={pokemonInfo}
                            onSubmit={guess}
                            onType={clearError}
                            placeholder={me.outcome === "solved" ? "You got it! Waiting for the others…"
                                : me.outcome === "forfeited" ? "You gave up this round." : undefined}
                            disabled={done}
                        />
                        {error?.for === "guess" && <p className="mt-2 text-sm text-bad">{error.message}</p>}
                    </div>
                    {me.outcome === "solved" && (
                        <Card className="p-4 border-good/50 animate-pop text-center">
                            Solved in {me.guesses} {me.guesses === 1 ? "guess" : "guesses"}
                            {me.timeMs !== undefined && <> and {seconds(me.timeMs)}</>}!
                            {me.rank === 1 && <span className="text-gold font-semibold"> First!</span>}
                        </Card>
                    )}
                    <GuessList guesses={guesses} />
                    {me.racing && (
                        <div className="text-center">
                            <button onClick={forfeit} className="text-sm text-muted hover:text-white underline cursor-pointer">Give up this round</button>
                        </div>
                    )}
                </>
            )}
        </>
    );
}

function GuessList({ guesses }: { guesses: Comparison[] }) {
    return (
        <div className="flex flex-col gap-2">
            <div className={`${guessGrid} text-xs uppercase tracking-wider text-muted font-semibold text-center`}>
                <div className="text-left pl-2">Pokémon</div>
                <div>Height</div>
                <div>Weight</div>
                <div>Type</div>
            </div>
            {guesses.map(c => <Guesses comparison={c} key={c.guess.id} />)}
            {guesses.length === 0 && (
                <p className="text-center text-muted text-sm py-8 rounded-2xl border border-dashed border-line">
                    Your guesses show up here. The others see only your tiles, not your guesses.
                </p>
            )}
        </div>
    );
}

// Everyone's race so far: places, guess counts, and their tiles without the
// Pokémon they guessed
function Standings({ room, round, now }: { room: Room, round: RoomRound, now: number }) {
    const byId = new Map(room.members.map(m => [m.id, m]));
    return (
        <div className="grid gap-2 sm:grid-cols-2">
            {round.players.map(p => {
                const member = byId.get(p.id);
                const away = member && !member.connected && member.graceEndsAt;
                return (
                    <Card key={p.id} className={`p-3 flex flex-col gap-2 ${p.id === room.you ? "border-poke/50" : ""}`}>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold truncate flex-1">
                                {p.name}{p.id === room.you && <span className="text-muted font-normal"> (you)</span>}
                            </span>
                            <span className="text-xs text-muted">{p.guesses} {p.guesses === 1 ? "guess" : "guesses"}</span>
                            <Status player={p} />
                        </div>
                        {p.racing && away && (
                            <p className="text-xs text-warn">Disconnected: forfeits in {clock(Date.parse(away) - now)}</p>
                        )}
                        <MiniTiles tiles={p.tiles} />
                    </Card>
                );
            })}
        </div>
    );
}

function Status({ player }: { player: RoundPlayer }) {
    switch(player.outcome) {
        case "solved":
            return <span className="text-xs font-semibold text-good">#{player.rank} · {seconds(player.timeMs ?? 0)}</span>;
        case "forfeited":
            return <span className="text-xs font-semibold text-bad">Gave up</span>;
        default:
            return player.racing
                ? <span className="text-xs font-semibold text-warn">Racing</span>
                : <span className="text-xs font-semibold text-muted">Didn't find it</span>;
    }
}

const tone = {
    good: "bg-good/20 text-good",
    warn: "bg-warn/20 text-warn",
    bad: "bg-bad/20 text-bad",
    neutral: "bg-surface-2 text-muted",
};

// One small row per guess: height, weight, type
function MiniTiles({ tiles }: { tiles: Tile[] }) {
    if(tiles.length === 0) return <p className="text-xs text-muted">No guesses yet</p>;
    const arrow = (d: Tile["height"]) =>
        d === "equal" ? <Check className="w-3.5 h-3.5" />
        : d === "higher" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
    const typeTone = (t: Tile["type"]) => t === "same" ? tone.good : t === "effective" ? tone.warn : t === "weak" ? tone.bad : tone.neutral;
    return (
        <div className="flex flex-col-reverse gap-1">
            {tiles.map((t, i) => (
                <div key={i} className="grid grid-cols-3 gap-1">
                    {t.correct ? (
                        <div className="col-span-3 h-6 rounded-md bg-good/30 text-good text-xs font-semibold flex items-center justify-center">Solved!</div>
                    ) : <>
                        <div className={`h-6 rounded-md flex items-center justify-center ${t.height === "equal" ? tone.good : tone.warn}`}>{arrow(t.height)}</div>
                        <div className={`h-6 rounded-md flex items-center justify-center ${t.weight === "equal" ? tone.good : tone.warn}`}>{arrow(t.weight)}</div>
                        <div className={`h-6 rounded-md ${typeTone(t.type)}`} />
                    </>}
                </div>
            ))}
        </div>
    );
}

// --- Results ----------------------------------------------------------------------

function Results({ room, round }: { room: Room, round: RoomRound }) {
    const winner = round.players.find(p => p.id === round.winner);
    const title = !winner ? "It's a draw!" : winner.id === room.you ? "You win!" : `${winner.name} wins!`;

    return (
        <Card className={`p-5 flex flex-col gap-4 animate-pop ${winner?.id === room.you ? "border-good/50" : ""}`}>
            <div className="flex items-center gap-4">
                {round.answer && <img src={spriteUrl(round.answer.id)} alt="" className="w-20 h-20 pixelated" />}
                <div>
                    <p className="text-sm text-muted">Round {round.n}</p>
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    {round.answer && <p className="text-sm text-muted">It was <span className="capitalize text-white font-semibold">{round.answer.name}</span>.</p>}
                </div>
            </div>
            <ol className="flex flex-col gap-2">
                {round.players.map(p => (
                    <li key={p.id}>
                        <details className="rounded-xl bg-surface-2 border border-line group">
                            <summary className="flex items-center gap-3 px-4 py-2.5 cursor-pointer list-none">
                                <span className="font-display font-bold w-6 text-muted">{p.rank}</span>
                                <span className="font-semibold flex-1 truncate">
                                    {p.name}{p.id === room.you && <span className="text-muted font-normal"> (you)</span>}
                                </span>
                                <span className="text-sm text-muted">
                                    {p.outcome === "solved" ? `${p.guesses} ${p.guesses === 1 ? "guess" : "guesses"}, ${seconds(p.timeMs ?? 0)}`
                                        : p.outcome === "forfeited" ? "Gave up" : "Didn't find it"}
                                </span>
                                <span className="text-xs text-muted group-open:rotate-180 transition">▾</span>
                            </summary>
                            <div className="px-3 pb-3 flex flex-col gap-2">
                                {(p.comparisons ?? []).length === 0
                                    ? <p className="text-sm text-muted px-1">No guesses.</p>
                                    : [...(p.comparisons ?? [])].reverse().map(c => <Guesses comparison={c} key={c.guess.id} />)}
                            </div>
                        </details>
                    </li>
                ))}
            </ol>
        </Card>
    );
}
