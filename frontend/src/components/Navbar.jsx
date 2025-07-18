import React, { useState, useRef, useEffect } from 'react'
import NotificationMenu from './NotificationMenu'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const Navbar = ({ user, setUser }) => {
    const [showLookingDropdown, setShowLookingDropdown] = useState(false)
    const [showDonateDropdown, setShowDonateDropdown] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifCount, setNotifCount] = useState(0)
    const notifRef = useRef(null)

    useEffect(() => {
        if (user && user.user_id) {
            fetch(`${API_BASE_URL}/api/notifications/latest/${user.user_id}`)
                .then(res => res.json())
                .then(data => setNotifCount(data.length))
                .catch(() => setNotifCount(0))
        } else {
            // Reset notification count when user logs out
            setNotifCount(0)
        }
    }, [user, showNotifications])

    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
        }
        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside)
        } else {
            document.removeEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showNotifications])

    const handleNavClick = (hash) => {
        // Close any open dropdowns
        setShowNotifications(false)
        setShowLookingDropdown(false)
        setShowDonateDropdown(false)

        // Navigate to the hash
        window.location.hash = hash

        // Wait for the component to render, then scroll to it
        setTimeout(() => {
            if (hash === '#home') {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            } else if (hash === '#about') {
                const aboutElement = document.querySelector('#about')
                if (aboutElement) {
                    aboutElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }
            } else {
                // For other components, scroll to the main content area
                const mainElement = document.querySelector('main') || document.querySelector('.main-content')
                if (mainElement) {
                    mainElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
                } else {
                    // Fallback: scroll to top
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }
            }
        }, 150)
    }

    const handleLoginClick = (e) => {
        e.preventDefault()
        handleNavClick('#login')
    }

    return (
        <nav className="glass-effect sticky top-0 z-50 shadow-2xl">
            <ul className="flex justify-center gap-8 py-4 relative">
                <li className="transform transition-all duration-200 hover:scale-110">
                    <a
                        href="#home"
                        className="text-white hover:text-red-400 font-semibold transition-all duration-300 hover:drop-shadow-lg"
                        onClick={() => handleNavClick('#home')}
                    >
                        Home
                    </a>
                </li>
                <li className="transform transition-all duration-200 hover:scale-110">
                    <a
                        href="#about"
                        className="text-white hover:text-red-400 font-semibold transition-all duration-300 hover:drop-shadow-lg"
                        onClick={() => handleNavClick('#about')}
                    >
                        About
                    </a>
                </li>
                <li
                    className="relative transform transition-all duration-200 hover:scale-110"
                    onMouseEnter={() => setShowLookingDropdown(true)}
                    onMouseLeave={() => setShowLookingDropdown(false)}
                >
                    <span className="text-white hover:text-red-400 font-semibold transition-all duration-300 hover:drop-shadow-lg cursor-pointer flex items-center">
                        Looking for Blood
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                    {showLookingDropdown && (
                        <ul className="absolute left-0 glass-effect rounded-lg shadow-2xl min-w-[200px] mt-2 animate-fadeInUp">
                            <li>
                                <a
                                    href="#blood-bank-directory"
                                    className="block px-4 py-3 text-white hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 rounded-t-lg"
                                    onClick={() => handleNavClick('#blood-bank-directory')}
                                >
                                    Blood Bank Directory
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#request-blood"
                                    className="block px-4 py-3 text-white hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 rounded-b-lg"
                                    onClick={() => handleNavClick('#request-blood')}
                                >
                                    Request Blood
                                </a>
                            </li>
                        </ul>
                    )}
                </li>
                <li
                    className="relative transform transition-all duration-200 hover:scale-110"
                    onMouseEnter={() => setShowDonateDropdown(true)}
                    onMouseLeave={() => setShowDonateDropdown(false)}
                >
                    <span className="text-white hover:text-red-400 font-semibold transition-all duration-300 hover:drop-shadow-lg cursor-pointer flex items-center">
                        Donate Blood
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                    {showDonateDropdown && (
                        <ul className="absolute left-0 glass-effect rounded-lg shadow-2xl min-w-[180px] mt-2 animate-fadeInUp">
                            <li>
                                <a
                                    href="#view-camps"
                                    className="block px-4 py-3 text-white hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 rounded-lg"
                                    onClick={() => handleNavClick('#view-camps')}
                                >
                                    View Camps
                                </a>
                            </li>
                        </ul>
                    )}
                </li>
                {user && user.role && user.role.toLowerCase() === 'bloodbank' && (
                    <>
                        <li className="transform transition-all duration-200 hover:scale-110">
                            <a
                                href="#camp-registrations"
                                className="text-white hover:text-red-400 font-semibold transition-all duration-300"
                                onClick={() => handleNavClick('#camp-registrations')}
                            >
                                Camp Registrations
                            </a>
                        </li>
                        <li className="transform transition-all duration-200 hover:scale-110">
                            <a
                                href="#blood-requests"
                                className="text-white hover:text-red-400 font-semibold transition-all duration-300"
                                onClick={() => handleNavClick('#blood-requests')}
                            >
                                Blood Requests
                            </a>
                        </li>
                        <li className="transform transition-all duration-200 hover:scale-110">
                            <a
                                href="#blood-inventory"
                                className="text-white hover:text-red-400 font-semibold transition-all duration-300"
                                onClick={() => handleNavClick('#blood-inventory')}
                            >
                                Blood Inventory
                            </a>
                        </li>
                        <li className="transform transition-all duration-200 hover:scale-110">
                            <a
                                href="#add-donation"
                                className="text-white hover:text-red-400 font-semibold transition-all duration-300"
                                onClick={() => handleNavClick('#add-donation')}
                            >
                                Add Donation
                            </a>
                        </li>
                        <li className="transform transition-all duration-200 hover:scale-110">
                            <a
                                href="#urgent-needs"
                                className="text-white hover:text-red-400 font-semibold transition-all duration-300"
                                onClick={() => handleNavClick('#urgent-needs')}
                            >
                                Urgent Needs
                            </a>
                        </li>
                    </>
                )}
                {user && user.role && user.role.toLowerCase() === 'donor' && (
                    <li className="transform transition-all duration-200 hover:scale-110">
                        <a
                            href="#urgent-needs"
                            className="text-white hover:text-red-400 font-semibold transition-all duration-300"
                            onClick={() => handleNavClick('#urgent-needs')}
                        >
                            Urgent Needs
                        </a>
                    </li>
                )}
                <li className="ml-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            {/* Profile Link */}
                            <a
                                href="#profile"
                                className="text-white hover:text-red-400 font-semibold transition-all duration-300 hover:drop-shadow-lg flex items-center"
                                onClick={() => handleNavClick('#profile')}
                            >
                                <span className="mr-1">👤</span>
                                Profile
                            </a>

                            {/* Logout Button */}
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to logout?')) {
                                        setUser(null)
                                        handleNavClick('#home')
                                    }
                                }}
                                className="button-modern text-white px-6 py-2 rounded-full font-semibold shadow-lg"
                            >
                                Logout{user.role ? ` (${user.role})` : ''}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleLoginClick}
                            className="button-modern text-white px-6 py-2 rounded-full font-semibold shadow-lg"
                        >
                            Login
                        </button>
                    )}
                </li>
                <li className="relative">
                    <button
                        className="relative p-2 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <span role="img" aria-label="notifications" className="text-2xl drop-shadow-lg">🔔</span>
                        {notifCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-xs px-2 py-1 shadow-lg animate-pulse-gentle">
                                {notifCount}
                            </span>
                        )}
                    </button>
                    {showNotifications && (
                        <div ref={notifRef}>
                            <NotificationMenu user={user} />
                        </div>
                    )}
                </li>
            </ul>
        </nav>
    )
}

export default Navbar
