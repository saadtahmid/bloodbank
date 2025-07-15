import React, { useEffect, useState } from 'react'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const DonorUrgentNeeds = ({ donor_id }) => {
    const [urgentNeeds, setUrgentNeeds] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (donor_id) {
            setLoading(true)
            fetch(`${API_BASE_URL}/api/urgent-needs/for-donor/${donor_id}`)
                .then(res => res.json())
                .then(data => setUrgentNeeds(data))
                .catch(() => setUrgentNeeds([]))
                .finally(() => setLoading(false))
        }
    }, [donor_id])

    if (!donor_id) return null

    return (
        <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white py-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-8">
                <div className="text-center mb-12 animate-fadeInUp">
                    <h2 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center">
                        <span className="mr-3">🚨</span>
                        Urgent Blood Needs
                    </h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Your blood type is urgently needed. Help save lives today!
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-fadeInUp">
                        <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-gray-400">Loading urgent needs...</p>
                    </div>
                ) : urgentNeeds.length === 0 ? (
                    <div className="text-center py-20 animate-fadeInUp">
                        <div className="glass-effect rounded-2xl p-12 max-w-md mx-auto">
                            <div className="text-6xl mb-4">💚</div>
                            <h3 className="text-2xl font-bold text-green-400 mb-4">All Good!</h3>
                            <p className="text-gray-300">No urgent needs for your blood type at this time.</p>
                            <p className="text-sm text-gray-400 mt-4">Check back regularly to help when needed.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {urgentNeeds.map((need, index) => (
                            <div
                                key={need.urgent_need_id}
                                className="glass-effect rounded-2xl p-6 card-hover animate-fadeInUp"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mr-3"></div>
                                        <h3 className="text-xl font-bold text-red-400">Urgent Need</h3>
                                    </div>
                                    <span className="text-xs text-gray-400 bg-gray-900/50 px-3 py-1 rounded-full">
                                        ID: {need.urgent_need_id}
                                    </span>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-900/50 rounded-xl p-4">
                                        <label className="text-sm text-gray-400">Blood Bank ID</label>
                                        <div className="text-white font-semibold">{need.bloodbank_id}</div>
                                    </div>
                                    <div className="bg-gray-900/50 rounded-xl p-4">
                                        <label className="text-sm text-gray-400">Blood Type</label>
                                        <div className="text-red-400 font-bold text-lg">{need.blood_type}</div>
                                    </div>
                                    <div className="bg-gray-900/50 rounded-xl p-4">
                                        <label className="text-sm text-gray-400">Units Needed</label>
                                        <div className="text-white font-semibold text-lg">{need.units_needed}</div>
                                    </div>
                                    <div className="bg-gray-900/50 rounded-xl p-4">
                                        <label className="text-sm text-gray-400">Posted Date</label>
                                        <div className="text-white">{need.posted_date}</div>
                                    </div>
                                </div>

                                {need.notes && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                                        <label className="text-sm text-red-400 font-semibold">Special Notes</label>
                                        <div className="text-gray-200 mt-1">{need.notes}</div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button className="button-modern flex-1 py-3 rounded-xl font-semibold text-white shadow-xl">
                                        Contact Blood Bank
                                    </button>
                                    <button className="bg-green-600 hover:bg-green-700 flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 shadow-lg">
                                        Donate Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {urgentNeeds.length > 0 && (
                    <div className="mt-12 text-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                        <div className="glass-effect rounded-2xl p-8 max-w-2xl mx-auto">
                            <h3 className="text-2xl font-bold text-red-400 mb-4">Every Donation Matters</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Your donation can save up to 3 lives. Contact the blood bank directly or visit during
                                their operating hours to make a difference today.
                            </p>
                            <div className="mt-6 flex flex-wrap justify-center gap-4">
                                <div className="bg-red-500/20 px-4 py-2 rounded-full">
                                    <span className="text-red-400 font-semibold">Emergency Hotline: 999</span>
                                </div>
                                <div className="bg-blue-500/20 px-4 py-2 rounded-full">
                                    <span className="text-blue-400 font-semibold">Available 24/7</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default DonorUrgentNeeds