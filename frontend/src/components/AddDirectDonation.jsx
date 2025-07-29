import React, { useState } from 'react'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const AddDirectDonation = ({ user }) => {
    const [bloodType, setBloodType] = useState('')
    const [donors, setDonors] = useState([])
    const [selectedDonor, setSelectedDonor] = useState(null)
    const [units, setUnits] = useState('')
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1) // 1: Select Blood Type, 2: Select Donor, 3: Add Donation

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

    const handleFetchDonors = async () => {
        if (!bloodType) {
            setStatus('Please select a blood type')
            return
        }
        setLoading(true)
        setStatus('Searching for donors...')
        try {
            const res = await fetch(`${API_BASE_URL}/api/donors/by-blood-type/${bloodType}`)
            if (res.ok) {
                const data = await res.json()
                setDonors(data)
                if (data.length === 0) {
                    setStatus(`No donors found with blood type ${bloodType}`)
                    setStep(1)
                } else {
                    setStatus('')
                    setStep(2)
                }
            } else {
                setDonors([])
                setStatus('Failed to fetch donors')
                setStep(1)
            }
        } catch {
            setDonors([])
            setStatus('Network error while fetching donors')
            setStep(1)
        }
        setLoading(false)
    }

    const handleSelectDonor = (donor) => {
        setSelectedDonor(donor)
        setStep(3)
        setStatus('')
    }

    const handleSubmit = async () => {
        if (!selectedDonor || !units) {
            setStatus('Please enter number of units')
            return
        }
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/api/donations/direct`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    donor_id: selectedDonor.donor_id,
                    bloodbank_id: user.bloodbank_id,
                    blood_type: selectedDonor.blood_type,
                    units: Number(units)
                })
            })
            const data = await res.json()
            if (res.ok && data.success) {
                setStatus('✅ Donation added successfully!')
                // Reset form
                setUnits('')
                setSelectedDonor(null)
                setDonors([])
                setBloodType('')
                setStep(1)
            } else {
                setStatus(data.error || 'Failed to add donation')
            }
        } catch {
            setStatus('Network error while adding donation')
        }
        setLoading(false)
    }

    const handleReset = () => {
        setBloodType('')
        setDonors([])
        setSelectedDonor(null)
        setUnits('')
        setStatus('')
        setStep(1)
    }

    const formatLastDonation = (date) => {
        if (!date) return 'Never'
        try {
            return new Date(date).toLocaleDateString()
        } catch {
            return 'Unknown'
        }
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
                    {/* Progress Indicator */}
                    <div className="glass-effect rounded-2xl p-6 animate-fadeInUp">
                        <div className="flex items-center justify-center space-x-4">
                            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-red-400' : 'text-gray-500'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-red-500' : 'bg-gray-600'}`}>
                                    <span className="text-white font-bold">1</span>
                                </div>
                                <span className="font-semibold">Select Blood Type</span>
                            </div>
                            <div className={`w-8 h-1 ${step >= 2 ? 'bg-red-500' : 'bg-gray-600'} rounded-full`}></div>
                            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-red-400' : 'text-gray-500'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-red-500' : 'bg-gray-600'}`}>
                                    <span className="text-white font-bold">2</span>
                                </div>
                                <span className="font-semibold">Choose Donor</span>
                            </div>
                            <div className={`w-8 h-1 ${step >= 3 ? 'bg-red-500' : 'bg-gray-600'} rounded-full`}></div>
                            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-red-400' : 'text-gray-500'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-red-500' : 'bg-gray-600'}`}>
                                    <span className="text-white font-bold">3</span>
                                </div>
                                <span className="font-semibold">Add Donation</span>
                            </div>
                        </div>
                    </div>

                    {/* Step 1: Blood Type Selection */}
                    {step === 1 && (
                        <div className="glass-effect rounded-2xl p-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                            <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center">
                                <span className="mr-2">🩸</span>
                                Select Blood Type
                            </h3>
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                {bloodTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setBloodType(type)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${bloodType === type
                                                ? 'border-red-500 bg-red-500/20 text-red-400'
                                                : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-red-400 hover:text-red-400'
                                            }`}
                                    >
                                        <div className="text-xl font-bold">{type}</div>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleFetchDonors}
                                disabled={!bloodType || loading}
                                className="button-modern w-full py-4 rounded-xl font-semibold text-white shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                                        Searching Donors...
                                    </span>
                                ) : (
                                    `Find ${bloodType || 'Blood Type'} Donors`
                                )}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Donor Selection */}
                    {step === 2 && donors.length > 0 && (
                        <div className="glass-effect rounded-2xl p-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-red-400 flex items-center">
                                    <span className="mr-2">�</span>
                                    Available {bloodType} Donors ({donors.length})
                                </h3>
                                <button
                                    onClick={handleReset}
                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                >
                                    ← Change Blood Type
                                </button>
                            </div>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {donors.map((donor) => (
                                    <div
                                        key={donor.donor_id}
                                        onClick={() => handleSelectDonor(donor)}
                                        className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 hover:border-red-500/50 transition-all duration-200 cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <h4 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
                                                        {donor.name}
                                                    </h4>
                                                    <span className="px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-400 rounded-full text-sm font-bold">
                                                        {donor.blood_type}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-400">Gender:</span>
                                                        <span className="text-white ml-2">{donor.gender || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">Weight:</span>
                                                        <span className="text-white ml-2">{donor.weight ? `${donor.weight} kg` : 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">Contact:</span>
                                                        <span className="text-white ml-2">{donor.contact_info || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">Last Donation:</span>
                                                        <span className="text-white ml-2">{formatLastDonation(donor.last_donation_date)}</span>
                                                    </div>
                                                    {donor.location && (
                                                        <div className="col-span-2">
                                                            <span className="text-gray-400">Location:</span>
                                                            <span className="text-white ml-2">{donor.location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-4 text-red-400 group-hover:text-red-300 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Donation Details */}
                    {step === 3 && selectedDonor && (
                        <div className="space-y-6">
                            {/* Selected Donor Info */}
                            <div className="glass-effect rounded-2xl p-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-red-400 flex items-center">
                                        <span className="mr-2">👤</span>
                                        Selected Donor
                                    </h3>
                                    <button
                                        onClick={() => setStep(2)}
                                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                    >
                                        ← Choose Different Donor
                                    </button>
                                </div>
                                <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 rounded-xl p-6 border border-red-500/30">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <h4 className="text-xl font-semibold text-white">{selectedDonor.name}</h4>
                                        <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 rounded-full font-bold">
                                            {selectedDonor.blood_type}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-400">Contact:</span>
                                            <span className="text-white ml-2">{selectedDonor.contact_info || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Last Donation:</span>
                                            <span className="text-white ml-2">{formatLastDonation(selectedDonor.last_donation_date)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Donation Form */}
                            <div className="glass-effect rounded-2xl p-8 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                                <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center">
                                    <span className="mr-2">💉</span>
                                    Donation Details
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-red-400 mb-2">
                                            Number of Units *
                                        </label>
                                        <input
                                            className="input-modern w-full px-4 py-3 rounded-xl text-white"
                                            type="number"
                                            min="1"
                                            max="5"
                                            placeholder="Enter number of units (typically 1-2)"
                                            value={units}
                                            onChange={(e) => setUnits(e.target.value)}
                                        />
                                        <p className="text-gray-400 text-sm mt-2">
                                            💡 Standard donation is usually 1-2 units (450-900ml)
                                        </p>
                                    </div>
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={loading || !units}
                                            className="button-modern flex-1 py-4 rounded-xl font-semibold text-white shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center">
                                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                                                    Processing Donation...
                                                </span>
                                            ) : (
                                                '✅ Add Donation'
                                            )}
                                        </button>
                                        <button
                                            onClick={handleReset}
                                            className="px-6 py-4 rounded-xl font-semibold text-gray-400 border border-gray-600 hover:border-gray-500 hover:text-gray-300 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
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