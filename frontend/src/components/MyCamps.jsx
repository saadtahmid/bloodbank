import React, { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const MyCamps = ({ bloodbank_id }) => {
    const [camps, setCamps] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (bloodbank_id) {
            fetchCamps()
        }
    }, [bloodbank_id])

    const fetchCamps = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/api/camps/bloodbank/${bloodbank_id}`)
            const data = await response.json()
            setCamps(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching camps:', error)
            setCamps([])
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getCampStatus = (startDate, endDate) => {
        const today = new Date()
        const start = new Date(startDate)
        const end = new Date(endDate)

        today.setHours(0, 0, 0, 0)
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)

        if (today < start) {
            return { status: 'Upcoming', color: 'blue' }
        } else if (today >= start && today <= end) {
            return { status: 'Active', color: 'green' }
        } else {
            return { status: 'Completed', color: 'gray' }
        }
    }

    if (!bloodbank_id) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-400">Please log in as a blood bank to view camps.</p>
            </div>
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
                        <span className="mr-3">🏕️</span>
                        My Camps
                    </h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Manage your blood donation camps and track their progress
                    </p>
                    <button
                        onClick={() => window.location.hash = '#create-camp'}
                        className="mt-4 button-modern px-6 py-2 rounded-xl font-semibold shadow-lg"
                    >
                        Create New Camp
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-fadeInUp">
                        <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-gray-400">Loading your camps...</p>
                    </div>
                ) : camps.length === 0 ? (
                    <div className="text-center py-20 animate-fadeInUp">
                        <div className="glass-effect rounded-2xl p-12 max-w-md mx-auto">
                            <div className="text-6xl mb-4">🏕️</div>
                            <h3 className="text-2xl font-bold text-blue-400 mb-4">No Camps Yet</h3>
                            <p className="text-gray-300 mb-6">You haven't created any camps yet. Start organizing blood donation drives in your community!</p>
                            <button
                                onClick={() => window.location.hash = '#create-camp'}
                                className="button-modern px-6 py-3 rounded-xl font-semibold shadow-lg"
                            >
                                Create Your First Camp
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {camps.map((camp, index) => {
                            const { status, color } = getCampStatus(camp.start_date, camp.end_date)
                            return (
                                <div
                                    key={camp.camp_id}
                                    className="glass-effect rounded-2xl p-6 card-hover animate-fadeInUp"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center">
                                            <h3 className="text-xl font-bold text-white">{camp.camp_name}</h3>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                                ${color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                                                    color === 'green' ? 'bg-green-500/20 text-green-400' :
                                                        'bg-gray-500/20 text-gray-400'}`}>
                                                {status}
                                            </span>
                                            <span className="text-xs text-gray-400 bg-gray-900/50 px-3 py-1 rounded-full">
                                                ID: {camp.camp_id}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                                        <div className="bg-gray-900/50 rounded-xl p-4">
                                            <label className="text-sm text-gray-400">Location</label>
                                            <div className="text-white font-semibold">{camp.location}</div>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-xl p-4">
                                            <label className="text-sm text-gray-400">Start Date</label>
                                            <div className="text-white font-semibold">{formatDate(camp.start_date)}</div>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-xl p-4">
                                            <label className="text-sm text-gray-400">End Date</label>
                                            <div className="text-white font-semibold">{formatDate(camp.end_date)}</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => window.location.hash = '#camp-registrations'}
                                            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105"
                                        >
                                            View Registrations
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {camps.length > 0 && (
                    <div className="mt-12 text-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                        <div className="glass-effect rounded-2xl p-8 max-w-2xl mx-auto">
                            <h3 className="text-2xl font-bold text-red-400 mb-4">Camp Management Tips</h3>
                            <div className="grid md:grid-cols-2 gap-4 text-left">
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">Before the Camp</h4>
                                    <ul className="text-gray-300 text-sm space-y-1">
                                        <li>• Promote the camp in your community</li>
                                        <li>• Ensure medical staff availability</li>
                                        <li>• Prepare adequate supplies</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-400 mb-2">During the Camp</h4>
                                    <ul className="text-gray-300 text-sm space-y-1">
                                        <li>• Mark attendees as present</li>
                                        <li>• Record successful donations</li>
                                        <li>• Maintain donor safety records</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default MyCamps
