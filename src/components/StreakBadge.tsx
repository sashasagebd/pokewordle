import pokeBall from '../assets/pokeball.svg'

export default function StreakBadge({ streak, best }: { streak: number, best: number }) {
    return (
        <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
                <img src={pokeBall} alt="" className="w-full h-full" />
                <span className="absolute inset-0 flex items-center justify-center">
                    <span className="rounded-full bg-white text-ink font-display font-bold text-sm w-7 h-7 flex items-center justify-center shadow">
                        {streak}
                    </span>
                </span>
            </div>
            <div className="text-sm">
                <p className="font-semibold">Streak</p>
                <p className="text-muted">Best <span className="text-gold font-semibold">{best}</span></p>
            </div>
        </div>
    )
}
