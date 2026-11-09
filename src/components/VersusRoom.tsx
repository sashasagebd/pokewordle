import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Comparison, Game, Mode, Pokemon, PokemonInfo, Room, RoomRound, RoundPlayer, Tile } from '../types';
import { ROOM_CODE, getPokemonList, spriteUrl } from '../services/pokeApi';
import { GENERATIONS, isInGens } from '../generations';
import { useRoom, useServerNow, type AnswerResult, type Connection, type RoomError } from '../useRoom';
import { useSilhouettes } from '../useSilhouettes';
import { PokemonCard } from './HigherLower';
import pokeBall from '../assets/pokeball.svg';
import GameLayout from './GameLayout';
import Card from './Card';
import Button from './Button';
import PokemonSearch from './PokemonSearch';
import Guesses, { guessGrid } from './Guesses';
import { ArrowDown, ArrowUp, Check } from './Icons';

type Send = (message: object) => boolean;

const MODES: { mode: Mode, title: string, blurb: string }[] = [
    { mode: "wordle", title: "PokéWordle", blurb: "First to find the mystery Pokémon wins." },
    { mode: "higher_lower", title: "Higher or Lower", blurb: "Same pairs for everyone. One miss and you're out: longest streak wins." },
    { mode: "whos_that", title: "Who's That?", blurb: "Same silhouettes for everyone. One miss and you're out: longest streak wins." },
];

const modeTitle = (mode: Mode) => MODES.find(m => m.mode === mode)?.title ?? mode;

