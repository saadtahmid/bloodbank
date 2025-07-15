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
        } else {
            // Reset notifications when user logs out
            setNotifications([])
            setLoading(false)
        }
    }, [user])

    const handleMarkSeen = async (notification_id) => {
        await fetch(`${API_BASE_URL}/api/notifications/seen/${notification_id}`, {
            method: 'POST'
        })
        setNotifications(notifications.filter(n => n.notification_id !== notification_id))
    }

    return (
        <div className="bg-gray-900 backdrop-blur-xl border border-gray-600 rounded-2xl p-6 w-96 absolute right-0 top-14 z-50 shadow-2xl animate-fadeInUp">
            <h3 className="text-xl font-bold gradient-text mb-4 flex items-center">
                <span className="mr-2">🔔</span>
                Notifications
            </h3>
            {loading ? (
                <div className="text-gray-200 text-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <span>Loading notifications...</span>
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-gray-200 text-center py-8">
                    <div className="text-4xl mb-2">📭</div>
                    <span className="font-medium">No new notifications.</span>
                </div>
            ) : (
                <div className="space-y-3 max-h-80 overflow-hidden">
                    {notifications.slice(0, 4).map(n => (
                        <div key={n.notification_id} className="bg-gray-800 border border-gray-600 rounded-xl p-4 hover:bg-gray-700 transition-all duration-200 hover:scale-[1.02] flex justify-between items-start">
                            <div className="flex-1">
                                <div className="text-white text-sm leading-relaxed font-medium">{n.description}</div>
                                <div className="text-xs text-gray-200 mt-2 flex items-center">
                                    <span className="mr-1">🕒</span>
                                    {new Date(n.time).toLocaleString()}
                                </div>
                            </div>
                            <button
                                className="ml-3 text-red-400 hover:text-red-300 hover:bg-red-500/30 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 font-bold"
                                onClick={() => handleMarkSeen(n.notification_id)}
                                title="Mark as seen"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    {notifications.length > 4 && (
                        <div className="text-center py-2">
                            <span className="text-gray-300 text-xs">
                                +{notifications.length - 4} more notifications
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default NotificationMenu