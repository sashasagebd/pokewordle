import type { CardProps } from "../types"


export default function Card({ children, onClick, sprite }: CardProps) {
     
    return(
        <div className="flex justify-center items-center w-full">
            <div className="flex flex-col justify-center items-center w-[80%] h-[80%] rounded-xl border bg-red-600">
                <img className="w-[50%] h-[50%] object-contain" src={sprite} />
                
                    {children}
            </div>
        </div>
    )
}

