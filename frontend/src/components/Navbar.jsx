import React, { useState } from 'react'

const Navbar = () => {
    const [showDropdown, setShowDropdown] = useState(false)
    return (
        <nav className="bg-black shadow-md sticky top-0 z-50">
            <ul className="flex justify-center gap-8 py-4 relative">
                <li>
                    <a href="#home" className="text-white hover:text-red-500 font-semibold transition-colors">Home</a>
                </li>
                <li>
                    <a href="#about" className="text-white hover:text-red-500 font-semibold transition-colors">About</a>
                </li>
                <li
                    className="relative"
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                >
                    <a href="#looking-for-blood" className="text-white hover:text-red-500 font-semibold transition-colors">
                        Looking for Blood
                    </a>
                    {showDropdown && (
                        <ul className="absolute left-0  bg-black border border-red-500 rounded shadow-lg min-w-[180px]">
                            <li>
                                <a
                                    href="#blood-bank-directory"
                                    className="block px-2 py-2 text-white hover:bg-red-500 hover:text-white"
                                >
                                    Blood Bank Directory
                                </a>
                            </li>
                        </ul>
                    )}
                </li>
                <li>
                    <a href="#donate-blood" className="text-white hover:text-red-500 font-semibold transition-colors">Donate Blood</a>
                </li>
            </ul>
        </nav>
    )
}

export default Navbar
