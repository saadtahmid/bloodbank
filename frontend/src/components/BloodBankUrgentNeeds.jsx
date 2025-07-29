import React, { useEffect, useState } from 'react'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const BloodBankUrgentNeeds = ({ bloodbank_id }) => {
    const [urgentNeeds, setUrgentNeeds] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedNeed, setSelectedNeed] = useState(null)
    const [donors, setDonors] = useState([])
    const [selectedDonor, setSelectedDonor] = useState('')
    const [units, setUnits] = useState(1)
    const [status, setStatus] = useState('')

    useEffect(() => {
        if (bloodbank_id) {
            setLoading(true)
            fetch(`${API_BASE_URL}/api/urgent-needs/for-bank/${bloodbank_id}`)
                .then(res => res.json())
                .then(data => setUrgentNeeds(data))
                .catch(() => setUrgentNeeds([]))
                .finally(() => setLoading(false))
        }
    }, [bloodbank_id])

    const handleFulfillClick = async (need) => {
        setSelectedNeed(need)
        setStatus('')
        const res = await fetch(`${API_BASE_URL}/api/donors/by-blood-type/${need.blood_type}`)
        const data = await res.json()
        setDonors(data)
    }

    const handleSubmitFulfill = async () => {
        setStatus('Submitting...')
        const res = await fetch(`${API_BASE_URL}/api/urgent-needs/fulfill/${selectedNeed.urgent_need_id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                donor_id: selectedDonor,
                bloodbank_id: bloodbank_id,
                units: Number(units)
            })
        })
        const data = await res.json()
        if (res.ok && data.success) {
            setStatus('✅ Urgent need fulfilled successfully!')
            setSelectedNeed(null)
            // Refresh urgent needs list
            setLoading(true)
            fetch(`${API_BASE_URL}/api/urgent-needs/for-bank/${bloodbank_id}`)
                .then(res => res.json())
                .then(data => setUrgentNeeds(data))
                .catch(() => setUrgentNeeds([]))
                .finally(() => setLoading(false))
        } else {
            setStatus(data.error || 'Failed to fulfill urgent need')
        }
    }

    if (!bloodbank_id) return null

    return (
        <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white py-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-8">
                <div className="text-center mb-12 animate-fadeInUp">
                    <h2 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center">
                        <span className="mr-3">🚨</span>
                        Your Urgent Needs
                    </h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Manage and fulfill urgent blood requirements
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
                            <div className="text-6xl mb-4">✅</div>
                            <h3 className="text-2xl font-bold text-green-400 mb-4">All Clear</h3>
                            <p className="text-gray-300">No urgent needs at this time.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        {urgentNeeds.map((need, index) => (
                            <div
                                key={need.urgent_need_id}
                                className="glass-effect rounded-2xl p-6 card-hover"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mr-3"></div>
                                        <h3 className="text-xl font-bold text-red-400">Urgent Need</h3>
                                    </div>
                                    <span className="text-xs text-gray-400 bg-gray-900/50 px-3 py-1 rounded-full">
                                        Posted: {need.posted_date}
                                    </span>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-gray-900/50 rounded-xl p-4">
                                        <label className="text-sm text-gray-400">Blood Type</label>
                                        <div className="text-red-400 font-bold text-lg">{need.blood_type}</div>
                                    </div>
                                    
                                    <div className="bg-gray-900/50 rounded-xl p-4">
                                        <label className="text-sm text-gray-400">Status</label>
                                        <div className="text-yellow-400 font-semibold">OPEN</div>
                                    </div>
                                </div>

                                {need.notes && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                                        <label className="text-sm text-red-400 font-semibold">Notes</label>
                                        <div className="text-gray-200 mt-1">{need.notes}</div>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleFulfillClick(need)}
                                    className="button-modern w-full py-3 rounded-xl font-semibold text-white shadow-xl"
                                >
                                    Fulfill Urgent Need
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {selectedNeed && (
                    <div className="glass-effect rounded-2xl p-8 mt-8 animate-fadeInUp">
                        <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center">
                            <span className="mr-2">⚡</span>
                            Fulfill Urgent Need
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-900/50 rounded-xl p-4">
                                <label className="text-sm text-gray-400">Blood Type Required</label>
                                <div className="text-red-400 font-bold text-lg">{selectedNeed.blood_type}</div>
                            </div>
                            
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-red-400 mb-2">
                                    Select Donor:
                                </label>
                                <select
                                    value={selectedDonor}
                                    onChange={e => setSelectedDonor(e.target.value)}
                                    className="input-modern w-full px-4 py-3 rounded-xl text-white"
                                >
                                    <option value="">-- Select a donor --</option>
                                    {donors.map(donor => (
                                        <option key={donor.donor_id} value={donor.donor_id} className="bg-gray-800">
                                            {donor.name} (ID: {donor.donor_id}) | Gender: {donor.gender} | Blood Type: {donor.blood_type} | Weight: {donor.weight}kg | Location: {donor.location} | Contact: {donor.contact_info} | Last Donation: {donor.last_donation_date} | Birth Date: {donor.birth_date}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-red-400 mb-2">
                                    Units to Donate:
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={units}
                                    onChange={e => setUnits(e.target.value)}
                                    className="input-modern w-full px-4 py-3 rounded-xl text-white"
                                />
                            </div>

                            <button
                                onClick={handleSubmitFulfill}
                                className="button-modern w-full py-4 rounded-xl font-semibold text-white shadow-xl"
                            >
                                Submit Fulfillment
                            </button>
                        </div>

                        {status && (
                            <div className={`mt-4 ${status.includes('✅') ? 'bg-green-500/20 border-green-500/50 text-green-200' : 'bg-red-500/20 border-red-500/50 text-red-200'} border rounded-xl px-4 py-3 backdrop-blur-sm`}>
                                {status}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}

export default BloodBankUrgentNeeds