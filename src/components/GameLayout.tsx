import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Back } from './Icons'

// Shared page frame for every game mode: back button, title, centered content
export default function GameLayout({ title, subtitle, children }: { title: string, subtitle?: string, children: ReactNode }) {

    return(
        <div className="min-h-screen flex flex-col">
            <header className="grid grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 py-4">
                <Link
                    to="/"
                    aria-label="Back to home"
                    className="justify-self-start flex items-center gap-1 rounded-full border border-line bg-surface-2 hover:bg-line p-1.5 sm:pl-2 sm:pr-3 text-sm font-semibold text-muted hover:text-white transition"
                >
                    <Back /><span className="hidden sm:inline">Home</span>
                </Link>
                <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
                    {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
                </div>
            </header>
            <main className="flex-1 flex flex-col items-center px-4 pb-10">
                {children}
            </main>
        </div>
    )
}
