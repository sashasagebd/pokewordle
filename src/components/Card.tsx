import type { CardProps } from "../types"

// Base surface used across every page so panels look the same everywhere
export default function Card({ children, className = "" }: CardProps) {

    return(
        <div className={`rounded-2xl border border-line bg-surface/80 backdrop-blur shadow-xl shadow-black/30 ${className}`}>
            {children}
        </div>
    )
}
