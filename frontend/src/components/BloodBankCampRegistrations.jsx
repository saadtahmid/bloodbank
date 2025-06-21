import React, { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const BloodBankCampRegistrations = ({ user }) => {
    const [registrations, setRegistrations] = useState([])
    const [loading, setLoading] = useState(false)
    const [updateStatus, setUpdateStatus] = useState({}) // { [registration_id]: 'success' | 'error' }
    const [donationForm, setDonationForm] = useState({}) // { [registration_id]: { blood_type, units } }
    const [donationStatus, setDonationStatus] = useState({}) // { [registration_id]: 'success' | 'error' | 'submitting' }

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
        return <div className="text-center text-red-500 mt-10">Only blood banks can view this page.</div>
    }

    return (
        <section className="bg-black text-white py-8 flex flex-col items-center min-h-screen">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Camp Registrations</h2>
            {loading ? (
                <div className="text-gray-400">Loading...</div>
            ) : registrations.length === 0 ? (
                <div className="text-gray-400">No registrations found for your camps.</div>
            ) : (
                <table className="min-w-full bg-gray-900 border border-red-500 rounded">
                    <thead>
                        <tr>
                            <th className="px-2 py-1 border-b border-red-500">Donor Name</th>
                            <th className="px-2 py-1 border-b border-red-500">Blood Type</th>
                            <th className="px-2 py-1 border-b border-red-500">Gender</th>
                            <th className="px-2 py-1 border-b border-red-500">Contact</th>
                            <th className="px-2 py-1 border-b border-red-500">Camp</th>
                            <th className="px-2 py-1 border-b border-red-500">Date</th>
                            <th className="px-2 py-1 border-b border-red-500">Attended</th>
                            <th className="px-2 py-1 border-b border-red-500">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrations.map(r => (
                            <tr key={r.registration_id}>
                                <td className="px-2 py-1">{r.donor_name}</td>
                                <td className="px-2 py-1">{r.blood_type}</td>
                                <td className="px-2 py-1">{r.gender}</td>
                                <td className="px-2 py-1">{r.contact_info}</td>
                                <td className="px-2 py-1">{r.camp_name}</td>
                                <td className="px-2 py-1">{r.registration_date}</td>
                                <td className="px-2 py-1">{r.attended === 'Y' ? 'Yes' : 'No'}</td>
                                <td className="px-2 py-1">
                                    <select
                                        value={r.attended}
                                        onChange={e => handleUpdate(r.registration_id, e.target.value)}
                                        disabled={updateStatus[r.registration_id] === 'updating'}
                                        className="bg-black border border-red-500 text-white rounded px-2 py-1"
                                    >
                                        <option value="N">No</option>
                                        <option value="Y">Yes</option>
                                    </select>
                                    {updateStatus[r.registration_id] === 'success' && (
                                        <span className="text-green-400 ml-2">Updated</span>
                                    )}
                                    {updateStatus[r.registration_id] === 'error' && (
                                        <span className="text-red-400 ml-2">Error</span>
                                    )}
                                    {/* Add Donation Form */}
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            placeholder="Blood Type"
                                            value={donationForm[r.registration_id]?.blood_type ?? r.blood_type ?? ''}
                                            onChange={e => handleDonationChange(r.registration_id, 'blood_type', e.target.value)}
                                            className="w-20 mr-2 px-2 py-1 rounded bg-black border border-gray-700 text-white"
                                            disabled={donationStatus[r.registration_id] === 'success' || r.attended !== 'Y'}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Units"
                                            min="1"
                                            value={donationForm[r.registration_id]?.units || ''}
                                            onChange={e => handleDonationChange(r.registration_id, 'units', e.target.value)}
                                            className="w-16 mr-2 px-2 py-1 rounded bg-black border border-gray-700 text-white"
                                            disabled={donationStatus[r.registration_id] === 'success' || r.attended !== 'Y'}
                                        />
                                        <button
                                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded font-semibold"
                                            onClick={() => handleAddDonation(r)}
                                            disabled={
                                                donationStatus[r.registration_id] === 'submitting' ||
                                                donationStatus[r.registration_id] === 'success' ||
                                                r.attended !== 'Y'
                                            }
                                            type="button"
                                        >
                                            Add Donation
                                        </button>
                                        {donationStatus[r.registration_id] === 'success' && (
                                            <span className="text-green-400 ml-2">Added!</span>
                                        )}
                                        {donationStatus[r.registration_id] === 'error' && (
                                            <span className="text-red-400 ml-2">
                                                {r.attended !== 'Y'
                                                    ? 'Mark as attended before adding donation.'
                                                    : 'Error'}
                                            </span>
                                        )}
                                        {donationStatus[r.registration_id] === 'already' && (
                                            <span className="text-yellow-400 ml-2">Donation already added.</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    )
}

export default BloodBankCampRegistrations