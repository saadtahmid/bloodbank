import React, { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const RequestBlood = ({ user }) => {
    const [bloodbanks, setBloodbanks] = useState([])
    const [selectedBloodbanks, setSelectedBloodbanks] = useState([])
    const [form, setForm] = useState({
        blood_type: '',
        units_requested: ''
    })
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/bloodbanks`)
            .then(res => res.json())
            .then(data => setBloodbanks(data))
            .catch(() => setBloodbanks([]))
    }, [])

    if (!user) {
        return (
            <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
                <div className="glass-effect rounded-2xl p-12 text-center animate-fadeInUp max-w-md">
                    <div className="text-6xl mb-6">🔐</div>
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Login Required</h2>
                    <p className="text-gray-300 leading-relaxed mb-6">
                        Please login as a hospital to request blood.
                    </p>
                    <a href="#login" className="button-modern px-6 py-3 rounded-xl font-semibold text-white inline-block">
                        Login
                    </a>
                </div>
            </section>
        )
    }

    if (user.role.toLowerCase() !== 'hospital') {
        return (
            <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
                <div className="glass-effect rounded-2xl p-12 text-center animate-fadeInUp max-w-md">
                    <div className="text-6xl mb-6">🏥</div>
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Access Restricted</h2>
                    <p className="text-gray-300 leading-relaxed">
                        Only hospital accounts can request blood.
                    </p>
                </div>
            </section>
        )
    }

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleBloodBankSelection = (bloodbankId) => {
        setSelectedBloodbanks(prev => {
            if (prev.includes(bloodbankId)) {
                return prev.filter(id => id !== bloodbankId)
            } else {
                return [...prev, bloodbankId]
            }
        })
    }

    const selectAllBloodBanks = () => {
        if (selectedBloodbanks.length === bloodbanks.length) {
            setSelectedBloodbanks([])
        } else {
            setSelectedBloodbanks(bloodbanks.map(b => b.bloodbank_id))
        }
    }

    const handleSubmit = async e => {
        e.preventDefault()

        if (selectedBloodbanks.length === 0) {
            setStatus('❌ Please select at least one blood bank')
            return
        }

        setStatus('')
        setLoading(true)

        try {
            // Send requests to all selected blood banks
            const promises = selectedBloodbanks.map(bloodbank_id =>
                fetch(`${API_BASE_URL}/api/blood-requests`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        hospital_id: user.hospital_id,
                        blood_type: form.blood_type,
                        units_requested: Number(form.units_requested),
                        requested_to: Number(bloodbank_id)
                    })
                }).then(res => res.json())
            )

            const results = await Promise.all(promises)
            const successful = results.filter(result => result.success).length
            const failed = results.length - successful

            if (successful > 0) {
                setStatus(`✅ Successfully sent ${successful} request(s) to blood bank(s)${failed > 0 ? `. ${failed} request(s) failed.` : '!'}`)
                setForm({ blood_type: '', units_requested: '' })
                setSelectedBloodbanks([])
            } else {
                setStatus('❌ All requests failed. Please try again.')
            }
        } catch {
            setStatus('❌ Network error. Please try again.')
        }
        setLoading(false)
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white py-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-8">
                <div className="text-center mb-12 animate-fadeInUp">
                    <h2 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center">
                        <span className="mr-3">🩸</span>
                        Request Blood Units
                    </h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Submit your blood requirement request to multiple blood banks
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="glass-effect rounded-2xl p-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-red-400 mb-2">
                                Blood Type *
                            </label>
                            <select
                                className="input-modern w-full px-4 py-3 rounded-xl text-white"
                                name="blood_type"
                                value={form.blood_type}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Blood Type</option>
                                <option value="A+" className="bg-gray-800">A+</option>
                                <option value="A-" className="bg-gray-800">A-</option>
                                <option value="B+" className="bg-gray-800">B+</option>
                                <option value="B-" className="bg-gray-800">B-</option>
                                <option value="AB+" className="bg-gray-800">AB+</option>
                                <option value="AB-" className="bg-gray-800">AB-</option>
                                <option value="O+" className="bg-gray-800">O+</option>
                                <option value="O-" className="bg-gray-800">O-</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-red-400 mb-2">
                                Units Requested *
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
                    </div>

                    {/* Blood Banks Selection */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-semibold text-red-400">
                                Select Blood Banks *
                            </label>
                            <button
                                type="button"
                                onClick={selectAllBloodBanks}
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                            >
                                {selectedBloodbanks.length === bloodbanks.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        <div className="bg-gray-900/30 rounded-xl p-4 max-h-60 overflow-y-auto">
                            {bloodbanks.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">Loading blood banks...</p>
                            ) : (
                                <div className="space-y-2">
                                    {bloodbanks.map(bloodbank => (
                                        <label
                                            key={bloodbank.bloodbank_id}
                                            className="flex items-center p-3 rounded-lg hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedBloodbanks.includes(bloodbank.bloodbank_id)}
                                                onChange={() => handleBloodBankSelection(bloodbank.bloodbank_id)}
                                                className="w-4 h-4 text-red-500 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2 mr-3"
                                            />
                                            <div className="flex-1">
                                                <div className="text-white font-semibold">{bloodbank.name}</div>
                                                <div className="text-gray-400 text-sm">{bloodbank.location}</div>
                                                {bloodbank.contact_number && (
                                                    <div className="text-gray-500 text-xs">📞 {bloodbank.contact_number}</div>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedBloodbanks.length > 0 && (
                            <div className="mt-3 text-sm text-gray-400">
                                Selected: {selectedBloodbanks.length} blood bank(s)
                            </div>
                        )}
                    </div>

                    {status && (
                        <div className={`p-4 rounded-xl mb-6 text-center font-semibold ${status.includes('✅')
                                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                                : 'bg-red-500/20 border border-red-500/50 text-red-400'
                            }`}>
                            {status}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || selectedBloodbanks.length === 0}
                        className="button-modern w-full py-4 rounded-xl font-semibold text-white shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-200"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                Sending Requests...
                            </span>
                        ) : (
                            `Send Request${selectedBloodbanks.length > 1 ? 's' : ''} to ${selectedBloodbanks.length || 0} Blood Bank${selectedBloodbanks.length !== 1 ? 's' : ''}`
                        )}
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            💡 Tip: Select multiple blood banks to increase your chances of finding the required blood units
                        </p>
                    </div>
                </form>

                {/* Information Cards */}
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <div className="glass-effect rounded-xl p-6 text-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                        <div className="text-3xl mb-3">⚡</div>
                        <h3 className="text-lg font-bold text-red-400 mb-2">Fast Response</h3>
                        <p className="text-gray-300 text-sm">Get responses from blood banks within 24 hours</p>
                    </div>

                    <div className="glass-effect rounded-xl p-6 text-center animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                        <div className="text-3xl mb-3">🏥</div>
                        <h3 className="text-lg font-bold text-red-400 mb-2">Multiple Requests</h3>
                        <p className="text-gray-300 text-sm">Send requests to multiple blood banks simultaneously</p>
                    </div>

                    <div className="glass-effect rounded-xl p-6 text-center animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                        <div className="text-3xl mb-3">📋</div>
                        <h3 className="text-lg font-bold text-red-400 mb-2">Track Status</h3>
                        <p className="text-gray-300 text-sm">Monitor your request status in real-time</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default RequestBlood
