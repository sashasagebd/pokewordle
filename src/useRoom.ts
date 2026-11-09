import { useCallback, useEffect, useRef, useState } from 'react';
import type { Game, Room, RoomMessage } from './types';
import { ApiError, joinRoom, roomSocketUrl, roomTicket } from './services/pokeApi';

// Where the room's socket is:
// - connecting: the first time
// - open: live
// - reconnecting: it dropped (a deploy closes every socket) and is coming back
// - closed: the room has closed, or there's no such room; nothing to retry
export type Connection = "connecting" | "open" | "reconnecting" | "closed";

// Close codes from the server (besides 1012, "restarting: reconnect")
const ROOM_CLOSED = 4000;
const NOT_MEMBER = 4001; // grace ran out, or we left: join again

export type RoomError = { for: string, n?: number, message: string };

// The room with code, kept up to date over its socket. Opening it joins the
// room (harmless if already in). It reconnects whenever the socket drops,
// with a growing, jittered delay so a restart doesn't bring everyone back at
// the same instant.
export function useRoom(code: string) {
    const [ room, setRoom ] = useState<Room | null>(null);
    const [ connection, setConnection ] = useState<Connection>("connecting");
    // Why it's closed, for the player
    const [ closedReason, setClosedReason ] = useState<string>('');
    // The server's clock minus ours, from the latest message: times in the
    // room are the server's
    const [ offset, setOffset ] = useState<number>(0);
    const [ error, setError ] = useState<RoomError | null>(null);
    // Your game as the latest guess left it, until the room catches up
    const [ guessedGame, setGuessedGame ] = useState<{ n: number, game: Game } | null>(null);
    const socket = useRef<WebSocket | null>(null);

    useEffect(() => {
        let cancelled = false;
        let attempt = 0;
        let retryTimer: ReturnType<typeof setTimeout> | undefined;
        let seq = 0; // the newest room seen: a late message never rolls it back

        function close(reason: string) {
            setConnection("closed");
            setClosedReason(reason);
        }

        function retry() {
            if(cancelled) return;
            setConnection("reconnecting");
            const delay = Math.min(10_000, 500 * 2 ** attempt) * (0.5 + Math.random());
            attempt++;
            retryTimer = setTimeout(connect, delay);
        }

        async function connect() {
            let ticket: string;
            try {
                await joinRoom(code);
                ticket = await roomTicket(code);
            } catch(err) {
                if(cancelled) return;
                if(err instanceof ApiError && err.status === 404) return close("No room has that code. It may have closed.");
                if(err instanceof ApiError && err.status === 409) return close(err.message);
                console.error(err);
                return retry();
            }
            if(cancelled) return;

            const ws = new WebSocket(roomSocketUrl(ticket));
            socket.current = ws;
            ws.onopen = () => {
                attempt = 0;
                setConnection("open");
            };
            ws.onmessage = event => {
                let m: RoomMessage;
                try {
                    m = JSON.parse(event.data);
                } catch {
                    return;
                }
                switch(m.type) {
                    case "room":
                        setOffset(Date.parse(m.serverNow) - Date.now());
                        if(m.seq > seq) {
                            seq = m.seq;
                            setRoom(m.room);
                            setGuessedGame(null); // it includes your game
                        }
                        break;
                    case "guess":
                        setGuessedGame({ n: m.n, game: m.game });
                        setError(null);
                        break;
                    case "error":
                        setError({ for: m.for, n: m.n, message: m.error });
                        break;
                }
            };
            ws.onclose = event => {
                if(socket.current === ws) socket.current = null;
                if(cancelled) return;
                if(event.code === ROOM_CLOSED) return close("This room has closed.");
                if(event.code === 1000 && event.reason === "you left the room") return close("You left the room.");
                // NOT_MEMBER needs a join first, which connect does anyway
                if(event.code === NOT_MEMBER) attempt = 0;
                retry();
            };
        }

        connect();
        return () => {
            cancelled = true;
            clearTimeout(retryTimer);
            socket.current?.close(1000);
            socket.current = null;
        };
    }, [code]);

    // Sends a message; false if the socket isn't open (it will be soon)
    const send = useCallback((message: object): boolean => {
        const ws = socket.current;
        if(!ws || ws.readyState !== WebSocket.OPEN) return false;
        ws.send(JSON.stringify(message));
        return true;
    }, []);

    // Your game: the room's, or newer from a guess it hasn't caught up with
    const roomGame = room?.round?.game;
    const game = guessedGame && (!roomGame || (roomGame.guesses?.length ?? 0) < guessedGame.n)
        ? guessedGame.game
        : roomGame;

    return { room, game, connection, closedReason, offset, error, clearError: () => setError(null), send };
}

// The server's time now, ticking every interval ms while active
export function useServerNow(offset: number, active: boolean, interval = 250): number {
    const [ now, setNow ] = useState(() => Date.now());
    useEffect(() => {
        if(!active) return;
        const t = setInterval(() => setNow(Date.now()), interval);
        return () => clearInterval(t);
    }, [active, interval]);
    return now + offset;
}
