import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Mode } from '../types'
import { Back } from './Icons'

const pill = "flex items-center gap-1 rounded-full border border-line bg-surface-2 hover:bg-line p-1.5 sm:pl-2 sm:pr-3 text-sm font-semibold text-muted hover:text-white transition"

// Shared page frame for every game mode: back button, title, a link to the
// mode's leaderboard, centered content
export default function GameLayout({ title, subtitle, mode, children }: { title: string, subtitle?: string, mode?: Mode, children: ReactNode }) {

    return(
        <div className="min-h-screen flex flex-col">
            <header className="grid grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 py-4">
                <Link
                    to="/"
                    aria-label="Back to home"
                    className={`justify-self-start ${pill}`}
                >
                    <Back /><span className="hidden sm:inline">Home</span>
                </Link>
                <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
                    {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
                </div>
                {mode && (
                    <Link to={`/leaderboard?mode=${mode}`} className={`justify-self-end ${pill} sm:pl-3`}>
                        <span aria-hidden="true">🏆</span><span className="hidden sm:inline">Leaderboard</span>
                    </Link>
                )}
            </header>
            <main className="flex-1 flex flex-col items-center px-4 pb-10">
                {children}
            </main>
        </div>
    )
}
