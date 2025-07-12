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
                <li className="relative">
                    <button
                        className="relative"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <span role="img" aria-label="notifications" className="text-2xl">🔔</span>
                        {notifCount > 0 && (
                            <span
                                className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full text-xs px-2 py-0.5 shadow"
                                style={{ minWidth: '1.5em', textAlign: 'center' }}
                            >
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
