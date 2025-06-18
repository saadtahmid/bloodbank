import React, { useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const roleOptions = [
    { value: 'Hospital', label: 'Hospital' },
    { value: 'Donor', label: 'Donor' },
    { value: 'Bloodbank', label: 'Blood Bank' }
]

const bloodTypes = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
]

const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
]

const Login = ({ setUser }) => {
    const [step, setStep] = useState(1)
    const [isRegister, setIsRegister] = useState(false)
    const [form, setForm] = useState({
        email: '',
        password: '',
        role: '',
        // Common
        name: '',
        location: '',
        contact_number: '',
        // Donor
        age: '',
        gender: '',
        blood_type: '',
        weight: '',
        birth_date: '',
        last_donation_date: '',
    })
    const [passwordTouched, setPasswordTouched] = useState(false)
    const [loginError, setLoginError] = useState('')

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleNext = e => {
        e.preventDefault()
        setPasswordTouched(true)
        if (!form.password) return
        setStep(2)
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (res.ok && data.success) {
                alert('Registration successful! You can now login.')
                setStep(1)
                setIsRegister(false)
            } else {
                alert(data.error || 'Registration failed')
                setStep(1)
                setIsRegister(false)
            }
        } catch (err) {
            alert('Network error')
            setStep(1)
            setIsRegister(false)
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoginError('')
        try {
            const res = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    role: form.role
                })
            })
            const data = await res.json()
            if (res.ok && data.success) {
                alert('Login successful!\n' + JSON.stringify(data.user, null, 2))
                setUser(data.user) // Set user in App state
                window.location.hash = '#home'
            } else {
                setLoginError(data.error || 'Login failed')
            }
        } catch (err) {
            setLoginError('Network error')
        }
    }

    return (
        <section className="bg-black text-white py-8 flex flex-col items-center min-h-screen">
            <h2 className="text-2xl font-bold text-red-500 mb-4">
                {isRegister ? (step === 1 ? 'Register' : 'Complete Registration') : 'Login'}
            </h2>
            <form
                className="bg-gray-900 border border-red-500 rounded p-8 w-full max-w-md space-y-4"
                onSubmit={isRegister ? (step === 1 ? handleNext : handleRegister) : handleLogin}
            >
                {/* Step 1: Login or Register */}
                {step === 1 && (
                    <>
                        <input
                            className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white"
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                        <input
                            className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white"
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                        {(passwordTouched && !form.password) && (
                            <div className="text-red-400 text-sm">Password is required</div>
                        )}
                        <select
                            className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white"
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Role</option>
                            {roleOptions.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                        {loginError && (
                            <div className="text-red-400 text-sm">{loginError}</div>
                        )}
                        <button
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold"
                            type="submit"
                        >
                            {isRegister ? 'Next' : 'Login'}
                        </button>
                        <div className="text-center mt-2">
                            {isRegister ? (
                                <button
                                    type="button"
                                    className="text-red-400 underline"
                                    onClick={() => { setIsRegister(false); setStep(1); setLoginError(''); }}
                                >
                                    Already have an account? Login
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="text-red-400 underline"
                                    onClick={() => { setIsRegister(true); setStep(1); setLoginError(''); }}
                                >
                                    Don't have an account? Register
                                </button>
                            )}
                        </div>
                    </>
                )}
                {/* Step 2: Registration extra fields */}
                {isRegister && step === 2 && (
                    <>
                        {/* Common fields */}
                        <input
                            className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white"
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                        <input
                            className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white"
                            type="text"
                            name="location"
                            placeholder="Location"
                            value={form.location}
                            onChange={handleChange}
                            required
                        />
                        <input
                            className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white"
                            type="text"
                            name="contact_number"
                            placeholder="Contact Number"
                            value={form.contact_number}
                            onChange={handleChange}
                            required
                        />
                        {/* Role-specific fields */}
                        {form.role === 'Donor' && (
                            <>
                                <select
                                    className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white"
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    {genderOptions.map(g => (
                                        <option key={g.value} value={g.value}>{g.label}</option>
                                    ))}
                                </select>
                                <select
                                    className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white"
                                    name="blood_type"
                                    value={form.blood_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Blood Type</option>
                                    {bloodTypes.map(bt => (
                                        <option key={bt} value={bt}>{bt}</option>
                                    ))}
                                </select>
                                <input
                                    className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white"
                                    type="number"
                                    name="weight"
                                    placeholder="Weight (kg)"
                                    value={form.weight}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                />
                                <label className="block text-sm mb-1 mt-2" htmlFor="birth_date">Birth Date</label>
                                <input
                                    className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white"
                                    type="date"
                                    name="birth_date"
                                    id="birth_date"
                                    value={form.birth_date}
                                    onChange={handleChange}
                                    required
                                />
                                <label className="block text-sm mb-1 mt-2" htmlFor="last_donation_date">Last Donation Date (optional)</label>
                                <input
                                    className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white"
                                    type="date"
                                    name="last_donation_date"
                                    id="last_donation_date"
                                    placeholder="MM/DD/YYYY or leave blank"
                                    value={form.last_donation_date}
                                    onChange={handleChange}
                                />
                            </>
                        )}
                        <button
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold"
                            type="submit"
                        >
                            Register
                        </button>
                    </>
                )}
            </form>
        </section>
    )
}

export default Login
