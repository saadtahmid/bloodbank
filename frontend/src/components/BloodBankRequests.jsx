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
        if (!window.confirm('Are you sure you want to fulfill this request?')) return
        try {
            const res = await fetch(`${API_BASE_URL}/api/blood-requests/fulfill/${request_id}`, {
                method: 'POST'
            })
            const data = await res.json()
            if (res.ok && data.success) {
                alert('Request fulfilled!')
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

    if (!user || user.role.toLowerCase() !== 'bloodbank') {
        return <div className="text-center text-red-500 mt-10">Only blood banks can view this page.</div>
    }

    return (
        <section className="bg-black text-white py-8 flex flex-col items-center min-h-screen">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Incoming Blood Requests</h2>
            {loading ? (
                <div className="text-gray-400">Loading...</div>
            ) : requests.length === 0 ? (
                <div className="text-gray-400">No requests found.</div>
            ) : (
                <table className="min-w-full bg-gray-900 border border-red-500 rounded">
                    <thead>
                        <tr>
                            <th className="px-2 py-1 border-b border-red-500">Hospital</th>
                            <th className="px-2 py-1 border-b border-red-500">Blood Type</th>
                            <th className="px-2 py-1 border-b border-red-500">Units</th>
                            <th className="px-2 py-1 border-b border-red-500">Date</th>
                            <th className="px-2 py-1 border-b border-red-500">Status</th>
                            <th className="px-2 py-1 border-b border-red-500">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(r => (
                            <tr key={r.request_id}>
                                <td className="px-2 py-1">{r.hospital_name}</td>
                                <td className="px-2 py-1">{r.blood_type}</td>
                                <td className="px-2 py-1">{r.units_requested}</td>
                                <td className="px-2 py-1">{r.request_date}</td>
                                <td className="px-2 py-1">{r.status}</td>
                                <td className="px-2 py-1">
                                    {r.status === 'PENDING' ? (
                                        <button
                                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded font-semibold"
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
            )}
        </section>
    )
}

export default BloodBankRequests