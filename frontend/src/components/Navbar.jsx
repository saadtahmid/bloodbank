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

    return (
        <nav className="glass-effect sticky top-0 z-50 shadow-2xl">
            <ul className="flex justify-center gap-8 py-4 relative">
                <li className="transform transition-all duration-200 hover:scale-110">
                    <a href="#home" className="text-white hover:text-red-400 font-semibold transition-all duration-300 hover:drop-shadow-lg">
                        Home
                    </a>
                </li>
                <li className="transform transition-all duration-200 hover:scale-110">
                    <a href="#about" className="text-white hover:text-red-400 font-semibold transition-all duration-300 hover:drop-shadow-lg">
                        About
                    </a>
                </li>
                <li
                    className="relative transform transition-all duration-200 hover:scale-110"
                    onMouseEnter={() => setShowLookingDropdown(true)}
                    onMouseLeave={() => setShowLookingDropdown(false)}
                >
                    <a href="#looking-for-blood" className="text-white hover:text-red-400 font-semibold transition-all duration-300 hover:drop-shadow-lg">
                        Looking for Blood
                    </a>
                    {showLookingDropdown && (
                        <ul className="absolute left-0 glass-effect rounded-lg shadow-2xl min-w-[200px] mt-2 animate-fadeInUp">
                            <li>
                                <a
                                    href="#blood-bank-directory"
                                    className="block px-4 py-3 text-white hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 rounded-t-lg"
                                >
                                    Blood Bank Directory
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#request-blood"
                                    className="block px-4 py-3 text-white hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 rounded-b-lg"
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
                    <a href="#donate-blood" className="text-white hover:text-red-400 font-semibold transition-all duration-300 hover:drop-shadow-lg">
                        Donate Blood
                    </a>
                    {showDonateDropdown && (
                        <ul className="absolute left-0 glass-effect rounded-lg shadow-2xl min-w-[180px] mt-2 animate-fadeInUp">
                            <li>
                                <a
                                    href="#view-camps"
                                    className="block px-4 py-3 text-white hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 rounded-lg"
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
                            <a href="#camp-registrations" className="text-white hover:text-red-400 font-semibold transition-all duration-300">
                                Camp Registrations
                            </a>
                        </li>
                        <li className="transform transition-all duration-200 hover:scale-110">
                            <a href="#blood-requests" className="text-white hover:text-red-400 font-semibold transition-all duration-300">
                                Blood Requests
                            </a>
                        </li>
                        <li className="transform transition-all duration-200 hover:scale-110">
                            <a href="#blood-inventory" className="text-white hover:text-red-400 font-semibold transition-all duration-300">
                                Blood Inventory
                            </a>
                        </li>
                        <li className="transform transition-all duration-200 hover:scale-110">
                            <a href="#add-donation" className="text-white hover:text-red-400 font-semibold transition-all duration-300">
                                Add Donation
                            </a>
                        </li>
                        <li className="transform transition-all duration-200 hover:scale-110">
                            <a href="#urgent-needs" className="text-white hover:text-red-400 font-semibold transition-all duration-300">
                                Urgent Needs
                            </a>
                        </li>
                    </>
                )}
                {user && user.role && user.role.toLowerCase() === 'donor' && (
                    <li className="transform transition-all duration-200 hover:scale-110">
                        <a href="#urgent-needs" className="text-white hover:text-red-400 font-semibold transition-all duration-300">
                            Urgent Needs
                        </a>
                    </li>
                )}
                <li className="ml-4">
                    {user ? (
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to logout?')) {
                                    setUser(null)
                                    window.location.hash = '#home'
                                }
                            }}
                            className="button-modern text-white px-6 py-2 rounded-full font-semibold shadow-lg"
                        >
                            Logout{user.role ? ` (${user.role})` : ''}
                        </button>
                    ) : (
                        <a
                            href="#login"
                            className="button-modern text-white px-6 py-2 rounded-full font-semibold shadow-lg inline-block"
                        >
                            Login
                        </a>
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
