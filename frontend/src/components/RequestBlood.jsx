import React, { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const RequestBlood = ({ user }) => {
    const [bloodbanks, setBloodbanks] = useState([])
    const [form, setForm] = useState({
        blood_type: '',
        units_requested: '',
        requested_to: ''
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

    const handleSubmit = async e => {
        e.preventDefault()
        setStatus('')
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/api/blood-requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hospital_id: user.hospital_id,
                    blood_type: form.blood_type,
                    units_requested: Number(form.units_requested),
                    requested_to: Number(form.requested_to)
                })
            })
            const data = await res.json()
            if (res.ok && data.success) {
                setStatus('✅ Request submitted successfully!')
                setForm({ blood_type: '', units_requested: '', requested_to: '' })
            } else {
                setStatus(data.error || 'Failed to submit request')
            }
        } catch {
            setStatus('Network error')
        }
        setLoading(false)
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white py-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>

            <div className="relative z-10 max-w-2xl mx-auto px-8">
                <div className="text-center mb-12 animate-fadeInUp">
                    <h2 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center">
                        <span className="mr-3">🩸</span>
                        Request Blood Units
                    </h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Submit your blood requirement request to nearby blood banks
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="glass-effect rounded-2xl p-8 space-y-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-red-400 mb-2">
                                Blood Type Required *
                            </label>
                            <select
                                className="input-modern w-full px-4 py-3 rounded-xl text-white"
                                name="blood_type"
                                value={form.blood_type}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Blood Type</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                                    <option key={bt} value={bt} className="bg-gray-800">{bt}</option>
                                ))}
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

                        <div>
                            <label className="block text-sm font-semibold text-red-400 mb-2">
                                Blood Bank *
                            </label>
                            <select
                                className="input-modern w-full px-4 py-3 rounded-xl text-white"
                                name="requested_to"
                                value={form.requested_to}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Blood Bank</option>
                                {bloodbanks.map(b => (
                                    <option key={b.bloodbank_id} value={b.bloodbank_id} className="bg-gray-800">{b.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {status && (
                        <div className={`${status.includes('Error') || status.includes('Failed') || status.includes('Network error') ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'bg-green-500/20 border-green-500/50 text-green-200'} border rounded-xl px-4 py-3 backdrop-blur-sm`}>
                            {status}
                        </div>
                    )}

                    <button
                        className="button-modern w-full py-4 rounded-xl font-semibold text-white shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                                Submitting Request...
                            </span>
                        ) : (
                            'Submit Blood Request'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                    <div className="glass-effect rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-red-400 mb-3">Emergency Contact</h3>
                        <p className="text-gray-300">For urgent requests, call: <span className="text-white font-semibold">999</span></p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default RequestBlood
