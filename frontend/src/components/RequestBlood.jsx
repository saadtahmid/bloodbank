import React, { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const RequestBlood = ({ user }) => {
    const [bloodbanks, setBloodbanks] = useState([])
    const [form, setForm] = useState({
        blood_type: '',
        units_requested: '',
        requested_to: ''
    })
    const [status, setStatus] = useState('')

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/bloodbanks`)
            .then(res => res.json())
            .then(data => setBloodbanks(data))
            .catch(() => setBloodbanks([]))
    }, [])

    if (!user) {
        return (
            <div className="text-center text-red-500 mt-10">
                Please <a href="#login" className="underline text-red-400">login</a> as a hospital to request blood.
            </div>
        )
    }
    if (user.role.toLowerCase() !== 'hospital') {
        return (
            <div className="text-center text-red-500 mt-10">
                Only hospital accounts can request blood.
            </div>
        )
    }

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setStatus('')
        try {
            const res = await fetch(`${API_BASE_URL}/api/blood-requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hospital_id: user.hospital_id,
                    blood_type: form.blood_type,
                    units_requested: Number(form.units_requested),
                    requested_to: Number(form.requested_to)
                })
            })
            const data = await res.json()
            if (res.ok && data.success) {
                setStatus('Request submitted!')
                setForm({ blood_type: '', units_requested: '', requested_to: '' })
            } else {
                setStatus(data.error || 'Failed to submit request')
            }
        } catch {
            setStatus('Network error')
        }
    }

    return (
        <section className="bg-black text-white py-8 flex flex-col items-center min-h-[40vh]">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Request Blood</h2>
            <form className="bg-gray-900 border border-red-500 rounded p-8 w-full max-w-md space-y-4" onSubmit={handleSubmit}>
                <select
                    className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white"
                    name="blood_type"
                    value={form.blood_type}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Blood Type</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                        <option key={bt} value={bt}>{bt}</option>
                    ))}
                </select>
                <input
                    className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white"
                    type="number"
                    name="units_requested"
                    placeholder="Units"
                    min="1"
                    value={form.units_requested}
                    onChange={handleChange}
                    required
                />
                <select
                    className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white"
                    name="requested_to"
                    value={form.requested_to}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Blood Bank</option>
                    {bloodbanks.map(b => (
                        <option key={b.bloodbank_id} value={b.bloodbank_id}>{b.name}</option>
                    ))}
                </select>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold" type="submit">
                    Submit Request
                </button>
                {status && <div className="text-center mt-2">{status}</div>}
            </form>
        </section>
    )
}

export default RequestBlood
