import type { ButtonProps, ButtonVariant } from '../types'

const variants: Record<ButtonVariant, string> = { //Record is key, value
    primary: "bg-poke hover:bg-poke-dark text-white shadow-lg shadow-poke/20",
    secondary: "bg-surface-2 hover:bg-line text-white border border-line",
}

export default function Button({ children, onClick, variant = "primary", className = "", disabled }: ButtonProps) {

    return(
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${variants[variant]} font-display font-semibold rounded-xl px-5 py-2.5 cursor-pointer transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${className}`}
        >
            {children}
        </button>
    )
}
