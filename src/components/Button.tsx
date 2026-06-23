import type { ButtonProps, ButtonVariant } from '../types'

const variants: Record<ButtonVariant, string> = { //Record is key, value
    red: "bg-red-600 hover:bg-red-700",
    white: "bg-white hover:bg-grey-200",
}

export default function Button({ children, onClick, variant = "red" }: ButtonProps) {

    return(
        <button onClick={onClick} className={`${variants[variant]} rounded-lg px-4 py-2 cursor-pointer transition-colors`}>{children}</button>
    )
}