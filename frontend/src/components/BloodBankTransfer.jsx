/* filepath: d:\BloodBank\frontend\src\components\BloodBankTransfer.jsx */
import React, { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const BloodBankTransfer = ({ user }) => {
    const [activeTab, setActiveTab] = useState('request')
    const [bloodbanks, setBloodbanks] = useState([])
    const [requests, setRequests] = useState([])
    const [form, setForm] = useState({
        to_bloodbank_id: '',
        blood_type: '',
        units_requested: '',
        message: ''
    })
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user && user.bloodbank_id) {
            fetchBloodBanks()
            fetchRequests()
        }
    }, [user])

    const fetchBloodBanks = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/bloodbanks`)
            const data = await res.json()
            setBloodbanks(data.filter(bb => bb.bloodbank_id !== user.bloodbank_id))
        } catch (err) {
            console.error('Fetch bloodbanks error:', err)
            setBloodbanks([])
        }
    }

    const fetchRequests = async () => {
        try {
            // Updated endpoint to match new backend route
            const res = await fetch(`${API_BASE_URL}/api/blood-requests/bloodbank/${user.bloodbank_id}`)
            const data = await res.json()
            setRequests(data)
        } catch (err) {
            console.error('Fetch requests error:', err)
            setRequests([])
        }
    }

    if (!user || user.role.toLowerCase() !== 'bloodbank') {
        return (
            <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
                <div className="glass-effect rounded-2xl p-12 text-center animate-fadeInUp max-w-md">
                    <div className="text-6xl mb-6">🏪</div>
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Access Restricted</h2>
                    <p className="text-gray-300 leading-relaxed">
                        Only blood bank accounts can access this feature.
                    </p>
                </div>
            </section>
        )
    }

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSendRequest = async e => {
        e.preventDefault()
        setStatus('')
        setLoading(true)

        try {
            // Updated endpoint and payload to match new backend route
            const res = await fetch(`${API_BASE_URL}/api/blood-requests/bloodbank`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from_bloodbank_id: user.bloodbank_id,
                    to_bloodbank_id: Number(form.to_bloodbank_id),
                    blood_type: form.blood_type,
                    units_requested: Number(form.units_requested),
                    message: form.message
                })
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setStatus('✅ Blood request sent successfully!')
                setForm({ to_bloodbank_id: '', blood_type: '', units_requested: '', message: '' })
                fetchRequests()
            } else {
                setStatus(data.error || '❌ Failed to send blood request')
            }
        } catch (err) {
            console.error('Send request error:', err)
            setStatus('❌ Network error. Please try again.')
        }
        setLoading(false)
    }

    const handleRequestAction = async (requestId, action) => {
        setLoading(true)
        try {
            // Updated endpoint to match new backend route
            const res = await fetch(`${API_BASE_URL}/api/blood-requests/bloodbank/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action })
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setStatus(`✅ Request ${action.toLowerCase()} successfully!`)
                fetchRequests()
            } else {
                setStatus(data.error || `❌ Failed to ${action.toLowerCase()} request`)
            }
        } catch (err) {
            console.error('Request action error:', err)
            setStatus('❌ Network error. Please try again.')
        }
        setLoading(false)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
            case 'APPROVED': return 'text-blue-400 bg-blue-500/20 border-blue-500/50'
            case 'FULFILLED': return 'text-green-400 bg-green-500/20 border-green-500/50'
            case 'REJECTED': return 'text-red-400 bg-red-500/20 border-red-500/50'
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50'
        }
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white py-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>

            <div className="relative z-10 max-w-6xl mx-auto px-8">
                <div className="text-center mb-12 animate-fadeInUp">
                    <h2 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center">
                        <span className="mr-3">🩸</span>
                        Blood Bank Network
                    </h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Request blood from other blood banks and manage incoming requests
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <div className="glass-effect rounded-xl p-2 flex">
                        <button
                            onClick={() => setActiveTab('request')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'request'
                                    ? 'bg-red-500 text-white shadow-lg'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                }`}
                        >
                            🩸 Send Request
                        </button>
                        <button
                            onClick={() => setActiveTab('received')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'received'
                                    ? 'bg-red-500 text-white shadow-lg'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                }`}
                        >
                            📥 Received Requests
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'history'
                                    ? 'bg-red-500 text-white shadow-lg'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                }`}
                        >
                            📋 History
                        </button>
                    </div>
                </div>

                {status && (
                    <div className={`p-4 rounded-xl mb-6 text-center font-semibold animate-fadeInUp ${status.includes('✅')
                            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                            : 'bg-red-500/20 border border-red-500/50 text-red-400'
                        }`}>
                        {status}
                    </div>
                )}

                {/* Send Request Tab */}
                {activeTab === 'request' && (
                    <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <form onSubmit={handleSendRequest} className="glass-effect rounded-2xl p-8">
                            <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center">
                                <span className="mr-2">🩸</span>
                                Request Blood from Another Blood Bank
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-red-400 mb-2">
                                        Request From Blood Bank *
                                    </label>
                                    <select
                                        className="input-modern w-full px-4 py-3 rounded-xl text-white"
                                        name="to_bloodbank_id"
                                        value={form.to_bloodbank_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Blood Bank</option>
                                        {bloodbanks.map(bb => (
                                            <option key={bb.bloodbank_id} value={bb.bloodbank_id} className="bg-gray-800">
                                                {bb.name} - {bb.location}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-red-400 mb-2">
                                        Blood Type Needed *
                                    </label>
                                    <select
                                        className="input-modern w-full px-4 py-3 rounded-xl text-white"
                                        name="blood_type"
                                        value={form.blood_type}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Blood Type</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                            <option key={type} value={type} className="bg-gray-800">
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-red-400 mb-2">
                                    Units Needed *
                                </label>
                                <input
                                    className="input-modern w-full px-4 py-3 rounded-xl text-white"
                                    type="number"
                                    name="units_requested"
                                    placeholder="Number of units needed"
                                    min="1"
                                    value={form.units_requested}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-red-400 mb-2">
                                    Message (Optional)
                                </label>
                                <textarea
                                    className="input-modern w-full px-4 py-3 rounded-xl text-white resize-none"
                                    name="message"
                                    placeholder="Reason for request (e.g., emergency, low stock, patient need)"
                                    rows="3"
                                    value={form.message}
                                    onChange={handleChange}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="button-modern w-full py-4 rounded-xl font-semibold text-white shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-200"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                        Sending Request...
                                    </span>
                                ) : (
                                    'Send Blood Request'
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Received Requests Tab */}
                {activeTab === 'received' && (
                    <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <div className="glass-effect rounded-2xl p-8">
                            <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center">
                                <span className="mr-2">📥</span>
                                Incoming Blood Requests
                            </h3>

                            <div className="space-y-4">
                                {requests.filter(r => r.to_bloodbank_id === user.bloodbank_id && r.status === 'PENDING').length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📭</div>
                                        <p className="text-gray-400">No pending blood requests</p>
                                    </div>
                                ) : (
                                    requests
                                        .filter(r => r.to_bloodbank_id === user.bloodbank_id && r.status === 'PENDING')
                                        .map(request => (
                                            <div key={request.bb_request_id || request.request_id} className="bg-gray-900/50 rounded-xl p-6">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <h4 className="text-lg font-semibold text-white mr-4">
                                                                Blood Request #{request.bb_request_id || request.request_id}
                                                            </h4>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                                                                {request.status}
                                                            </span>
                                                        </div>
                                                        <div className="grid md:grid-cols-4 gap-4 text-sm mb-3">
                                                            <div>
                                                                <span className="text-gray-400">From:</span>
                                                                <div className="text-white font-semibold">{request.from_name}</div>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-400">Blood Type:</span>
                                                                <div className="text-red-400 font-bold">{request.blood_type}</div>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-400">Units:</span>
                                                                <div className="text-white font-semibold">{request.units_requested}</div>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-400">Date:</span>
                                                                <div className="text-white">{request.request_date}</div>
                                                            </div>
                                                        </div>
                                                        {request.message && (
                                                            <div className="bg-gray-800/50 rounded-lg p-3">
                                                                <span className="text-gray-400 text-sm">Message:</span>
                                                                <div className="text-white">{request.message}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <button
                                                            onClick={() => handleRequestAction(request.bb_request_id || request.request_id, 'APPROVED')}
                                                            disabled={loading}
                                                            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50 transition-all duration-200"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRequestAction(request.bb_request_id || request.request_id, 'REJECTED')}
                                                            disabled={loading}
                                                            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50 transition-all duration-200"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <div className="glass-effect rounded-2xl p-8">
                            <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center">
                                <span className="mr-2">📋</span>
                                Request History
                            </h3>

                            <div className="space-y-4">
                                {requests.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📋</div>
                                        <p className="text-gray-400">No request history</p>
                                    </div>
                                ) : (
                                    requests.map(request => (
                                        <div key={request.bb_request_id || request.request_id} className="bg-gray-900/50 rounded-xl p-6">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center mb-2">
                                                        <h4 className="text-lg font-semibold text-white mr-4">
                                                            Request #{request.bb_request_id || request.request_id}
                                                        </h4>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                                                            {request.status}
                                                        </span>
                                                        <span className="ml-2 text-xs text-gray-400">
                                                            {request.from_bloodbank_id === user.bloodbank_id ? '📤 Sent' : '📥 Received'}
                                                        </span>
                                                    </div>
                                                    <div className="grid md:grid-cols-5 gap-4 text-sm mb-3">
                                                        <div>
                                                            <span className="text-gray-400">
                                                                {request.from_bloodbank_id === user.bloodbank_id ? 'To:' : 'From:'}
                                                            </span>
                                                            <div className="text-white font-semibold">
                                                                {request.from_bloodbank_id === user.bloodbank_id ? request.to_name : request.from_name}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">Blood Type:</span>
                                                            <div className="text-red-400 font-bold">{request.blood_type}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">Units:</span>
                                                            <div className="text-white font-semibold">{request.units_requested}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">Date:</span>
                                                            <div className="text-white">{request.request_date}</div>
                                                        </div>
                                                        <div>
                                                            {request.status === 'APPROVED' && request.to_bloodbank_id === user.bloodbank_id && (
                                                                <button
                                                                    onClick={() => handleRequestAction(request.bb_request_id || request.request_id, 'FULFILLED')}
                                                                    disabled={loading}
                                                                    className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white text-xs font-semibold disabled:opacity-50 transition-all duration-200"
                                                                >
                                                                    Mark Fulfilled
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {request.message && (
                                                        <div className="bg-gray-800/50 rounded-lg p-3">
                                                            <span className="text-gray-400 text-sm">Message:</span>
                                                            <div className="text-white">{request.message}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default BloodBankTransfer