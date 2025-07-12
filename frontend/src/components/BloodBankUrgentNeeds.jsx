import React, { useEffect, useState } from 'react'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const BloodBankUrgentNeeds = ({ bloodbank_id }) => {
    const [urgentNeeds, setUrgentNeeds] = useState([])
    const [loading, setLoading] = useState(false)

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
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

export default BloodBankUrgentNeeds