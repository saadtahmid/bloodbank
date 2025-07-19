import React, { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const DonationHistory = ({ donor_id }) => {
    const [donations, setDonations] = useState([])
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState({
        totalDonations: 0,
        totalUnits: 0,
        lastDonationDate: null,
        bloodTypeDistribution: {}
    })

    useEffect(() => {
        if (donor_id) {
            fetchDonations()
        }
    }, [donor_id])

    const fetchDonations = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/api/donations/history/${donor_id}`)
            const data = await response.json()
            const donationList = Array.isArray(data) ? data : []
            setDonations(donationList)
            calculateStats(donationList)
        } catch (error) {
            console.error('Error fetching donation history:', error)
            setDonations([])
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (donationList) => {
        if (donationList.length === 0) {
            setStats({
                totalDonations: 0,
                totalUnits: 0,
                lastDonationDate: null,
                bloodTypeDistribution: {}
            })
            return
        }

        const totalDonations = donationList.length
        const totalUnits = donationList.reduce((sum, donation) => sum + (donation.units || 0), 0)
        const lastDonationDate = donationList[0]?.donation_date // Already sorted by date DESC

        // Calculate blood type distribution
        const bloodTypeDistribution = donationList.reduce((acc, donation) => {
            const bloodType = donation.blood_type
            acc[bloodType] = (acc[bloodType] || 0) + (donation.units || 0)
            return acc
        }, {})

        setStats({
            totalDonations,
            totalUnits,
            lastDonationDate,
            bloodTypeDistribution
        })
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getDonationType = (donation) => {
        if (donation.camp_id && donation.camp_name) {
            return {
                type: 'Camp Donation',
                location: donation.camp_name,
                details: donation.camp_location
            }
        } else {
            return {
                type: 'Direct Donation',
                location: donation.bloodbank_name,
                details: 'Walk-in donation'
            }
        }
    }

    if (!donor_id) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-400">Please log in as a donor to view donation history.</p>
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
                        <span className="mr-3">🩸</span>
                        My Donation History
                    </h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Your contribution to saving lives through blood donation
                    </p>
                </div>

                {/* Statistics Cards */}
                {!loading && donations.length > 0 && (
                    <div className="grid md:grid-cols-4 gap-6 mb-12 animate-fadeInUp">
                        <div className="glass-effect rounded-2xl p-6 text-center">
                            <div className="text-3xl font-bold text-red-400 mb-2">{stats.totalDonations}</div>
                            <div className="text-gray-300">Total Donations</div>
                        </div>
                        <div className="glass-effect rounded-2xl p-6 text-center">
                            <div className="text-3xl font-bold text-green-400 mb-2">{stats.totalUnits}</div>
                            <div className="text-gray-300">Units Donated</div>
                        </div>
                        <div className="glass-effect rounded-2xl p-6 text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalUnits * 3}</div>
                            <div className="text-gray-300">Lives Potentially Saved</div>
                        </div>
                        <div className="glass-effect rounded-2xl p-6 text-center">
                            <div className="text-lg font-bold text-yellow-400 mb-2">
                                {formatDate(stats.lastDonationDate)}
                            </div>
                            <div className="text-gray-300">Last Donation</div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-fadeInUp">
                        <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-gray-400">Loading your donation history...</p>
                    </div>
                ) : donations.length === 0 ? (
                    <div className="text-center py-20 animate-fadeInUp">
                        <div className="glass-effect rounded-2xl p-12 max-w-md mx-auto">
                            <div className="text-6xl mb-4">🩸</div>
                            <h3 className="text-2xl font-bold text-blue-400 mb-4">No Donations Yet</h3>
                            <p className="text-gray-300 mb-6">You haven't made any donations yet. Start your journey of saving lives!</p>
                            <button 
                                onClick={() => window.location.hash = '#view-camps'}
                                className="button-modern px-6 py-3 rounded-xl font-semibold shadow-lg mr-4"
                            >
                                View Camps
                            </button>
                            <button 
                                onClick={() => window.location.hash = '#urgent-needs'}
                                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200"
                            >
                                Urgent Needs
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {donations.map((donation, index) => {
                            const { type, location, details } = getDonationType(donation)
                            return (
                                <div
                                    key={donation.donation_id}
                                    className="glass-effect rounded-2xl p-6 card-hover animate-fadeInUp"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                                            <h3 className="text-xl font-bold text-white">{type}</h3>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                                                Completed
                                            </span>
                                            <span className="text-xs text-gray-400 bg-gray-900/50 px-3 py-1 rounded-full">
                                                ID: {donation.donation_id}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                                        <div className="bg-gray-900/50 rounded-xl p-4">
                                            <label className="text-sm text-gray-400">Date</label>
                                            <div className="text-white font-semibold">{formatDate(donation.donation_date)}</div>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-xl p-4">
                                            <label className="text-sm text-gray-400">Blood Type</label>
                                            <div className="text-red-400 font-bold text-lg">{donation.blood_type}</div>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-xl p-4">
                                            <label className="text-sm text-gray-400">Units Donated</label>
                                            <div className="text-white font-semibold text-lg">{donation.units}</div>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-xl p-4">
                                            <label className="text-sm text-gray-400">Lives Saved</label>
                                            <div className="text-green-400 font-bold text-lg">{donation.units * 3}</div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-gray-900/50 rounded-xl p-4">
                                            <label className="text-sm text-gray-400">Location</label>
                                            <div className="text-white font-semibold">{location}</div>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-xl p-4">
                                            <label className="text-sm text-gray-400">Blood Bank</label>
                                            <div className="text-white font-semibold">{donation.bloodbank_name}</div>
                                        </div>
                                    </div>

                                    {details && details !== 'Walk-in donation' && (
                                        <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                            <label className="text-sm text-blue-400 font-semibold">Additional Details</label>
                                            <div className="text-gray-200 mt-1">{details}</div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {donations.length > 0 && (
                    <div className="mt-12 text-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                        <div className="glass-effect rounded-2xl p-8 max-w-2xl mx-auto">
                            <h3 className="text-2xl font-bold text-red-400 mb-4">Thank You for Your Generosity!</h3>
                            <p className="text-gray-300 leading-relaxed mb-4">
                                Your donations have made a real difference in people's lives. Each unit of blood can save up to 3 lives.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <div className="bg-red-500/20 px-4 py-2 rounded-full">
                                    <span className="text-red-400 font-semibold">Keep Donating Regularly</span>
                                </div>
                                <div className="bg-green-500/20 px-4 py-2 rounded-full">
                                    <span className="text-green-400 font-semibold">Every 56 Days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default DonationHistory
