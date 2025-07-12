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
            setStatus('Urgent need fulfilled!')
            setSelectedNeed(null)
            // Optionally refresh urgent needs list
        } else {
            setStatus(data.error || 'Failed to fulfill urgent need')
        }
    }

    if (!bloodbank_id) return null

    return (
        <section className="bg-black text-white py-4">
            <h3 className="text-xl font-bold text-red-500 mb-2">Your Open Urgent Needs</h3>
            {loading ? (
                <div className="text-gray-400">Loading...</div>
            ) : urgentNeeds.length === 0 ? (
                <div className="text-gray-400">No urgent needs at this time.</div>
            ) : (
                <ul className="space-y-2">
                    {urgentNeeds.map(need => (
                        <li key={need.urgent_need_id} className="border border-red-500 rounded p-3 bg-gray-900">
                            <div><b>Blood Type:</b> {need.blood_type}</div>
                            <div><b>Units Needed:</b> {need.units_needed}</div>
                            <div><b>Posted:</b> {need.posted_date}</div>
                            <div><b>Notes:</b> {need.notes}</div>
                            <button
                                onClick={() => handleFulfillClick(need)}
                                className="mt-2 bg-red-500 text-white rounded px-4 py-2"
                            >
                                Fulfill Urgent Need
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {selectedNeed && (
                <div className="mt-4 p-4 border border-red-500 rounded bg-gray-900">
                    <h4 className="text-lg font-bold mb-2">Fulfill Urgent Need</h4>
                    <div className="mb-2"><b>Blood Type:</b> {selectedNeed.blood_type}</div>
                    <div className="mb-2"><b>Units Needed:</b> {selectedNeed.units_needed}</div>
                    <div className="mb-2"><b>Posted:</b> {selectedNeed.posted_date}</div>
                    <div className="mb-2"><b>Notes:</b> {selectedNeed.notes}</div>
                    <div className="mb-2">
                        <label className="block text-sm mb-1">Select Donor:</label>
                        <select
                            value={selectedDonor}
                            onChange={e => setSelectedDonor(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 border"
                        >
                            <option value="">-- Select a donor --</option>
                            {donors.map(donor => (
                                <option key={donor.donor_id} value={donor.donor_id}>
                                    {donor.name} (ID: {donor.donor_id}) | Gender: {donor.gender} | Blood Type: {donor.blood_type} | Weight: {donor.weight}kg | Location: {donor.location} | Contact: {donor.contact_info} | Last Donation: {donor.last_donation_date} | Birth Date: {donor.birth_date}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-2">
                        <label className="block text-sm mb-1">Units to Donate:</label>
                        <input
                            type="number"
                            min="1"
                            value={units}
                            onChange={e => setUnits(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 border"
                        />
                    </div>
                    <button
                        onClick={handleSubmitFulfill}
                        className="w-full bg-red-500 text-white rounded px-4 py-2"
                    >
                        Submit Fulfillment
                    </button>
                    {status && <div className="mt-2 text-red-400">{status}</div>}
                </div>
            )}
        </section>
    )
}

export default BloodBankUrgentNeeds