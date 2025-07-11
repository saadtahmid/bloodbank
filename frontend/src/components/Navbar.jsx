import React, { useState } from 'react'

const Navbar = ({ user, setUser }) => {
    const [showLookingDropdown, setShowLookingDropdown] = useState(false)
    const [showDonateDropdown, setShowDonateDropdown] = useState(false)
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
                    onMouseEnter={() => setShowLookingDropdown(true)}
                    onMouseLeave={() => setShowLookingDropdown(false)}
                >
                    <a href="#looking-for-blood" className="text-white hover:text-red-500 font-semibold transition-colors">
                        Looking for Blood
                    </a>
                    {showLookingDropdown && (
                        <ul className="absolute left-0 bg-black border border-red-500 rounded shadow-lg min-w-[180px]">
                            <li>
                                <a
                                    href="#blood-bank-directory"
                                    className="block px-2 py-2 text-white hover:bg-red-500 hover:text-white"
                                >
                                    Blood Bank Directory
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#request-blood"
                                    className="block px-2 py-2 text-white hover:bg-red-500 hover:text-white"
                                >
                                    Request Blood
                                </a>
                            </li>
                        </ul>
                    )}
                </li>
                <li
                    className="relative"
                    onMouseEnter={() => setShowDonateDropdown(true)}
                    onMouseLeave={() => setShowDonateDropdown(false)}
                >
                    <a href="#donate-blood" className="text-white hover:text-red-500 font-semibold transition-colors">
                        Donate Blood
                    </a>
                    {showDonateDropdown && (
                        <ul className="absolute left-0 bg-black border border-red-500 rounded shadow-lg min-w-[180px]">
                            <li>
                                <a
                                    href="#view-camps"
                                    className="block px-2 py-2 text-white hover:bg-red-500 hover:text-white"
                                >
                                    View Camps
                                </a>
                            </li>
                        </ul>
                    )}
                </li>
                {user && user.role && user.role.toLowerCase() === 'bloodbank' && (
                    <>
                        <li>
                            <a href="#camp-registrations" className="text-white hover:text-red-500 font-semibold transition-colors">
                                Camp Registrations
                            </a>
                        </li>
                        <li>
                            <a href="#blood-requests" className="text-white hover:text-red-500 font-semibold transition-colors">
                                Blood Requests
                            </a>
                        </li>
                        <li>
                            <a href="#blood-inventory" className="text-white hover:text-red-500 font-semibold transition-colors">
                                Blood Inventory
                            </a>
                        </li>
                        <li>
                            <a href="#add-donation" className="text-white hover:text-red-500 font-semibold transition-colors">
                                Add Donation
                            </a>
                        </li>
                        <li>
                            <a href="#urgent-needs" className="text-white hover:text-red-500 font-semibold transition-colors">
                                Urgent Needs
                            </a>
                        </li>
                    </>
                )}
                {user && user.role && user.role.toLowerCase() === 'donor' && (
                    <li>
                        <a href="#urgent-needs" className="text-white hover:text-red-500 font-semibold transition-colors">
                            Urgent Needs
                        </a>
                    </li>
                )}
                <li className="ml-4">
                    {user ? (
                        <button
                            onClick={() => {
                                setUser(null)
                                window.location.hash = '#home'
                            }}
                            className="text-white border border-red-500 px-4 py-1 rounded hover:bg-red-600 hover:text-white transition-colors font-semibold"
                        >
                            Logout{user.role ? ` (${user.role})` : ''}
                        </button>
                    ) : (
                        <a
                            href="#login"
                            className="text-white border border-red-500 px-4 py-1 rounded hover:bg-red-600 hover:text-white transition-colors font-semibold"
                        >
                            Login
                        </a>
                    )}
                </li>
            </ul>
        </nav>
    )
}

export default Navbar
