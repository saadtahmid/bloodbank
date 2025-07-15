import React, { useEffect, useState } from 'react'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const BloodBankRequests = ({ user }) => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user && user.bloodbank_id) {
            setLoading(true)
            fetch(`${API_BASE_URL}/api/blood-requests/for-bank/${user.bloodbank_id}`)
                .then(res => res.json())
                .then(data => setRequests(data))
                .catch(() => setRequests([]))
                .finally(() => setLoading(false))
        }
    }, [user])

    const handleFulfill = async (request_id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/blood-requests/fulfill/${request_id}`, {
                method: 'POST'
            })
            const data = await res.json()
            if (res.ok && data.success) {
                alert('Request fulfilled successfully!')
                setRequests(prev =>
                    prev.map(r =>
                        r.request_id === request_id
                            ? { ...r, status: 'FULFILLED' }
                            : r
                    )
                )
            } else {
                alert(data.error || 'Failed to fulfill request')
            }
        } catch {
            alert('Network error')
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
            case 'FULFILLED': return 'text-green-400 bg-green-500/20 border-green-500/50'
            case 'REJECTED': return 'text-red-400 bg-red-500/20 border-red-500/50'
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50'
        }
    }

    if (!user || user.role.toLowerCase() !== 'bloodbank') {
        return (
            <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
                <div className="glass-effect rounded-2xl p-12 text-center animate-fadeInUp max-w-md">
                    <div className="text-6xl mb-6">🏥</div>
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Access Restricted</h2>
                    <p className="text-gray-300 leading-relaxed">
                        Only blood banks can view blood requests.
                    </p>
                </div>
            </section>
        )
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white py-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>

            <div className="relative z-10 max-w-6xl mx-auto px-8">
                <div className="text-center mb-12 animate-fadeInUp">
                    <h2 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center">
                        <span className="mr-3">📋</span>
                        Blood Requests
                    </h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Manage incoming blood requests from hospitals
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-fadeInUp">
                        <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-gray-400">Loading requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20 animate-fadeInUp">
                        <div className="glass-effect rounded-2xl p-12 max-w-md mx-auto">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-2xl font-bold text-red-400 mb-4">No Requests</h3>
                            <p className="text-gray-300">No blood requests have been received yet.</p>
                        </div>
                    </div>
                ) : (
                    <div className="glass-effect rounded-2xl overflow-hidden animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-red-400 font-semibold">Hospital</th>
                                        <th className="px-6 py-4 text-left text-red-400 font-semibold">Blood Type</th>
                                        <th className="px-6 py-4 text-left text-red-400 font-semibold">Units</th>
                                        <th className="px-6 py-4 text-left text-red-400 font-semibold">Date</th>
                                        <th className="px-6 py-4 text-left text-red-400 font-semibold">Status</th>
                                        <th className="px-6 py-4 text-left text-red-400 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((r, index) => (
                                        <tr
                                            key={r.request_id}
                                            className="border-t border-gray-700/50 hover:bg-white/5 transition-colors duration-200"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            <td className="px-6 py-4 text-white font-semibold">{r.hospital_name}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-red-400 font-bold text-lg">{r.blood_type}</span>
                                            </td>
                                            <td className="px-6 py-4 text-white font-semibold">{r.units_requested}</td>
                                            <td className="px-6 py-4 text-gray-300">{r.request_date}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(r.status)}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {r.status === 'PENDING' ? (
                                                    <button
                                                        className="button-modern px-4 py-2 rounded-xl font-semibold text-white shadow-lg hover:scale-105 transition-transform duration-200"
                                                        onClick={() => handleFulfill(r.request_id)}
                                                    >
                                                        Fulfill
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default BloodBankRequests