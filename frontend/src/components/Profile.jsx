/* filepath: d:\BloodBank\frontend\src\components\Profile.jsx */
import React, { useState, useEffect } from 'react'
import ProfileImageUpload from './ProfileImageUpload'
import ProfileImage from './ProfileImage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const Profile = ({ user, setUser }) => {
    const [profileData, setProfileData] = useState(null)
    const [editMode, setEditMode] = useState(false)
    const [form, setForm] = useState({})
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('')

    useEffect(() => {
        if (user) {
            fetchProfileData()
            fetchUserImage()
        }
    }, [user])

    const fetchUserImage = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('bloodbank_auth_token')}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                if (userData.success && userData.user.image_url !== user.image_url) {
                    if (setUser && typeof setUser === 'function') {
                        setUser({ ...user, image_url: userData.user.image_url });
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch user image:', error);
        }
    }

    const fetchProfileData = async () => {
        setLoading(true)
        try {
            let endpoint = ''
            if (user.role.toLowerCase() === 'donor') {
                endpoint = `/api/donors/${user.donor_id}`
            } else if (user.role.toLowerCase() === 'hospital') {
                endpoint = `/api/hospitals/${user.hospital_id}`
            } else if (user.role.toLowerCase() === 'bloodbank') {
                endpoint = `/api/bloodbanks/${user.bloodbank_id}`
            }

            const res = await fetch(`${API_BASE_URL}${endpoint}`)
            const data = await res.json()

            if (res.ok) {
                setProfileData(data)
                setForm(data)
            } else {
                setStatus('❌ Failed to load profile data')
            }
        } catch {
            setStatus('❌ Network error')
        }
        setLoading(false)
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setStatus('')

        try {
            let endpoint = ''
            let updateData = {}

            if (user.role.toLowerCase() === 'donor') {
                endpoint = `/api/donors/${user.donor_id}`
                updateData = {
                    location: form.location,
                    weight: form.weight,
                    contact_info: form.contact_info
                }
            } else if (user.role.toLowerCase() === 'hospital') {
                endpoint = `/api/hospitals/${user.hospital_id}`
                updateData = {
                    location: form.location,
                    contact_info: form.contact_info
                }
            } else if (user.role.toLowerCase() === 'bloodbank') {
                endpoint = `/api/bloodbanks/${user.bloodbank_id}`
                updateData = {
                    location: form.location,
                    contact_number: form.contact_number
                }
            }

            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setStatus('✅ Profile updated successfully!')
                setProfileData({ ...profileData, ...updateData })
                setEditMode(false)
            } else {
                setStatus(data.error || '❌ Failed to update profile')
            }
        } catch {
            setStatus('❌ Network error')
        }
        setLoading(false)
    }

    const cancelEdit = () => {
        setForm(profileData)
        setEditMode(false)
        setStatus('')
    }

    if (!user) {
        return (
            <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
                <div className="glass-effect rounded-2xl p-12 text-center animate-fadeInUp max-w-md">
                    <div className="text-6xl mb-6">🔐</div>
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Login Required</h2>
                    <p className="text-gray-300 leading-relaxed mb-6">
                        Please login to view your profile.
                    </p>
                    <a href="#login" className="button-modern px-6 py-3 rounded-xl font-semibold text-white inline-block">
                        Login
                    </a>
                </div>
            </section>
        )
    }

    const getRoleIcon = () => {
        switch (user.role.toLowerCase()) {
            case 'donor': return '🩸'
            case 'hospital': return '🏥'
            case 'bloodbank': return '🏪'
            default: return '👤'
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Not available'
        return new Date(dateString).toLocaleDateString()
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white py-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-8">
                <div className="text-center mb-12 animate-fadeInUp">
                    <h2 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center">
                        <span className="mr-3">{getRoleIcon()}</span>
                        My Profile
                    </h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Manage your account information and preferences
                    </p>
                </div>

                {loading && !profileData ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-fadeInUp">
                        <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-gray-300">Loading profile...</p>
                    </div>
                ) : profileData ? (
                    <div className="space-y-8">
                        {/* Profile Header */}
                        <div className="glass-effect rounded-2xl p-8 animate-fadeInUp">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <ProfileImage
                                        imageUrl={user.image_url}
                                        size="w-16 h-16"
                                        fallbackIcon={getRoleIcon()}
                                    />
                                    <div className="ml-4">
                                        <h3 className="text-2xl font-bold text-white">{profileData.name}</h3>
                                        <p className="text-red-400 font-semibold capitalize">{user.role}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditMode(!editMode)}
                                    className="button-modern px-6 py-3 rounded-xl font-semibold text-white shadow-xl hover:scale-105 transition-transform duration-200"
                                >
                                    {editMode ? 'Cancel Edit' : 'Edit Profile'}
                                </button>
                            </div>

                            {/* Account Information */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gray-900/50 rounded-xl p-4">
                                    <label className="text-sm text-gray-400">Email</label>
                                    <div className="text-white font-semibold">{user.email}</div>
                                </div>
                                <div className="bg-gray-900/50 rounded-xl p-4">
                                    <label className="text-sm text-gray-400">User ID</label>
                                    <div className="text-white font-semibold">{user.user_id}</div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Image Section - Always Editable */}
                        <div className="glass-effect rounded-2xl p-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                            <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center">
                                <span className="mr-2">�</span>
                                Profile Picture
                            </h3>
                            <div className="bg-gray-900/50 rounded-xl p-6">
                                <ProfileImageUpload
                                    currentImageUrl={user.image_url}
                                    onImageUpdate={(newImageUrl) => {
                                        if (setUser && typeof setUser === 'function') {
                                            setUser({ ...user, image_url: newImageUrl });
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Profile Information Section */}
                        <div className="glass-effect rounded-2xl p-8 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                            <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center">
                                <span className="mr-2">📝</span>
                                {editMode ? 'Edit Information' : 'Profile Information'}
                            </h3>

                            {editMode ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Donor-specific fields */}
                                    {user.role.toLowerCase() === 'donor' && (
                                        <>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="bg-gray-900/50 rounded-xl p-4">
                                                    <label className="text-sm text-gray-400">Blood Type</label>
                                                    <div className="text-red-400 font-bold text-lg">{profileData.blood_type}</div>
                                                    <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
                                                </div>
                                                <div className="bg-gray-900/50 rounded-xl p-4">
                                                    <label className="text-sm text-gray-400">Gender</label>
                                                    <div className="text-white">{profileData.gender}</div>
                                                    <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-red-400 mb-2">
                                                    Weight (kg) *
                                                </label>
                                                <input
                                                    className="input-modern w-full px-4 py-3 rounded-xl text-white"
                                                    type="number"
                                                    name="weight"
                                                    value={form.weight || ''}
                                                    onChange={handleChange}
                                                    min="30"
                                                    max="200"
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Common fields for all roles */}
                                    <div>
                                        <label className="block text-sm font-semibold text-red-400 mb-2">
                                            Location *
                                        </label>
                                        <input
                                            className="input-modern w-full px-4 py-3 rounded-xl text-white"
                                            type="text"
                                            name="location"
                                            value={form.location || ''}
                                            onChange={handleChange}
                                            placeholder="Enter your location"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-red-400 mb-2">
                                            Contact {user.role.toLowerCase() === 'bloodbank' ? 'Number' : 'Info'} *
                                        </label>
                                        <input
                                            className="input-modern w-full px-4 py-3 rounded-xl text-white"
                                            type="text"
                                            name={user.role.toLowerCase() === 'bloodbank' ? 'contact_number' : 'contact_info'}
                                            value={form[user.role.toLowerCase() === 'bloodbank' ? 'contact_number' : 'contact_info'] || ''}
                                            onChange={handleChange}
                                            placeholder="Enter your contact information"
                                            required
                                        />
                                    </div>

                                    {status && (
                                        <div className={`p-4 rounded-xl text-center font-semibold ${status.includes('✅')
                                            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                                            : 'bg-red-500/20 border border-red-500/50 text-red-400'
                                            }`}>
                                            {status}
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="button-modern flex-1 py-3 rounded-xl font-semibold text-white shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-200"
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center">
                                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                    Updating...
                                                </span>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="bg-gray-700 hover:bg-gray-600 flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    {/* Display mode */}
                                    {user.role.toLowerCase() === 'donor' && (
                                        <>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="bg-gray-900/50 rounded-xl p-4">
                                                    <label className="text-sm text-gray-400">Blood Type</label>
                                                    <div className="text-red-400 font-bold text-lg">{profileData.blood_type}</div>
                                                </div>
                                                <div className="bg-gray-900/50 rounded-xl p-4">
                                                    <label className="text-sm text-gray-400">Gender</label>
                                                    <div className="text-white">{profileData.gender}</div>
                                                </div>
                                                <div className="bg-gray-900/50 rounded-xl p-4">
                                                    <label className="text-sm text-gray-400">Weight</label>
                                                    <div className="text-white">{profileData.weight} kg</div>
                                                </div>
                                                <div className="bg-gray-900/50 rounded-xl p-4">
                                                    <label className="text-sm text-gray-400">Birth Date</label>
                                                    <div className="text-white">{formatDate(profileData.birth_date)}</div>
                                                </div>
                                                <div className="bg-gray-900/50 rounded-xl p-4 md:col-span-2">
                                                    <label className="text-sm text-gray-400">Last Donation</label>
                                                    <div className="text-white">{formatDate(profileData.last_donation_date) || 'Never donated'}</div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-gray-900/50 rounded-xl p-4">
                                            <label className="text-sm text-gray-400">Location</label>
                                            <div className="text-white">{profileData.location || 'Not provided'}</div>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-xl p-4">
                                            <label className="text-sm text-gray-400">Contact Info</label>
                                            <div className="text-white">{profileData.contact_info || profileData.contact_number || 'Not provided'}</div>
                                        </div>
                                    </div>

                                    {status && (
                                        <div className={`p-4 rounded-xl text-center font-semibold ${status.includes('✅')
                                            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                                            : 'bg-red-500/20 border border-red-500/50 text-red-400'
                                            }`}>
                                            {status}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Role-specific additional info */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="glass-effect rounded-xl p-6 text-center animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                                <div className="text-3xl mb-3">🔒</div>
                                <h3 className="text-lg font-bold text-red-400 mb-2">Account Security</h3>
                                <p className="text-gray-300 text-sm">Your account is protected with secure authentication</p>
                            </div>

                            <div className="glass-effect rounded-xl p-6 text-center animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                                <div className="text-3xl mb-3">📊</div>
                                <h3 className="text-lg font-bold text-red-400 mb-2">Profile Status</h3>
                                <p className="text-gray-300 text-sm">
                                    {profileData.location && (profileData.contact_info || profileData.contact_number)
                                        ? 'Profile Complete'
                                        : 'Profile Incomplete - Please update your information'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-6">❌</div>
                        <h3 className="text-2xl font-bold text-red-400 mb-4">Profile Not Found</h3>
                        <p className="text-gray-300">Unable to load profile information.</p>
                    </div>
                )}
            </div>
        </section>
    )
}

export default Profile