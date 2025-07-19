import React, { useState } from 'react'
import { tokenStorage } from '../utils/auth.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const CreateCamp = ({ bloodbank_id, onCampCreated }) => {
    const [form, setForm] = useState({
        camp_name: '',
        location: '',
        start_date: '',
        end_date: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
        setSuccess('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const response = await fetch(`${API_BASE_URL}/api/camps`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...tokenStorage.getAuthHeader()
                },
                body: JSON.stringify(form)
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setSuccess('Camp created successfully!')
                setForm({
                    camp_name: '',
                    location: '',
                    start_date: '',
                    end_date: ''
                })
                if (onCampCreated) {
                    onCampCreated(data.camp)
                }
            } else {
                setError(data.error || 'Failed to create camp')
            }
        } catch (err) {
            console.error('Error creating camp:', err)
            setError('Network error occurred')
        } finally {
            setLoading(false)
        }
    }

    const today = new Date().toISOString().split('T')[0]

    return (
        <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white py-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>

            <div className="relative z-10 max-w-2xl mx-auto px-8">
                <div className="text-center mb-8 animate-fadeInUp">
                    <h2 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center">
                        <span className="mr-3">🏕️</span>
                        Create New Camp
                    </h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Organize a blood donation camp to help save lives in your community
                    </p>
                </div>

                <div className="glass-effect rounded-2xl p-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Camp Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Camp Name *
                            </label>
                            <input
                                type="text"
                                name="camp_name"
                                value={form.camp_name}
                                onChange={handleChange}
                                placeholder="Enter camp name (e.g., Community Blood Drive 2025)"
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-all duration-200"
                                required
                                maxLength={100}
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Location *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="Enter full address or venue"
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-all duration-200"
                                required
                                maxLength={150}
                            />
                        </div>

                        {/* Date Range */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={form.start_date}
                                    onChange={handleChange}
                                    min={today}
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-red-500 focus:outline-none transition-all duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    End Date *
                                </label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={form.end_date}
                                    onChange={handleChange}
                                    min={form.start_date || today}
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-red-500 focus:outline-none transition-all duration-200"
                                    required
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                <p className="text-green-400 text-sm">{success}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full button-modern py-3 rounded-xl font-semibold text-white shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                    Creating Camp...
                                </span>
                            ) : (
                                'Create Camp'
                            )}
                        </button>

                        {/* Help Text */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                            <h4 className="text-blue-400 font-semibold mb-2">💡 Tips for a Successful Camp</h4>
                            <ul className="text-gray-300 text-sm space-y-1">
                                <li>• Choose an accessible location with adequate space</li>
                                <li>• Plan for at least 2-3 hours duration</li>
                                <li>• Ensure proper medical facilities are available</li>
                                <li>• Coordinate with local authorities if needed</li>
                            </ul>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    )
}

export default CreateCamp
