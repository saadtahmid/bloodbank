import React, { useEffect, useState } from 'react'

const BloodBankDirectory = () => {
    const [division, setDivision] = useState('')
    const [district, setDistrict] = useState('')
    const [city, setCity] = useState('')
    const [divisions, setDivisions] = useState([])
    const [districts, setDistricts] = useState([])
    const [cities, setCities] = useState([])
    const [results, setResults] = useState([])

    // Fetch divisions on mount
    useEffect(() => {
        fetch('/api/locations/divisions')
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
            fetch(`/api/locations/districts?division=${encodeURIComponent(division)}`)
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
            fetch(`/api/locations/cities?district=${encodeURIComponent(district)}`)
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
        // Use 'ANY' as empty string for backend
        const div = division === 'ANY' ? '' : division
        const dist = district === 'ANY' ? '' : district
        const c = city === 'ANY' ? '' : city
        fetch(`/api/locations/search-bloodbanks?division=${encodeURIComponent(div)}&district=${encodeURIComponent(dist)}&city=${encodeURIComponent(c)}`)
            .then(res => res.json())
            .then(data => setResults(data))
            .catch(() => setResults([]))
    }

    return (
        <section id="blood-bank-directory" className="bg-black text-white py-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Blood Bank Directory</h2>
            <div className="flex flex-wrap gap-4 mb-6">
                <select
                    className="bg-gray-900 border border-red-500 text-white px-4 py-2 rounded"
                    value={division}
                    onChange={e => setDivision(e.target.value)}
                >
                    <option value="ANY">Any</option>
                    {divisions && divisions.length > 0 && divisions.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
                <select
                    className="bg-gray-900 border border-red-500 text-white px-4 py-2 rounded"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    disabled={!division || division === 'ANY'}
                >
                    <option value="ANY">Any</option>
                    {districts && districts.length > 0 && districts.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
                <select
                    className="bg-gray-900 border border-red-500 text-white px-4 py-2 rounded"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    disabled={!district || district === 'ANY'}
                >
                    <option value="ANY">Any</option>
                    {cities && cities.length > 0 && cities.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <button
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
                    onClick={handleSearch}
                    disabled={!division}
                >
                    Search
                </button>
            </div>
            <div className="w-full max-w-2xl">
                {results.length > 0 ? (
                    <ul className="space-y-4">
                        {results.map(bank => (
                            <li key={bank.bloodbank_id} className="border border-red-500 rounded p-4 bg-gray-900">
                                <div className="font-bold text-lg text-red-400">{bank.name}</div>
                                <div className="text-white">Location: {bank.location}</div>
                                <div className="text-white">Contact: {bank.contact_number}</div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-gray-400 text-center">No blood banks found for the selected location.</div>
                )}
            </div>
        </section>
    )
}

export default BloodBankDirectory
