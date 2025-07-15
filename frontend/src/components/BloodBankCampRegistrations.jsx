import React, { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const BloodBankCampRegistrations = ({ user }) => {
    const [registrations, setRegistrations] = useState([])
    const [loading, setLoading] = useState(false)
    const [updateStatus, setUpdateStatus] = useState({})
    const [donationForm, setDonationForm] = useState({})
    const [donationStatus, setDonationStatus] = useState({})

    useEffect(() => {
        if (user && user.bloodbank_id) {
            setLoading(true)
            fetch(`${API_BASE_URL}/api/camps/registrations/${user.bloodbank_id}`)
                .then(res => res.json())
                .then(data => setRegistrations(data))
                .catch(() => setRegistrations([]))
                .finally(() => setLoading(false))
        }
    }, [user])

    const handleUpdate = async (registration_id, attended) => {
        setUpdateStatus({ ...updateStatus, [registration_id]: 'updating' })
        try {
            const res = await fetch(`${API_BASE_URL}/api/camps/registration/${registration_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attended })
            })
            if (res.ok) {
                setRegistrations(registrations =>
                    registrations.map(r =>
                        r.registration_id === registration_id ? { ...r, attended } : r
                    )
                )
                setUpdateStatus({ ...updateStatus, [registration_id]: 'success' })
            } else {
                setUpdateStatus({ ...updateStatus, [registration_id]: 'error' })
            }
        } catch {
            setUpdateStatus({ ...updateStatus, [registration_id]: 'error' })
        }
    }

    const handleDonationChange = (registration_id, field, value) => {
        setDonationForm(prev => ({
            ...prev,
            [registration_id]: {
                ...prev[registration_id],
                [field]: value
            }
        }))
    }

    const handleAddDonation = async (registration) => {
        const { donor_id, camp_id, attended } = registration
        const bloodbank_id = user.bloodbank_id
        const blood_type = donationForm[registration.registration_id]?.blood_type ?? registration.blood_type
        const units = donationForm[registration.registration_id]?.units

        // Prevent if not attended
        if (attended !== 'Y') {
            setDonationStatus(prev => ({ ...prev, [registration.registration_id]: 'error' }))
            console.log('Cannot add donation: not attended')
            return
        }

        // Prevent if already added
        if (donationStatus[registration.registration_id] === 'success') {
            setDonationStatus(prev => ({ ...prev, [registration.registration_id]: 'already' }))
            console.log('Donation already added for this registration')
            return
        }

        console.log('Add Donation clicked:', { donor_id, bloodbank_id, camp_id, blood_type, units })
        if (!blood_type || !units) {
            console.log('Missing blood_type or units')
            setDonationStatus(prev => ({ ...prev, [registration.registration_id]: 'error' }))
            return
        }
        setDonationStatus(prev => ({ ...prev, [registration.registration_id]: 'submitting' }))
        try {
            const res = await fetch(`${API_BASE_URL}/api/donations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ donor_id, bloodbank_id, camp_id, blood_type, units: Number(units) })
            })
            console.log('Donation request sent:', res)
            const data = await res.json()
            console.log('Donation response:', data)
            if (res.ok && data.success) {
                setDonationStatus(prev => ({ ...prev, [registration.registration_id]: 'success' }))
            } else if (data.error && data.error.includes('already')) {
                setDonationStatus(prev => ({ ...prev, [registration.registration_id]: 'already' }))
            } else {
                setDonationStatus(prev => ({ ...prev, [registration.registration_id]: 'error' }))
            }
        } catch (err) {
            console.error('Donation error:', err)
            setDonationStatus(prev => ({ ...prev, [registration.registration_id]: 'error' }))
        }
    }

    if (!user || user.role.toLowerCase() !== 'bloodbank') {
        return (
            <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
                <div className="glass-effect rounded-2xl p-12 text-center animate-fadeInUp max-w-md">
                    <div className="text-6xl mb-6">🏥</div>
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Access Restricted</h2>
                    <p className="text-gray-300 leading-relaxed">
                        Only blood banks can view camp registrations.
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

            <div className="relative z-10 max-w-7xl mx-auto px-8">
                <div className="text-center mb-12 animate-fadeInUp">
                    <h2 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center">
                        <span className="mr-3">📋</span>
                        Camp Registrations
                    </h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Manage donor registrations and track donations from your camps
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-fadeInUp">
                        <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-gray-400">Loading registrations...</p>
                    </div>
                ) : registrations.length === 0 ? (
                    <div className="text-center py-20 animate-fadeInUp">
                        <div className="glass-effect rounded-2xl p-12 max-w-md mx-auto">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-2xl font-bold text-red-400 mb-4">No Registrations</h3>
                            <p className="text-gray-300">No registrations found for your camps.</p>
                        </div>
                    </div>
                ) : (
                    <div className="glass-effect rounded-2xl overflow-hidden animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-900/50">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-red-400 font-semibold">Donor Name</th>
                                        <th className="px-4 py-4 text-left text-red-400 font-semibold">Blood Type</th>
                                        <th className="px-4 py-4 text-left text-red-400 font-semibold">Gender</th>
                                        <th className="px-4 py-4 text-left text-red-400 font-semibold">Contact</th>
                                        <th className="px-4 py-4 text-left text-red-400 font-semibold">Camp</th>
                                        <th className="px-4 py-4 text-left text-red-400 font-semibold">Date</th>
                                        <th className="px-4 py-4 text-left text-red-400 font-semibold">Attended</th>
                                        <th className="px-4 py-4 text-left text-red-400 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.map((r, index) => (
                                        <tr
                                            key={r.registration_id}
                                            className="border-t border-gray-700/50 hover:bg-white/5 transition-colors duration-200"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                        >
                                            <td className="px-4 py-4 text-white font-semibold">{r.donor_name}</td>
                                            <td className="px-4 py-4">
                                                <span className="text-red-400 font-bold">{r.blood_type}</span>
                                            </td>
                                            <td className="px-4 py-4 text-gray-300">{r.gender}</td>
                                            <td className="px-4 py-4 text-gray-300">{r.contact_info}</td>
                                            <td className="px-4 py-4 text-white">{r.camp_name}</td>
                                            <td className="px-4 py-4 text-gray-300">{r.registration_date}</td>
                                            <td className="px-4 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${r.attended === 'Y'
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                                                    }`}>
                                                    {r.attended === 'Y' ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="space-y-3">
                                                    {/* Attendance Update */}
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={r.attended}
                                                            onChange={e => handleUpdate(r.registration_id, e.target.value)}
                                                            disabled={updateStatus[r.registration_id] === 'updating'}
                                                            className="input-modern px-3 py-2 rounded-lg text-white text-sm"
                                                        >
                                                            <option value="N">No</option>
                                                            <option value="Y">Yes</option>
                                                        </select>
                                                        {updateStatus[r.registration_id] === 'success' && (
                                                            <span className="text-green-400 text-sm">✓</span>
                                                        )}
                                                        {updateStatus[r.registration_id] === 'error' && (
                                                            <span className="text-red-400 text-sm">✗</span>
                                                        )}
                                                    </div>

                                                    {/* Donation Form */}
                                                    <div className="bg-gray-900/30 rounded-lg p-3 space-y-2">
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Blood Type"
                                                                value={donationForm[r.registration_id]?.blood_type ?? r.blood_type ?? ''}
                                                                onChange={e => handleDonationChange(r.registration_id, 'blood_type', e.target.value)}
                                                                className="input-modern px-2 py-1 rounded text-white text-sm w-20"
                                                                disabled={donationStatus[r.registration_id] === 'success' || r.attended !== 'Y'}
                                                            />
                                                            <input
                                                                type="number"
                                                                placeholder="Units"
                                                                min="1"
                                                                value={donationForm[r.registration_id]?.units || ''}
                                                                onChange={e => handleDonationChange(r.registration_id, 'units', e.target.value)}
                                                                className="input-modern px-2 py-1 rounded text-white text-sm w-16"
                                                                disabled={donationStatus[r.registration_id] === 'success' || r.attended !== 'Y'}
                                                            />
                                                        </div>
                                                        <button
                                                            className="button-modern w-full py-2 rounded-lg font-semibold text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                            onClick={() => handleAddDonation(r)}
                                                            disabled={
                                                                donationStatus[r.registration_id] === 'submitting' ||
                                                                donationStatus[r.registration_id] === 'success' ||
                                                                r.attended !== 'Y'
                                                            }
                                                            type="button"
                                                        >
                                                            {donationStatus[r.registration_id] === 'submitting' ? (
                                                                <span className="flex items-center justify-center">
                                                                    <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full mr-2"></div>
                                                                    Adding...
                                                                </span>
                                                            ) : (
                                                                'Add Donation'
                                                            )}
                                                        </button>
                                                        {donationStatus[r.registration_id] === 'success' && (
                                                            <span className="text-green-400 text-sm flex items-center">
                                                                <span className="mr-1">✅</span>
                                                                Added!
                                                            </span>
                                                        )}
                                                        {donationStatus[r.registration_id] === 'error' && (
                                                            <span className="text-red-400 text-sm flex items-center">
                                                                <span className="mr-1">❌</span>
                                                                {r.attended !== 'Y'
                                                                    ? 'Mark as attended first'
                                                                    : 'Error adding donation'}
                                                            </span>
                                                        )}
                                                        {donationStatus[r.registration_id] === 'already' && (
                                                            <span className="text-yellow-400 text-sm flex items-center">
                                                                <span className="mr-1">⚠️</span>
                                                                Already added
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default BloodBankCampRegistrations