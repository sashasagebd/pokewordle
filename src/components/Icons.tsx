type IconProps = { className?: string };

export function ArrowUp({ className = "w-6 h-6" }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
    )
}

export function ArrowDown({ className = "w-6 h-6" }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
    )
}

export function Check({ className = "w-6 h-6" }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
    )
}

export function Back({ className = "w-5 h-5" }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M15 18l-6-6 6-6" />
        </svg>
    )
}
