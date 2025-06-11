import React, { useEffect, useState } from 'react'

const ViewCamps = () => {
    const [division, setDivision] = useState('ANY')
    const [divisions, setDivisions] = useState([])
    const [camps, setCamps] = useState([])

    useEffect(() => {
        fetch('/api/locations/divisions')
            .then(res => res.json())
            .then(data => setDivisions(data))
            .catch(() => setDivisions([]))
    }, [])

    useEffect(() => {
        const div = division === 'ANY' ? '' : division
        fetch(`/api/camps?division=${encodeURIComponent(div)}`)
            .then(res => res.json())
            .then(data => setCamps(data))
            .catch(() => setCamps([]))
    }, [division])

    return (
        <section className="bg-black text-white py-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Blood Donation Camps</h2>
            <div className="flex gap-4 mb-6">
                <select
                    className="bg-gray-900 border border-red-500 text-white px-4 py-2 rounded"
                    value={division}
                    onChange={e => setDivision(e.target.value)}
                >
                    <option value="ANY">Any Division</option>
                    {divisions.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>
            <div className="w-full max-w-2xl">
                {camps.length > 0 ? (
                    <ul className="space-y-4">
                        {camps.map(camp => (
                            <li key={camp.camp_id} className="border border-red-500 rounded p-4 bg-gray-900">
                                <div className="font-bold text-lg text-red-400">{camp.camp_name}</div>
                                <div className="text-white">Location: {camp.location}</div>
                                <div className="text-white">Start: {camp.start_date}</div>
                                <div className="text-white">End: {camp.end_date}</div>
                                <div className="text-white">Blood Bank: {camp.bloodbank_name}</div>
                
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-gray-400 text-center">No camps found for the selected division.</div>
                )}
            </div>
        </section>
    )
}

export default ViewCamps
