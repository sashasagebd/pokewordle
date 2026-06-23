import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function GuessPokemon() {

    return(
        <div className="w-screen h-screen">
            <Link to="/" className="w-10 h-10 bg-white hover:bg-gray-100 cursor-pointer text-black rounded-full absolute top-5 left-5 flex items-center justify-center">X</Link>
        </div>
    )
}