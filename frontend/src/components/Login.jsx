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
        confirmPassword: '', // Add this field
        role: '',
        // Common
        name: '',
        location: '',
        contact_number: '',
        // Donor
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

        // Add password validation for registration
        if (isRegister) {
            if (!form.password) return
            if (form.password !== form.confirmPassword) {
                setLoginError('Passwords do not match')
                return
            }
        } else {
            if (!form.password) return
        }

        setLoginError('')
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
                    password: form.password
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
        <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-red-900"></div>
            <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>

            <div className="relative z-10 w-full max-w-md mx-auto animate-fadeInUp">
                <h2 className="text-3xl font-bold gradient-text mb-8 text-center">
                    {isRegister ? (step === 1 ? 'Create Account' : 'Complete Registration') : 'Welcome Back'}
                </h2>

                <form className="glass-effect rounded-2xl p-8 shadow-2xl space-y-6"
                    onSubmit={isRegister ? (step === 1 ? handleNext : handleRegister) : handleLogin}
                >
                    {step === 1 && (
                        <>
                            <div className="space-y-4">
                                <input
                                    className="input-modern w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    className="input-modern w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                                {isRegister && (
                                    <input
                                        className="input-modern w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                )}
                                {isRegister && (
                                    <select
                                        className="input-modern w-full px-4 py-3 rounded-xl text-white"
                                        name="role"
                                        value={form.role}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        {roleOptions.map(r => (
                                            <option key={r.value} value={r.value} className="bg-gray-800">{r.label}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {loginError && (
                                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm">
                                    {loginError}
                                </div>
                            )}

                            <button
                                className="button-modern w-full py-3 rounded-xl font-semibold text-white shadow-xl"
                                type="submit"
                            >
                                {isRegister ? 'Continue →' : 'Sign In'}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    className="text-red-400 hover:text-red-300 underline transition-colors duration-200"
                                    onClick={() => {
                                        if (isRegister) {
                                            setIsRegister(false);
                                            setStep(1);
                                            setLoginError('');
                                            setForm({ ...form, confirmPassword: '' });
                                        } else {
                                            setIsRegister(true);
                                            setStep(1);
                                            setLoginError('');
                                        }
                                    }}
                                >
                                    {isRegister ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                                </button>
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
            </div>
        </section>
    )
}

export default Login
