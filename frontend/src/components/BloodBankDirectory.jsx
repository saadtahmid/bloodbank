import React, { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const BloodBankDirectory = () => {
    const [division, setDivision] = useState('ANY')
    const [district, setDistrict] = useState('')
    const [city, setCity] = useState('')
    const [divisions, setDivisions] = useState([])
    const [districts, setDistricts] = useState([])
    const [cities, setCities] = useState([])
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)

    // Fetch divisions on mount
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/locations/divisions`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`)
                }
                return res.json()
            })
            .then(data => {
                setDivisions(data)
            })
            .catch(err => {
                setDivisions([])
            })
    }, [])

    // Fetch districts when division changes
    useEffect(() => {
        if (division && division !== 'ANY') {
            fetch(`${API_BASE_URL}/api/locations/districts?division=${encodeURIComponent(division)}`)
                .then(res => res.json())
                .then(data => {
                    setDistricts(data)
                })
                .catch(() => {
                    setDistricts([])
                })
            setDistrict('')
            setCity('')
            setCities([])
        } else {
            setDistricts([])
            setDistrict('')
            setCities([])
            setCity('')
        }
    }, [division])

    // Fetch cities when district changes
    useEffect(() => {
        if (district && district !== 'ANY') {
            fetch(`${API_BASE_URL}/api/locations/cities?district=${encodeURIComponent(district)}`)
                .then(res => res.json())
                .then(data => {
                    setCities(data)
                })
                .catch(() => {
                    setCities([])
                })
            setCity('')
        } else {
            setCities([])
            setCity('')
        }
    }, [district])

    const handleSearch = () => {
        setLoading(true)
        // Use 'ANY' as empty string for backend
        const div = division === 'ANY' ? '' : division
        const dist = district === 'ANY' ? '' : district
        const c = city === 'ANY' ? '' : city
        fetch(`${API_BASE_URL}/api/locations/search-bloodbanks?division=${encodeURIComponent(div)}&district=${encodeURIComponent(dist)}&city=${encodeURIComponent(c)}`)
            .then(res => res.json())
            .then(data => setResults(data))
            .catch(() => setResults([]))
            .finally(() => setLoading(false))
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white py-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>

            <div className="relative z-10 max-w-6xl mx-auto px-8">
                <div className="text-center mb-12 animate-fadeInUp">
                    <h2 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center">
                        <span className="mr-3">🏥</span>
                        Blood Bank Directory
                    </h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Find blood banks near you and connect with life-saving resources
                    </p>
                </div>

                {/* Search Form */}
                <div className="glass-effect rounded-2xl p-8 mb-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <div className="grid md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-semibold text-red-400 mb-2">Division</label>
                            <select
                                className="input-modern w-full px-4 py-3 rounded-xl text-white"
                                value={division}
                                onChange={e => setDivision(e.target.value)}
                            >
                                <option value="ANY">Any Division</option>
                                {divisions && divisions.length > 0 && divisions.map(d => (
                                    <option key={d} value={d} className="bg-gray-800">{d}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-red-400 mb-2">District</label>
                            <select
                                className="input-modern w-full px-4 py-3 rounded-xl text-white"
                                value={district}
                                onChange={e => setDistrict(e.target.value)}
                                disabled={!division || division === 'ANY'}
                            >
                                <option value="">Any District</option>
                                {districts.map(d => (
                                    <option key={d} value={d} className="bg-gray-800">{d}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-red-400 mb-2">City</label>
                            <select
                                className="input-modern w-full px-4 py-3 rounded-xl text-white"
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                disabled={!district || district === 'ANY'}
                            >
                                <option value="">Any City</option>
                                {cities.map(c => (
                                    <option key={c} value={c} className="bg-gray-800">{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <button
                                className="button-modern w-full py-3 rounded-xl font-semibold text-white shadow-xl disabled:opacity-50"
                                onClick={handleSearch}
                                disabled={!division || loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                        Searching...
                                    </span>
                                ) : (
                                    'Search'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {results.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                        {results.map((bank, index) => (
                            <div
                                key={bank.bloodbank_id}
                                className="glass-effect rounded-2xl p-6 card-hover"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xl font-bold text-red-400">{bank.name}</h3>
                                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="space-y-2 text-gray-300">
                                        <p className="flex items-center">
                                            <span className="mr-2">📍</span>
                                            {bank.location}
                                        </p>
                                        <p className="flex items-center">
                                            <span className="mr-2">📞</span>
                                            {bank.contact_number}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <button className="button-modern flex-1 py-2 rounded-xl font-semibold text-white text-sm">
                                        Contact
                                    </button>
                                    <button className="bg-gray-700/50 hover:bg-gray-600/50 flex-1 py-2 rounded-xl font-semibold text-white text-sm transition-all duration-200 hover:scale-105">
                                        Directions
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                        <div className="glass-effect rounded-2xl p-12 max-w-md mx-auto">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-2xl font-bold text-red-400 mb-4">No Results Found</h3>
                            <p className="text-gray-300">No blood banks found for the selected location.</p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default BloodBankDirectory
