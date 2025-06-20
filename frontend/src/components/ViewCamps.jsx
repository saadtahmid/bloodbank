import React, { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const ViewCamps = ({ user }) => {
    const [division, setDivision] = useState('ANY')
    const [divisions, setDivisions] = useState([])
    const [camps, setCamps] = useState([])
    const [registering, setRegistering] = useState(null)
    const [registerStatus, setRegisterStatus] = useState({}) // { [camp_id]: 'success' | 'error: message' }
    const [showRegistered, setShowRegistered] = useState(false)
    const [registeredCamps, setRegisteredCamps] = useState([])
    const [loadingRegistered, setLoadingRegistered] = useState(false)

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/locations/divisions`)
            .then(res => res.json())
            .then(data => setDivisions(data))
            .catch(() => setDivisions([]))
    }, [])

    useEffect(() => {
        const div = division === 'ANY' ? '' : division
        fetch(`${API_BASE_URL}/api/camps?division=${encodeURIComponent(div)}`)
            .then(res => res.json())
            .then(data => setCamps(data))
            .catch(() => setCamps([]))
    }, [division])

    const handleRegister = async (camp_id) => {
        setRegistering(camp_id)
        setRegisterStatus((prev) => ({ ...prev, [camp_id]: undefined }))
        try {
            const res = await fetch(`${API_BASE_URL}/api/camps/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ camp_id, donor_id: user.donor_id })
            })
            const data = await res.json()
            if (res.ok && data.success) {
                setRegisterStatus((prev) => ({ ...prev, [camp_id]: 'success' }))
            } else {
                setRegisterStatus((prev) => ({ ...prev, [camp_id]: `error: ${data.error || 'Registration failed'}` }))
            }
        } catch {
            setRegisterStatus((prev) => ({ ...prev, [camp_id]: 'error: Network error' }))
        }
        setRegistering(null)
    }

    const fetchRegisteredCamps = async () => {
        setLoadingRegistered(true)
        setRegisteredCamps([])
        try {
            const res = await fetch(`${API_BASE_URL}/api/camps/registered/${user.donor_id}`)
            const data = await res.json()
            setRegisteredCamps(data)
        } catch {
            setRegisteredCamps([])
        }
        setLoadingRegistered(false)
    }

    return (
        <section className="bg-black text-white py-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Blood Donation Camps</h2>
            {user && user.role && user.role.toLowerCase() === 'donor' && (
                <button
                    className="mb-4 bg-gray-800 border border-red-500 text-red-400 px-4 py-2 rounded font-semibold"
                    onClick={() => {
                        if (!showRegistered) fetchRegisteredCamps()
                        setShowRegistered(!showRegistered)
                    }}
                >
                    {showRegistered ? 'Hide My Registered Camps' : 'Show My Registered Camps'}
                </button>
            )}
            {showRegistered && (
                <div className="w-full max-w-2xl mb-8">
                    <h3 className="text-xl font-semibold text-red-400 mb-2">My Registered Camps</h3>
                    {loadingRegistered ? (
                        <div className="text-gray-400">Loading...</div>
                    ) : registeredCamps.length > 0 ? (
                        <ul className="space-y-4">
                            {registeredCamps.map(camp => (
                                <li key={camp.camp_id} className="border border-red-500 rounded p-4 bg-gray-900">
                                    <div className="font-bold text-lg text-red-400">{camp.camp_name}</div>
                                    <div className="text-white">Location: {camp.location}</div>
                                    <div className="text-white">Start: {camp.start_date}</div>
                                    <div className="text-white">End: {camp.end_date}</div>
                                    <div className="text-white">Blood Bank: {camp.bloodbank_name}</div>
                                    <div className="text-white">Registered On: {camp.registration_date}</div>
                                    <div className="text-white">Attended: {camp.attended === 'Y' ? 'Yes' : 'No'}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-gray-400">No registered camps found.</div>
                    )}
                </div>
            )}
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
                                <div className="text-white">Location: {camp.location} </div>
                                <div className="text-white">Start: {camp.start_date}</div>
                                <div className="text-white">End: {camp.end_date}</div>
                                <div className="text-white">Blood Bank: {camp.bloodbank_name}</div>

                                {user && user.role && user.role.toLowerCase() === 'donor' && (
                                    <>
                                        <button
                                            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold"
                                            onClick={() => handleRegister(camp.camp_id)}
                                            disabled={registering === camp.camp_id}
                                        >
                                            {registering === camp.camp_id ? 'Registering...' : 'Register'}
                                        </button>
                                        {registerStatus[camp.camp_id] === 'success' && (
                                            <div className="text-green-400 mt-2">Registration successful!</div>
                                        )}
                                        {registerStatus[camp.camp_id]?.startsWith('error:') && (
                                            <div className="text-red-400 mt-2">{registerStatus[camp.camp_id].replace('error: ', '')}</div>
                                        )}
                                    </>
                                )}
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
