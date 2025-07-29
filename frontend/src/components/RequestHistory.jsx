import React, { useEffect, useState } from 'react'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const RequestHistory = ({ user }) => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState({
        totalRequests: 0,
        totalUnitsRequested: 0,
        fulfilledRequests: 0,
        pendingRequests: 0
    })

    useEffect(() => {
        if (user && user.hospital_id) {
            setLoading(true)
            fetch(`${API_BASE_URL}/api/blood-requests/history/${user.hospital_id}`)
                .then(res => res.json())
                .then(data => {
                    setRequests(data)
                    calculateStats(data)
                })
                .catch(() => setRequests([]))
                .finally(() => setLoading(false))
        }
    }, [user])

    const calculateStats = (requestData) => {
        const totalRequests = requestData.length
        const totalUnitsRequested = requestData.reduce((sum, req) => sum + req.units_requested, 0)
        const fulfilledRequests = requestData.filter(req => req.status === 'FULFILLED').length
        const pendingRequests = requestData.filter(req => req.status === 'PENDING').length

        setStats({
            totalRequests,
            totalUnitsRequested,
            fulfilledRequests,
            pendingRequests
        })
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
            case 'FULFILLED': return 'text-green-400 bg-green-500/20 border-green-500/50'
            case 'APPROVED': return 'text-blue-400 bg-blue-500/20 border-blue-500/50'
            case 'REJECTED': return 'text-red-400 bg-red-500/20 border-red-500/50'
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50'
        }
    }

    const getBloodTypeColor = (bloodType) => {
        const colors = {
            'A+': 'bg-red-500/20 text-red-400 border-red-500/50',
            'A-': 'bg-red-600/20 text-red-300 border-red-600/50',
            'B+': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
            'B-': 'bg-blue-600/20 text-blue-300 border-blue-600/50',
            'AB+': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
            'AB-': 'bg-purple-600/20 text-purple-300 border-purple-600/50',
            'O+': 'bg-green-500/20 text-green-400 border-green-500/50',
            'O-': 'bg-green-600/20 text-green-300 border-green-600/50'
        }
        return colors[bloodType] || 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'EMERGENCY': return 'text-red-400 bg-red-500/20 border-red-500/50'
            case 'URGENT': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
            case 'NORMAL': return 'text-green-400 bg-green-500/20 border-green-500/50'
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50'
        }
    }

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'EMERGENCY': return '🚨'
            case 'URGENT': return '⚡'
            case 'NORMAL': return '✅'
            default: return '📄'
        }
    }

    const formatRequiredBy = (required_by) => {
        if (!required_by) return null
        try {
            const date = new Date(required_by)
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
        } catch {
            return null
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading request history...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 p-4">
            <div className="container mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">My Blood Requests</h1>
                    <p className="text-gray-300">Track all your blood requests and their status</p>
                </div>

                {/* Statistics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Requests</p>
                                <p className="text-3xl font-bold text-white">{stats.totalRequests}</p>
                            </div>
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Units Requested</p>
                                <p className="text-3xl font-bold text-white">{stats.totalUnitsRequested}</p>
                            </div>
                            <div className="p-3 bg-red-500/20 rounded-lg">
                                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Fulfilled</p>
                                <p className="text-3xl font-bold text-white">{stats.fulfilledRequests}</p>
                            </div>
                            <div className="p-3 bg-green-500/20 rounded-lg">
                                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Pending</p>
                                <p className="text-3xl font-bold text-white">{stats.pendingRequests}</p>
                            </div>
                            <div className="p-3 bg-yellow-500/20 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Request History */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
                    <div className="p-6 border-b border-gray-700">
                        <h2 className="text-2xl font-bold text-white">Request History</h2>
                        <p className="text-gray-400 mt-2">Detailed view of all your blood requests</p>
                    </div>

                    <div className="p-6">
                        {requests.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Requests Yet</h3>
                                <p className="text-gray-500">You haven't made any blood requests yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {requests.map((request) => (
                                    <div key={request.request_id} className="bg-gray-900/50 rounded-lg border border-gray-700 p-6 hover:border-red-500/50 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center space-x-3 flex-wrap">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getBloodTypeColor(request.blood_type)}`}>
                                                    {request.blood_type}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(request.priority || 'NORMAL')}`}>
                                                    {getPriorityIcon(request.priority || 'NORMAL')} {request.priority || 'NORMAL'}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-400 text-sm">Request ID</p>
                                                <p className="text-white font-mono text-sm">#{request.request_id}</p>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-white mb-2">
                                                {request.bloodbank_name || 'Unknown Blood Bank'}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-400">Units Requested</p>
                                                    <p className="text-white font-semibold">{request.units_requested}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Location</p>
                                                    <p className="text-white">{request.bloodbank_location || 'N/A'}</p>
                                                </div>
                                                {formatRequiredBy(request.required_by) && (
                                                    <>
                                                        <div>
                                                            <p className="text-gray-400">Required By</p>
                                                            <p className="text-yellow-300 font-semibold">{formatRequiredBy(request.required_by)}</p>
                                                        </div>
                                                        <div></div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {request.patient_condition && (
                                            <div className="mb-4 bg-gray-800/50 rounded-lg p-3">
                                                <p className="text-gray-400 text-sm">Patient Condition</p>
                                                <p className="text-white">{request.patient_condition}</p>
                                            </div>
                                        )}

                                        {request.bloodbank_phone && (
                                            <div className="mb-4">
                                                <p className="text-gray-400 text-sm">Contact</p>
                                                <p className="text-white">{request.bloodbank_phone}</p>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center text-sm">
                                            <div>
                                                <p className="text-gray-400">Requested on</p>
                                                <p className="text-white">{request.request_date}</p>
                                            </div>
                                            {request.broadcast_to_multiple && (
                                                <div className="text-right">
                                                    <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full border border-blue-500/50">
                                                        📢 Broadcast
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Impact Section */}
                {requests.length > 0 && (
                    <div className="mt-8 bg-gradient-to-r from-red-900/30 to-red-800/30 rounded-xl p-6 border border-red-500/30">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-2">Request Summary</h3>
                            <p className="text-gray-300 mb-4">Overview of your blood request activity</p>
                            <div className="flex justify-center items-center space-x-8">
                                <div>
                                    <p className="text-3xl font-bold text-red-400">{stats.fulfilledRequests}</p>
                                    <p className="text-gray-400">Fulfilled Requests</p>
                                </div>
                                <div className="text-red-400 text-4xl">🏥</div>
                                <div>
                                    <p className="text-3xl font-bold text-red-400">
                                        {requests.filter(r => r.status === 'FULFILLED').reduce((sum, r) => sum + r.units_requested, 0)}
                                    </p>
                                    <p className="text-gray-400">Units Received</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RequestHistory
