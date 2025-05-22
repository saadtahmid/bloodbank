import React from 'react'

const Navbar = () => (
    <nav className="bg-black shadow-md sticky top-0 z-50">
        <ul className="flex justify-center gap-8 py-4">
            <li>
                <a href="#home" className="text-white hover:text-red-500 font-semibold transition-colors">Home</a>
            </li>
            <li>
                <a href="#about" className="text-white hover:text-red-500 font-semibold transition-colors">About</a>
            </li>
            <li>
                <a href="#looking-for-blood" className="text-white hover:text-red-500 font-semibold transition-colors">Looking for Blood</a>
            </li>
            <li>
                <a href="#donate-blood" className="text-white hover:text-red-500 font-semibold transition-colors">Donate Blood</a>
            </li>
        </ul>
    </nav>
)

export default Navbar
