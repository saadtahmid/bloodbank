import React, { useState } from 'react'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const AddDirectDonation = ({ user }) => {
    const [donorId, setDonorId] = useState('')
    const [donor, setDonor] = useState(null)
    const [units, setUnits] = useState('')
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(false)

    const handleFetchDonor = async () => {
        if (!donorId) {
            setStatus('Please enter a donor ID')
            return
        }
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/api/donors/${donorId}`)
            if (res.ok) {
                const data = await res.json()
                setDonor(data)
                setStatus('')
            } else {
                setDonor(null)
                setStatus('Donor not found')
            }
        } catch {
            setDonor(null)
            setStatus('Network error')
        }
        setLoading(false)
    }

    const handleSubmit = async () => {
        if (!donor || !units) {
            setStatus('Please fetch donor and enter units')
            return
        }
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/api/donations/direct`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    donor_id: donor.donor_id,
                    bloodbank_id: user.bloodbank_id,
                    blood_type: donor.blood_type,
                    units: Number(units)
                })
            })
            const data = await res.json()
            if (res.ok && data.success) {
                setStatus('✅ Donation added successfully!')
                setUnits('')
                setDonor(null)
                setDonorId('')
            } else {
                setStatus(data.error || 'Failed to add donation')
            }
        } catch {
            setStatus('Network error')
        }
        setLoading(false)
    }

    if (!user || user.role.toLowerCase() !== 'bloodbank') {
        return (
            <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
                <div className="glass-effect rounded-2xl p-12 text-center animate-fadeInUp max-w-md">
                    <div className="text-6xl mb-6">🏥</div>
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Access Restricted</h2>
                    <p className="text-gray-300 leading-relaxed">
                        Only blood banks can add direct donations.
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

            <div className="relative z-10 max-w-2xl mx-auto px-8">
                <div className="text-center mb-12 animate-fadeInUp">
                    <h2 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center">
                        <span className="mr-3">💉</span>
                        Add Direct Donation
                    </h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Register donations made directly to your blood bank
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Donor Search Section */}
                    <div className="glass-effect rounded-2xl p-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center">
                            <span className="mr-2">🔍</span>
                            Find Donor
                        </h3>
                        <div className="flex gap-4">
                            <input
                                className="input-modern flex-1 px-4 py-3 rounded-xl text-white placeholder-gray-400"
                                type="number"
                                placeholder="Enter Donor ID"
                                value={donorId}
                                onChange={(e) => setDonorId(e.target.value)}
                            />
                            <button
                                onClick={handleFetchDonor}
                                disabled={loading}
                                className="button-modern px-6 py-3 rounded-xl font-semibold text-white shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                        Search
                                    </span>
                                ) : (
                                    'Search'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Donor Information */}
                    {donor && (
                        <div className="glass-effect rounded-2xl p-8 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                            <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center">
                                <span className="mr-2">👤</span>
                                Donor Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-gray-900/50 rounded-xl p-4">
                                    <label className="text-sm text-gray-400">Name</label>
                                    <div className="text-white font-semibold">{donor.name}</div>
                                </div>
                                <div className="bg-gray-900/50 rounded-xl p-4">
                                    <label className="text-sm text-gray-400">Blood Type</label>
                                    <div className="text-red-400 font-bold text-lg">{donor.blood_type}</div>
                                </div>
                                <div className="bg-gray-900/50 rounded-xl p-4">
                                    <label className="text-sm text-gray-400">Gender</label>
                                    <div className="text-white">{donor.gender}</div>
                                </div>
                                <div className="bg-gray-900/50 rounded-xl p-4">
                                    <label className="text-sm text-gray-400">Contact</label>
                                    <div className="text-white">{donor.contact_info}</div>
                                </div>
                                <div className="bg-gray-900/50 rounded-xl p-4 md:col-span-2">
                                    <label className="text-sm text-gray-400">Last Donation</label>
                                    <div className="text-white">{donor.last_donation_date || 'Never'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Donation Form */}
                    {donor && (
                        <div className="glass-effect rounded-2xl p-8 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                            <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center">
                                <span className="mr-2">🩸</span>
                                Donation Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-red-400 mb-2">
                                        Number of Units
                                    </label>
                                    <input
                                        className="input-modern w-full px-4 py-3 rounded-xl text-white"
                                        type="number"
                                        min="1"
                                        placeholder="Enter number of units"
                                        value={units}
                                        onChange={(e) => setUnits(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !units}
                                    className="button-modern w-full py-4 rounded-xl font-semibold text-white shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                                            Processing Donation...
                                        </span>
                                    ) : (
                                        'Add Donation'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Status Message */}
                    {status && (
                        <div className={`${status.includes('Error') || status.includes('not found') || status.includes('Network error') ? 'bg-red-500/20 border-red-500/50 text-red-200' : status.includes('✅') ? 'bg-green-500/20 border-green-500/50 text-green-200' : 'bg-blue-500/20 border-blue-500/50 text-blue-200'} border rounded-xl px-6 py-4 backdrop-blur-sm animate-fadeInUp`}>
                            <div className="flex items-center">
                                <span className="mr-2">
                                    {status.includes('✅') ? '✅' : status.includes('Error') ? '❌' : 'ℹ️'}
                                </span>
                                {status}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default AddDirectDonation