import { useState, type FormEvent } from 'react'
import { ApiError, claimName, logIn, logOut } from '../services/pokeApi'
import { usePlayer } from '../usePlayer'
import Card from './Card'
import Button from './Button'

const input = "w-full rounded-xl border border-line bg-surface px-4 py-2.5 placeholder:text-muted outline-none focus:border-poke focus:ring-4 focus:ring-poke/20 transition"

// Who you're playing as: a guest who can claim a name or log in, or a named
// player who can log out
export default function AccountCard() {
    const { me, refresh } = usePlayer();
    const [ form, setForm ] = useState<"claim" | "login" | null>(null);
    const [ username, setUsername ] = useState<string>('');
    const [ password, setPassword ] = useState<string>('');
    const [ error, setError ] = useState<string>('');
    const [ busy, setBusy ] = useState<boolean>(false);

    function open(which: "claim" | "login") {
        setForm(which);
        setError('');
        setPassword('');
    }

    async function submit(e: FormEvent) {
        e.preventDefault();
        if(busy) return;
        setBusy(true);
        setError('');
        try {
            if(form === "claim") {
                await claimName(username.trim(), password);
            } else {
                await logIn(username.trim(), password);
            }
            await refresh();
            setForm(null);
            setPassword('');
        } catch(err) {
            // The server's messages for these are meant for the player
            setError(err instanceof ApiError && err.status < 500 ? err.message : "Couldn't reach the server. Try again.");
        } finally {
            setBusy(false);
        }
    }

    async function signOut() {
        setBusy(true);
        try {
            await logOut();
        } catch(err) {
            console.error(err); // the token is forgotten either way
        }
        await refresh();
        setBusy(false);
    }

    if(!me) return null;

    if(me.username) {
        return (
            <Card className="mt-8 w-full max-w-4xl p-5 flex flex-wrap items-center gap-3 justify-between">
                <p>Playing as <span className="font-semibold text-gold">{me.username}</span></p>
                <Button variant="secondary" onClick={signOut} disabled={busy}>Log out</Button>
            </Card>
        );
    }

    return (
        <Card className="mt-8 w-full max-w-4xl p-5">
            <div className="flex flex-wrap items-center gap-3 justify-between">
                <div>
                    <h2 className="font-semibold text-lg">Playing as a guest</h2>
                    <p className="text-sm text-muted">Claim a name to get on the leaderboards. Everything you've played comes with you.</p>
                </div>
                {!form && (
                    <div className="flex gap-2">
                        <Button onClick={() => open("claim")}>Claim a name</Button>
                        <Button variant="secondary" onClick={() => open("login")}>Log in</Button>
                    </div>
                )}
            </div>

            {form && (
                <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] items-start">
                    <input
                        className={input}
                        placeholder="Name"
                        autoComplete="username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        maxLength={20}
                        required
                        autoFocus
                    />
                    <input
                        className={input}
                        type="password"
                        placeholder={form === "claim" ? "Password (8+ characters)" : "Password"}
                        autoComplete={form === "claim" ? "new-password" : "current-password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        maxLength={128}
                        required
                    />
                    <Button type="submit" disabled={busy}>{form === "claim" ? "Claim" : "Log in"}</Button>
                    <Button variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
                    {form === "login" && !error && (
                        <p className="text-sm text-muted sm:col-span-4">What you've played here as a guest joins the account.</p>
                    )}
                    {error && <p className="text-sm text-bad sm:col-span-4">{error}</p>}
                </form>
            )}
        </Card>
    );
}
