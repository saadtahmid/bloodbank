import React, { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const ViewCamps = ({ user }) => {
    const [camps, setCamps] = useState([])
    const [divisions, setDivisions] = useState([])
    const [division, setDivision] = useState('ANY')
    const [registering, setRegistering] = useState(null)
    const [registerStatus, setRegisterStatus] = useState({})
    const [showRegistered, setShowRegistered] = useState(false)
    const [registeredCamps, setRegisteredCamps] = useState([])
    const [loadingRegistered, setLoadingRegistered] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/locations/divisions`)
            .then(res => res.json())
            .then(data => setDivisions(data))
            .catch(() => setDivisions([]))
    }, [])

    useEffect(() => {
        setLoading(true)
        const div = division === 'ANY' ? '' : division
        fetch(`${API_BASE_URL}/api/camps?division=${encodeURIComponent(div)}`)
            .then(res => res.json())
            .then(data => setCamps(data))
            .catch(() => setCamps([]))
            .finally(() => setLoading(false))
    }, [division])

    const handleRegister = async (camp_id) => {
        setRegistering(camp_id)
        setRegisterStatus((prev) => ({ ...prev, [camp_id]: undefined }))
        try {
            const res = await fetch(`${API_BASE_URL}/api/camps/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ camp_id, donor_id: user.donor_id })
            })
            const data = await res.json()
            if (res.ok && data.success) {
                setRegisterStatus((prev) => ({ ...prev, [camp_id]: 'success' }))
            } else {
                setRegisterStatus((prev) => ({ ...prev, [camp_id]: `error: ${data.error || 'Registration failed'}` }))
            }
        } catch {
            setRegisterStatus((prev) => ({ ...prev, [camp_id]: 'error: Network error' }))
        }
        setRegistering(null)
    }

    const fetchRegisteredCamps = async () => {
        setLoadingRegistered(true)
        setRegisteredCamps([])
        try {
            const res = await fetch(`${API_BASE_URL}/api/camps/registered/${user.donor_id}`)
            const data = await res.json()
            setRegisteredCamps(data)
        } catch {
            setRegisteredCamps([])
        }
        setLoadingRegistered(false)
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white py-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>

            <div className="relative z-10 max-w-6xl mx-auto px-8">
                <div className="text-center mb-12 animate-fadeInUp">
                    <h2 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center">
                        <span className="mr-3">🏕️</span>
                        Blood Donation Camps
                    </h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Join our life-saving camps and become a hero in your community
                    </p>
                </div>

                {/* Donor Controls */}
                {user && user.role && user.role.toLowerCase() === 'donor' && (
                    <div className="glass-effect rounded-2xl p-6 mb-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center justify-center">
                            <button
                                className="button-modern px-6 py-3 rounded-xl font-semibold text-white shadow-xl hover:scale-105 transition-transform duration-200"
                                onClick={() => {
                                    if (!showRegistered) fetchRegisteredCamps()
                                    setShowRegistered(!showRegistered)
                                }}
                            >
                                {showRegistered ? (
                                    <span className="flex items-center">
                                        <span className="mr-2">👁️‍🗨️</span>
                                        Hide My Registrations
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <span className="mr-2">📋</span>
                                        View My Registrations
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Registered Camps */}
                {showRegistered && (
                    <div className="glass-effect rounded-2xl p-8 mb-8 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                        <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center">
                            <span className="mr-3">📝</span>
                            My Registered Camps
                        </h3>
                        {loadingRegistered ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mb-4"></div>
                                <p className="text-gray-400">Loading your registrations...</p>
                            </div>
                        ) : registeredCamps.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📭</div>
                                <h4 className="text-xl font-bold text-red-400 mb-2">No Registrations Yet</h4>
                                <p className="text-gray-300">You haven't registered for any camps yet.</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {registeredCamps.map((camp, index) => (
                                    <div
                                        key={camp.camp_id}
                                        className="glass-effect rounded-xl p-6 card-hover"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-bold text-red-400">{camp.camp_name}</h4>
                                            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                                        </div>
                                        <div className="space-y-3 text-gray-300">
                                            <div className="flex items-center">
                                                <span className="mr-2">📍</span>
                                                <span>{camp.location}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="mr-2">🏥</span>
                                                <span>{camp.bloodbank_name}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="mr-2">📅</span>
                                                <span>Registered: {camp.registration_date}</span>
                                            </div>
                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-gray-400">Attended:</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${camp.attended === 'Y'
                                                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                                                    }`}>
                                                    {camp.attended === 'Y' ? 'Yes' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Division Filter */}
                <div className="glass-effect rounded-2xl p-6 mb-8 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <label className="text-lg font-semibold text-red-400 flex items-center">
                            <span className="mr-2">🗺️</span>
                            Filter by Division:
                        </label>
                        <select
                            className="input-modern px-4 py-3 rounded-xl text-white min-w-48"
                            value={division}
                            onChange={e => setDivision(e.target.value)}
                        >
                            <option value="ANY">Any Division</option>
                            {divisions.map(d => (
                                <option key={d} value={d} className="bg-gray-800">{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Camps List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-fadeInUp">
                        <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-gray-400">Loading camps...</p>
                    </div>
                ) : camps.length === 0 ? (
                    <div className="text-center py-20 animate-fadeInUp">
                        <div className="glass-effect rounded-2xl p-12 max-w-md mx-auto">
                            <div className="text-6xl mb-4">🏕️</div>
                            <h3 className="text-2xl font-bold text-red-400 mb-4">No Camps Available</h3>
                            <p className="text-gray-300">
                                {division === 'ANY'
                                    ? 'No camps are currently available.'
                                    : `No camps found in ${division} division.`}
                            </p>
                            <p className="text-sm text-gray-400 mt-4">Check back soon for upcoming donation camps.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                        {camps.map((camp, index) => (
                            <div
                                key={camp.camp_id}
                                className="glass-effect rounded-2xl p-6 card-hover animate-fadeInUp"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-red-400">{camp.camp_name}</h3>
                                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="space-y-3 text-gray-300">
                                        <div className="flex items-center">
                                            <span className="mr-3 text-red-400">📍</span>
                                            <span>{camp.location}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mr-3 text-red-400">📅</span>
                                            <span>{camp.start_date} to {camp.end_date}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mr-3 text-red-400">🏥</span>
                                            <span>{camp.bloodbank_name}</span>
                                        </div>
                                    </div>
                                </div>

                                {user && user.role && user.role.toLowerCase() === 'donor' && (
                                    <div className="space-y-3">
                                        <button
                                            className="button-modern w-full py-3 rounded-xl font-semibold text-white shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform duration-200"
                                            onClick={() => handleRegister(camp.camp_id)}
                                            disabled={registering === camp.camp_id || registerStatus[camp.camp_id] === 'success'}
                                        >
                                            {registering === camp.camp_id ? (
                                                <span className="flex items-center justify-center">
                                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                    Registering...
                                                </span>
                                            ) : registerStatus[camp.camp_id] === 'success' ? (
                                                <span className="flex items-center justify-center">
                                                    <span className="mr-2">✅</span>
                                                    Registered Successfully
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center">
                                                    <span className="mr-2">📝</span>
                                                    Register for Camp
                                                </span>
                                            )}
                                        </button>

                                        {registerStatus[camp.camp_id] === 'success' && (
                                            <div className="bg-green-500/20 border border-green-500/50 rounded-xl px-4 py-3 text-center">
                                                <span className="text-green-400 text-sm font-semibold">
                                                    ✅ Registration confirmed! You'll receive updates about this camp.
                                                </span>
                                            </div>
                                        )}

                                        {registerStatus[camp.camp_id]?.startsWith('error:') && (
                                            <div className="bg-red-500/20 border border-red-500/50 rounded-xl px-4 py-3 text-center">
                                                <span className="text-red-400 text-sm font-semibold">
                                                    ❌ {registerStatus[camp.camp_id].replace('error: ', '')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(!user || user.role?.toLowerCase() !== 'donor') && (
                                    <div className="bg-gray-700/50 rounded-xl px-4 py-3 text-center">
                                        <span className="text-gray-400 text-sm">
                                            Login as a donor to register for this camp
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Additional Info */}
                {camps.length > 0 && (
                    <div className="mt-12 text-center animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                        <div className="glass-effect rounded-2xl p-8 max-w-2xl mx-auto">
                            <h3 className="text-2xl font-bold text-red-400 mb-4 flex items-center justify-center">
                                <span className="mr-3">💝</span>
                                Make a Difference Today
                            </h3>
                            <p className="text-gray-300 leading-relaxed mb-6">
                                Every donation matters. Join our camps and be part of a community that saves lives.
                                Your single donation can help save up to 3 lives.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <div className="bg-red-500/20 border border-red-500/30 px-4 py-2 rounded-full">
                                    <span className="text-red-400 font-semibold">📞 Emergency: 999</span>
                                </div>
                                <div className="bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-full">
                                    <span className="text-blue-400 font-semibold">🕒 Available 24/7</span>
                                </div>
                                <div className="bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-full">
                                    <span className="text-green-400 font-semibold">🩸 Safe Donation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default ViewCamps
