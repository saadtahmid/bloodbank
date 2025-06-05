import React, { useEffect, useState } from 'react'

const BloodBankDirectory = () => {
    const [division, setDivision] = useState('')
    const [district, setDistrict] = useState('')
    const [city, setCity] = useState('')
    const [divisions, setDivisions] = useState([])
    const [districts, setDistricts] = useState([])
    const [cities, setCities] = useState([])

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
                // Debug: log data to verify API response
                console.log('Divisions:', data)
                setDivisions(data)
            })
            .catch(err => {
                console.error('Error fetching divisions:', err)
                setDivisions([])
            })
    }, [])

    // Fetch districts when division changes
    useEffect(() => {
        if (division) {
            fetch(`/api/locations/districts?division=${encodeURIComponent(division)}`)
                .then(res => res.json())
                .then(data => {
                    console.log('Districts:', data)
                    setDistricts(data)
                })
                .catch(err => {
                    console.error('Error fetching districts:', err)
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
        if (district) {
            fetch(`/api/locations/cities?district=${encodeURIComponent(district)}`)
                .then(res => res.json())
                .then(data => {
                    console.log('Cities:', data)
                    setCities(data)
                })
                .catch(err => {
                    console.error('Error fetching cities:', err)
                    setCities([])
                })
            setCity('')
        } else {
            setCities([])
            setCity('')
        }
    }, [district])

    return (
        <section id="blood-bank-directory" className="bg-black text-white py-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Blood Bank Directory</h2>
            <div className="flex flex-wrap gap-4 mb-6">
                <select
                    className="bg-gray-900 border border-red-500 text-white px-4 py-2 rounded"
                    value={division}
                    onChange={e => setDivision(e.target.value)}
                >
                    <option value="">Select Division</option>
                    {divisions && divisions.length > 0 && divisions.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
                <select
                    className="bg-gray-900 border border-red-500 text-white px-4 py-2 rounded"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    disabled={!division}
                >
                    <option value="">Select District</option>
                    {districts && districts.length > 0 && districts.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
                <select
                    className="bg-gray-900 border border-red-500 text-white px-4 py-2 rounded"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    disabled={!district}
                >
                    <option value="">Select City</option>
                    {cities && cities.length > 0 && cities.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>
        </section>
    )
}

export default BloodBankDirectory
