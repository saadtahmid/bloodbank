import React, { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const BloodInventory = ({ user }) => {
    const [units, setUnits] = useState([])
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState('ALL')

    useEffect(() => {
        if (user && user.bloodbank_id) {
            setLoading(true)
            fetch(`${API_BASE_URL}/api/blood-units/${user.bloodbank_id}`)
                .then(res => res.json())
                .then(data => setUnits(data))
                .catch(() => setUnits([]))
                .finally(() => setLoading(false))
        }
    }, [user])

    if (!user || user.role.toLowerCase() !== 'bloodbank') {
        return <div className="text-center text-red-500 mt-10">Only blood banks can view this page.</div>
    }

    // Filtered units
    const filteredUnits = filter === 'ALL'
        ? units
        : units.filter(u => u.blood_type === filter)

    // Calculate total count for each blood group
    const bloodTypeTotals = BLOOD_TYPES.reduce((acc, type) => {
        acc[type] = units
            .filter(u => u.blood_type === type)
            .reduce((sum, u) => sum + Number(u.units), 0)
        return acc
    }, {})

    return (
        <section className="bg-black text-white py-8 flex flex-col items-center min-h-screen">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Blood Inventory</h2>
            <div className="mb-4 flex flex-wrap gap-2 items-center">
                <label className="mr-2 font-semibold">Filter by Blood Group:</label>
                <select
                    className="bg-gray-900 border border-red-500 text-white px-4 py-2 rounded"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                >
                    <option value="ALL">All</option>
                    {BLOOD_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>
            <div className="mb-6 w-full max-w-2xl">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Total Units by Blood Group</h3>
                <div className="grid grid-cols-4 gap-2">
                    {BLOOD_TYPES.map(type => (
                        <div key={type} className="bg-gray-800 rounded px-3 py-2 flex flex-col items-center">
                            <span className="font-bold text-red-300">{type}</span>
                            <span className="text-white">{bloodTypeTotals[type]}</span>
                        </div>
                    ))}
                </div>
            </div>
            {loading ? (
                <div className="text-gray-400">Loading...</div>
            ) : filteredUnits.length === 0 ? (
                <div className="text-gray-400">No available blood units{filter !== 'ALL' && ` for ${filter}`}.</div>
            ) : (
                <table className="min-w-full bg-gray-900 border border-red-500 rounded">
                    <thead>
                        <tr>
                            <th className="px-2 py-1 border-b border-red-500">Blood Type</th>
                            <th className="px-2 py-1 border-b border-red-500">Units</th>
                            <th className="px-2 py-1 border-b border-red-500">Collected Date</th>
                            <th className="px-2 py-1 border-b border-red-500">Expiry Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUnits.map(u => (
                            <tr key={u.unit_id}>
                                <td className="px-2 py-1">{u.blood_type}</td>
                                <td className="px-2 py-1">{u.units}</td>
                                <td className="px-2 py-1">{u.collected_date}</td>
                                <td className="px-2 py-1">{u.expiry_date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    )
}

export default BloodInventory