import React, { useEffect, useState } from 'react'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const NotificationMenu = ({ user }) => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user && user.user_id) {
            setLoading(true)
            fetch(`${API_BASE_URL}/api/notifications/latest/${user.user_id}`)
                .then(res => res.json())
                .then(data => setNotifications(data))
                .catch(() => setNotifications([]))
                .finally(() => setLoading(false))
        }
    }, [user])

    const handleMarkSeen = async (notification_id) => {
        await fetch(`${API_BASE_URL}/api/notifications/seen/${notification_id}`, {
            method: 'POST'
        })
        setNotifications(notifications.filter(n => n.notification_id !== notification_id))
    }

    return (
        <div className="bg-gray-900 border border-red-500 rounded p-4 w-80 absolute right-0 top-12 z-50">
            <h3 className="text-lg font-bold text-red-400 mb-2">Notifications</h3>
            {loading ? (
                <div className="text-gray-400">Loading...</div>
            ) : notifications.length === 0 ? (
                <div className="text-gray-400">No new notifications.</div>
            ) : (
                <ul className="space-y-2">
                    {notifications.map(n => (
                        <li key={n.notification_id} className="bg-black border border-red-400 rounded p-2 flex justify-between items-center">
                            <div>
                                <div className="text-white">{n.description}</div>
                                <div className="text-xs text-gray-400">{new Date(n.time).toLocaleString()}</div>
                            </div>
                            <button
                                className="ml-2 text-red-400 hover:text-red-600 font-bold"
                                onClick={() => handleMarkSeen(n.notification_id)}
                                title="Mark as seen"
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default NotificationMenu