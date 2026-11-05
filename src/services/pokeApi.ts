import type { Answer, Comparison, Game, Mode, Pokemon } from '../types'

// pokewordle-api on the home server. Set VITE_API_URL to use another one,
// e.g. a local copy at http://localhost:8080.
const API_URL = (import.meta.env.VITE_API_URL ?? 'https://pokewordle-api.sashasagebd.com').replace(/\/+$/, '');

export const spriteUrl = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

// An error answer from the API. Its message is meant for the player when
// status is 400; a 409 about an already-answered round carries the game as
// it is now.
export class ApiError extends Error {
    status: number;
    game?: Game;
    constructor(status: number, message: string, game?: Game) {
        super(message);
        this.status = status;
        this.game = game;
    }
}

async function check(res: Response): Promise<Response> {
    if(!res.ok) {
        const body = await res.json().catch(() => null);
        throw new ApiError(res.status, body?.error ?? `${res.status} ${res.statusText}`, body?.game);
    }
    return res;
}

// Every Pokémon in dex order (about 100 KB, cached by the browser for an hour)
export async function getPokemonList(): Promise<Pokemon[]> {
    return (await check(await fetch(`${API_URL}/pokemon`))).json();
}

// --- The player's token ---------------------------------------------------
// A player is anonymous: a random token from POST /players, kept in
// localStorage and sent as a bearer token (not a cookie, since the API is
// on another site).

const TOKEN_KEY = 'playerToken';
// Also kept here, for when localStorage is unavailable
let memoryToken: string | null = null;
let tokenRequest: Promise<string> | null = null;

function getToken(): Promise<string> {
    if(!memoryToken) {
        try { memoryToken = localStorage.getItem(TOKEN_KEY); } catch { /* unavailable */ }
    }
    if(memoryToken) return Promise.resolve(memoryToken);
    // One request even when several calls need a token at once
    tokenRequest ??= (async () => {
        try {
            const res = await check(await fetch(`${API_URL}/players`, { method: 'POST' }));
            const { token } = await res.json() as { token: string };
            memoryToken = token;
            try { localStorage.setItem(TOKEN_KEY, token); } catch { /* unavailable */ }
            return token;
        } finally {
            tokenRequest = null;
        }
    })();
    return tokenRequest;
}

function forgetToken() {
    memoryToken = null;
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* unavailable */ }
}

// fetch with the player's token. An unknown token gets a new one and one
// retry (the old token's games are gone with it).
async function authed(path: string, init: RequestInit = {}, retried = false): Promise<Response> {
    const token = await getToken();
    const res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: { ...init.headers, Authorization: `Bearer ${token}` },
    });
    if(res.status === 401 && !retried) {
        forgetToken();
        return authed(path, init, true);
    }
    return check(res);
}

async function post<T>(path: string, body?: unknown): Promise<T> {
    const res = await authed(path, body === undefined ? { method: 'POST' } : {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return res.json();
}

// --- Games ----------------------------------------------------------------

// The frontend numbers generations 0 to 8 (none selected means all); the
// API numbers them 1 to 9.
export function apiGens(selected: number[]): number[] {
    return (selected.length ? selected : [0, 1, 2, 3, 4, 5, 6, 7, 8]).map(index => index + 1);
}

export function startGame(mode: Mode, selected: number[]): Promise<Game> {
    return post('/games', { mode, gens: apiGens(selected) });
}

export async function getGame(id: string): Promise<Game> {
    return (await authed(`/games/${encodeURIComponent(id)}`)).json();
}

export function guess(id: string, name: string): Promise<{ result: Comparison, game: Game }> {
    return post(`/games/${encodeURIComponent(id)}/guess`, { name });
}

export function answer(id: string, a: Answer): Promise<{ correct: boolean, answer: Pokemon, game: Game }> {
    return post(`/games/${encodeURIComponent(id)}/answer`, a);
}

export function giveUp(id: string): Promise<Game> {
    return post(`/games/${encodeURIComponent(id)}/give-up`);
}

// A Who's That round's silhouette as an object URL. An <img> can't send the
// token, so it's fetched here. The caller revokes the URL when it's done.
export async function silhouetteUrl(id: string, n: number): Promise<string> {
    const res = await authed(`/games/${encodeURIComponent(id)}/rounds/${n}/image`);
    return URL.createObjectURL(await res.blob());
}
