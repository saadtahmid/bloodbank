import React, { useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const AddDirectDonation = ({ user }) => {
    const [donorId, setDonorId] = useState('')
    const [donor, setDonor] = useState(null)
    const [units, setUnits] = useState('')
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(false)

    const fetchDonor = async () => {
        setStatus('')
        setDonor(null)
        if (!donorId) return
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/api/donors/${donorId}`)
            const data = await res.json()
            if (res.ok) setDonor(data)
            else setStatus(data.error || 'Donor not found')
        } catch {
            setStatus('Network error')
        }
        setLoading(false)
    }

    const handleAddDonation = async () => {
        setStatus('')
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
                setStatus('Donation added successfully!')
                setUnits('')
            } else {
                setStatus(data.error || 'Failed to add donation')
            }
        } catch {
            setStatus('Network error')
        }
        setLoading(false)
    }

    if (!user || user.role.toLowerCase() !== 'bloodbank') {
        return <div className="text-center text-red-500 mt-10">Only blood banks can add donations.</div>
    }

    return (
        <section className="bg-black text-white py-8 flex flex-col items-center min-h-[40vh]">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Add Direct Donation</h2>
            <div className="bg-gray-900 border border-red-500 rounded p-8 w-full max-w-md space-y-4">
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Donor ID"
                        value={donorId}
                        onChange={e => setDonorId(e.target.value)}
                        className="w-1/2 px-4 py-2 rounded bg-black border border-gray-700 text-white"
                    />
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
                        onClick={fetchDonor}
                        disabled={loading}
                        type="button"
                    >
                        Fetch Donor
                    </button>
                </div>
                {donor && (
                    <div className="bg-gray-800 rounded p-4 mb-2">
                        <div><b>Name:</b> {donor.name}</div>
                        <div><b>Blood Type:</b> {donor.blood_type}</div>
                        <div><b>Gender:</b> {donor.gender}</div>
                        <div><b>Contact:</b> {donor.contact_info}</div>
                        <div><b>Location:</b> {donor.location}</div>
                    </div>
                )}
                <input
                    type="number"
                    placeholder="Units"
                    min="1"
                    value={units}
                    onChange={e => setUnits(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white"
                    disabled={!donor}
                />
                <button
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold"
                    onClick={handleAddDonation}
                    disabled={!donor || loading}
                    type="button"
                >
                    Add Donation
                </button>
                {status && <div className="text-center mt-2">{status}</div>}
            </div>
        </section>
    )
}

export default AddDirectDonation