const STATS = [
    { key: "height", label: "Height", unit: "m" },
    { key: "weight", label: "Weight", unit: "kg" },
] as const;

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
    const { room, game, lastAnswer, connection, closedReason, offset, error, clearError, send } = useRoom(code);
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
                    <Race room={room} round={room.round} game={game} lastAnswer={lastAnswer} now={now} send={send}
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

    async function copyCode() {
        try {
            await navigator.clipboard.writeText(room.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // No clipboard (an insecure page, say): the code is on screen
        }
    }

    function toggleGen(gen: number) {
        const gens = room.gens.includes(gen) ? room.gens.filter(g => g !== gen) : [...room.gens, gen].sort((a, b) => a - b);
        send({ type: "settings", mode: room.mode, gens }); // none means all, as on the home page
    }

    function pickMode(mode: Mode) {
        if(mode !== room.mode) send({ type: "settings", mode, gens: room.gens });
    }

    function leave() {
        send({ type: "leave" });
        navigate("/versus");
    }

    // A quick match before its first round: it starts by itself once both
    // players are connected.
    if(room.quick && !room.round) {
        const opponent = room.members.find(m => m.id !== room.you);
        return (
            <Card className="p-8 flex flex-col items-center gap-3 text-center">
                <p className="text-sm text-muted">Quick match: {modeTitle(room.mode)}</p>
                {opponent ? (
                    <>
                        <h2 className="text-2xl font-semibold">You vs {opponent.name}</h2>
                        <p className="text-muted">
                            {opponent.connected ? "Starting…" : "Waiting for them to connect…"}
                        </p>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-semibold">Your opponent didn't turn up</h2>
                        <Button onClick={leave}>Find another match</Button>
                    </>
                )}
            </Card>
        );
    }

    return (
        <>
            {last && <Results room={room} round={last} />}

            <Card className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                    <p className="text-sm text-muted">Send your friends the code</p>
                    <p className="font-display text-4xl font-bold tracking-[0.25em]">{room.code}</p>
                </div>
                <Button variant="secondary" onClick={copyCode}>{copied ? "Copied!" : "Copy code"}</Button>
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
                <h2 className="text-lg font-semibold">Game</h2>
                <p className="text-sm text-muted mb-3">
                    {isHost ? "Pick what the next round plays. Changing it unreadies everyone." : "The host picks the game."}
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                    {MODES.map(m => {
                        const on = room.mode === m.mode;
                        return (
                            <button
                                key={m.mode}
                                onClick={() => pickMode(m.mode)}
                                disabled={!isHost}
                                className={`text-left rounded-xl border p-3 transition ${isHost ? "cursor-pointer" : "cursor-default"} ${on ? "border-poke bg-poke/15" : "border-line bg-surface-2"} ${isHost && !on ? "hover:border-muted" : ""} ${!isHost && !on ? "opacity-50" : ""}`}
                            >
                                <p className="font-display font-semibold">{m.title}</p>
                                <p className="text-xs text-muted mt-0.5">{m.blurb}</p>
                            </button>
                        );
                    })}
                </div>
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

type RaceProps = {
    room: Room, round: RoomRound, game: Game | undefined, lastAnswer: AnswerResult | null, now: number, send: Send,
    error: RoomError | null, clearError: () => void, pokemonInfo: PokemonInfo[],
};

// The countdown, then the round's race
function Race(props: RaceProps) {
    const { room, round, now } = props;
    const me = round.players.find(p => p.id === room.you);
    const startsIn = Date.parse(round.startsAt) - now;
    const left = Date.parse(round.endsAt) - now;

    if(startsIn > 0) {
        return (
            <Card className="p-10 flex flex-col items-center gap-2">
                <p className="text-muted">Round {round.n}: {modeTitle(round.mode)}. Starts in</p>
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
                <p className="text-sm text-muted">Round {round.n}: {modeTitle(round.mode)}</p>
                <p className={`font-display text-2xl font-bold tabular-nums ${left < 30_000 ? "text-bad" : ""}`}>{clock(left)}</p>
            </div>
            <Standings room={room} round={round} now={now} />
            {!me ? (
                <p className="text-center text-muted py-6">A round is on: you'll play the next one.</p>
            ) : round.mode === "wordle" ? (
                <WordleRace {...props} me={me} />
            ) : (
                <StreakRace {...props} me={me} />
            )}
        </>
    );
}

function forfeit(send: Send) {
    if(window.confirm("Give up this round? You'll stay in the room for the next one.")) {
        send({ type: "forfeit" });
    }
}

// PokéWordle: your own board, guessing toward the shared answer
function WordleRace({ game, send, error, clearError, pokemonInfo, me }: RaceProps & { me: RoundPlayer }) {
    const guesses = [...(game?.guesses ?? [])].reverse();
    const done = !me.racing;
    // A guess waits for the one before; numbered so a resend can't count twice
    const pending = useRef<number>(0);
    const next = (game?.guesses?.length ?? 0) + 1;
    // Answered: the game moved on, or the guess was refused
    useEffect(() => { pending.current = 0; }, [next]);
    useEffect(() => { if(error?.for === "guess") pending.current = 0; }, [error]);

    function guess(name: string) {
        if(done || pending.current) return;
        if(send({ type: "guess", n: next, name })) pending.current = next;
    }

    return (
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
            {me.racing && <GiveUp send={send} />}
        </>
    );
}

function GiveUp({ send }: { send: Send }) {
    return (
        <div className="text-center">
            <button onClick={() => forfeit(send)} className="text-sm text-muted hover:text-white underline cursor-pointer">Give up this round</button>
        </div>
    );
}

// Higher or Lower and Who's That: a survival race over the same Pokémon,
// your own run on the server
function StreakRace({ round, game, lastAnswer, send, error, clearError, pokemonInfo, me }: RaceProps & { me: RoundPlayer }) {
    const [ stat, setStat ] = useState<0 | 1>(0);
    // The stat each answer was about, to say how it went
    const answeredStat = useRef<0 | 1>(0);
    const silhouettes = useSilhouettes();
    const [ image, setImage ] = useState<{ key: string, url: string } | null>(null);
    const pending = useRef<number>(0);

    const open = game?.status === "active" ? game.round : undefined;
    const n = open?.n ?? 0;
    useEffect(() => { pending.current = 0; }, [n]);
    useEffect(() => { if(error?.for === "answer") pending.current = 0; }, [error]);

    // Who's That: this round's silhouette, and the next one's in the background
    const imageKey = round.mode === "whos_that" && game && open ? `${game.id}/${n}` : null;
    useEffect(() => {
        if(!imageKey || !game) return;
        let cancelled = false;
        const ready = silhouettes.peek(game.id, n);
        if(ready) setImage({ key: imageKey, url: ready });
        silhouettes.get(game.id, n).then(url => { if(!cancelled) setImage({ key: imageKey, url }); }, console.error);
        silhouettes.get(game.id, n + 1).catch(() => {});
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageKey]);

    // Higher or Lower: the sprite after next, so it shows at once
    const upcoming = open?.upcoming?.id;
    useEffect(() => { if(upcoming) new Image().src = spriteUrl(upcoming); }, [upcoming]);

    function answer(move: object) {
        if(!open || !me.racing || pending.current) return;
        if(send({ type: "answer", n, ...move })) {
            pending.current = n;
            answeredStat.current = stat;
        }
    }

    function name(guess: string) {
        if(!pokemonInfo.some(p => p.name === guess)) return; // the server says why; spare it the trip
        answer({ name: guess });
    }

    const format = (p: Pokemon | null | undefined, i: 0 | 1 = stat) => p ? `${p[STATS[i].key] / 10} ${STATS[i].unit}` : "";
    // How the last answer went, while it's the latest news
    const result = lastAnswer && (lastAnswer.n === n - 1 || !open) ? lastAnswer : null;
    const said = !result ? null
        : round.mode === "higher_lower"
            ? `${result.correct ? "Correct!" : "Nope!"} ${result.answer.name} is ${format(result.answer, answeredStat.current)}.`
            : result.correct ? `Correct! It's ${result.answer.name}!` : `Nope! It was ${result.answer.name}.`;
    const silhouette = image && image.key === imageKey ? image.url : null;

    return (
        <>
            <div className="flex items-center justify-center gap-3">
                <span className="text-muted">Your streak</span>
                <span className="font-display text-4xl font-bold text-gold">{me.score}</span>
            </div>
            <p className={`h-6 text-center text-sm font-semibold capitalize ${result?.correct ? "text-good" : "text-bad"}`}>{said}</p>

            {!me.racing ? (
                <Card className="p-5 text-center flex flex-col items-center gap-2">
                    {me.outcome === "forfeited" ? <p>You gave up on a streak of {me.score}.</p> : <p>You're out, on a streak of {me.score}.</p>}
                    <p className="text-sm text-muted">Waiting for the others…</p>
                </Card>
            ) : round.mode === "higher_lower" ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="inline-flex rounded-full border border-line bg-surface p-1">
                        {STATS.map((s, i) => (
                            <button
                                key={s.key}
                                onClick={() => setStat(i as 0 | 1)}
                                className={`cursor-pointer rounded-full px-5 py-1.5 font-display font-semibold transition ${i === stat ? "bg-poke text-white" : "text-muted hover:text-white"}`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                    <div className="w-full flex flex-col md:flex-row items-stretch gap-4">
                        <PokemonCard pokemon={open?.current ?? null} value={format(open?.current)} />
                        <div className="self-center shrink-0 -my-6 md:my-0 z-10 w-12 h-12 rounded-full bg-gold text-ink font-display font-bold flex items-center justify-center shadow-lg">VS</div>
                        <PokemonCard pokemon={open?.next ?? null} value="?" hidden>
                            <div className="mt-4 grid grid-cols-2 gap-3 w-full max-w-xs">
                                <button onClick={() => answer({ dir: "higher", stat: STATS[stat].key })} disabled={!open}
                                    className="cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-good/15 border border-good/50 text-good hover:bg-good/25 py-3 font-display font-semibold transition active:scale-95 disabled:opacity-50">
                                    <ArrowUp className="w-5 h-5" /> Higher
                                </button>
                                <button onClick={() => answer({ dir: "lower", stat: STATS[stat].key })} disabled={!open}
                                    className="cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-bad/15 border border-bad/50 text-bad hover:bg-bad/25 py-3 font-display font-semibold transition active:scale-95 disabled:opacity-50">
                                    <ArrowDown className="w-5 h-5" /> Lower
                                </button>
                            </div>
                        </PokemonCard>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-md self-center flex flex-col gap-4">
                    <Card className="w-full aspect-square flex items-center justify-center overflow-hidden bg-[radial-gradient(circle,var(--color-gold)_0%,var(--color-warn)_35%,var(--color-poke)_75%)]!">
                        {silhouette
                            ? <img key={silhouette} src={silhouette} alt="Mystery Pokémon" className="w-[85%] h-[85%] pixelated animate-pop" draggable={false} />
                            : <img src={pokeBall} alt="Loading" className="w-20 h-20 animate-spin opacity-70" />}
                    </Card>
                    <PokemonSearch pokemonInfo={pokemonInfo} onSubmit={name} onType={clearError}
                        placeholder="Who's that Pokémon?" showSprites={false} disabled={!silhouette} />
                </div>
            )}
            {error?.for === "answer" && <p className="text-sm text-bad text-center">{error.message}</p>}
            {me.racing && <GiveUp send={send} />}
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
                            {round.mode === "wordle" && <span className="text-xs text-muted">{p.guesses} {p.guesses === 1 ? "guess" : "guesses"}</span>}
                            <Status player={p} />
                        </div>
                        {p.racing && away && (
                            <p className="text-xs text-warn">Disconnected: forfeits in {clock(Date.parse(away) - now)}</p>
                        )}
                        {round.mode === "wordle"
                            ? <MiniTiles tiles={p.tiles} />
                            : <p className="font-display text-3xl font-bold">{p.score} <span className="text-sm font-normal text-muted">streak</span></p>}
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
        case "out":
            return <span className="text-xs font-semibold text-bad">Out</span>;
        case "standing":
            return <span className="text-xs font-semibold text-good">{player.racing ? "Going" : "Still standing"}</span>;
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
                    <p className="text-sm text-muted">Round {round.n}: {modeTitle(round.mode)}</p>
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    {round.answer && <p className="text-sm text-muted">It was <span className="capitalize text-white font-semibold">{round.answer.name}</span>.</p>}
                </div>
            </div>
            {round.mode !== "wordle" ? (
                <ol className="flex flex-col gap-2">
                    {round.players.map(p => (
                        <li key={p.id} className="flex items-center gap-3 rounded-xl bg-surface-2 border border-line px-4 py-2">
                            <span className="font-display font-bold w-6 text-muted">{p.rank}</span>
                            <span className="font-semibold flex-1 truncate">
                                {p.name}{p.id === room.you && <span className="text-muted font-normal"> (you)</span>}
                            </span>
                            {p.endedOn && (
                                <span className="flex items-center gap-1 text-xs text-muted capitalize">
                                    {p.outcome === "out" ? "out on" : p.outcome === "forfeited" ? "gave up on" : "on"}
                                    <img src={spriteUrl(p.endedOn.id)} alt="" className="w-8 h-8 pixelated" />
                                    {p.endedOn.name}
                                </span>
                            )}
                            <span className="font-display text-xl font-bold text-gold w-10 text-right">{p.score}</span>
                        </li>
                    ))}
                </ol>
            ) : (
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
            )}
        </Card>
    );
}
