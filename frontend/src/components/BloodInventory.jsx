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
        return (
            <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
                <div className="glass-effect rounded-2xl p-12 text-center animate-fadeInUp max-w-md">
                    <div className="text-6xl mb-6">🏥</div>
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Access Restricted</h2>
                    <p className="text-gray-300 leading-relaxed">
                        Only blood banks can view this page.
                    </p>
                </div>
            </section>
        )
    }

    const filteredUnits = filter === 'ALL'
        ? units
        : units.filter(u => u.blood_type === filter)

    const bloodTypeTotals = BLOOD_TYPES.reduce((acc, type) => {
        acc[type] = units
            .filter(u => u.blood_type === type)
            .reduce((sum, u) => sum + Number(u.units), 0)
        return acc
    }, {})

    return (
        <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white py-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>

            <div className="relative z-10 max-w-6xl mx-auto px-8">
                <div className="text-center mb-12 animate-fadeInUp">
                    <h2 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center">
                        <span className="mr-3">📊</span>
                        Blood Inventory
                    </h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Monitor and manage your blood unit inventory
                    </p>
                </div>

                {/* Blood Type Summary */}
                <div className="glass-effect rounded-2xl p-6 mb-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center">
                        <span className="mr-2">📈</span>
                        Total Units by Blood Group
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                        {BLOOD_TYPES.map(type => (
                            <div key={type} className="bg-gray-900/50 rounded-xl p-4 card-hover text-center">
                                <div className="text-2xl font-bold text-red-400 mb-1">{type}</div>
                                <div className="text-xl text-white font-semibold">{bloodTypeTotals[type]}</div>
                                <div className="text-xs text-gray-400">units</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filter */}
                <div className="glass-effect rounded-2xl p-4 mb-8 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                    <div className="flex flex-wrap items-center gap-2">
                        <label className="text-sm font-semibold text-red-400 mr-4">Filter by Blood Group:</label>
                        <select
                            className="input-modern px-4 py-2 rounded-xl text-white"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        >
                            <option value="ALL">All Blood Types</option>
                            {BLOOD_TYPES.map(type => (
                                <option key={type} value={type} className="bg-gray-800">{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Inventory Table */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-fadeInUp">
                        <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-gray-400">Loading inventory...</p>
                    </div>
                ) : filteredUnits.length === 0 ? (
                    <div className="text-center py-20 animate-fadeInUp">
                        <div className="glass-effect rounded-2xl p-12 max-w-md mx-auto">
                            <div className="text-6xl mb-4">📦</div>
                            <h3 className="text-2xl font-bold text-red-400 mb-4">No Units Found</h3>
                            <p className="text-gray-300">
                                No available blood units{filter !== 'ALL' && ` for ${filter}`}.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="glass-effect rounded-2xl overflow-hidden animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-red-400 font-semibold">Blood Type</th>
                                        <th className="px-6 py-4 text-left text-red-400 font-semibold">Units</th>
                                        <th className="px-6 py-4 text-left text-red-400 font-semibold">Collected Date</th>
                                        <th className="px-6 py-4 text-left text-red-400 font-semibold">Expiry Date</th>
                                        <th className="px-6 py-4 text-left text-red-400 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUnits.map((u, index) => (
                                        <tr
                                            key={u.unit_id}
                                            className="border-t border-gray-700/50 hover:bg-white/5 transition-colors duration-200"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                        >
                                            <td className="px-6 py-4">
                                                <span className="text-red-400 font-bold text-lg">{u.blood_type}</span>
                                            </td>
                                            <td className="px-6 py-4 text-white font-semibold">{u.units}</td>
                                            <td className="px-6 py-4 text-gray-300">{u.collected_date}</td>
                                            <td className="px-6 py-4 text-gray-300">{u.expiry_date}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/50">
                                                    Available
                                                </span>
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

export default BloodInventory