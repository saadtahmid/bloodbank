import { useState, useEffect } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Area, AreaChart, RadialBarChart, RadialBar
} from 'recharts'
import { 
    TrendingUp, AlertTriangle, CheckCircle, Clock, Activity, 
    Package, Users, Calendar, Target, Award, Zap 
} from 'lucide-react'

const BloodBankDashboard = ({ bloodbank_id }) => {
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchAnalytics()
    }, [bloodbank_id])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bloodbank/${bloodbank_id}/analytics`)
            const data = await response.json()

            if (data.success) {
                setAnalytics(data.analytics)
            } else {
                setError(data.error)
            }
        } catch (err) {
            setError('Failed to fetch blood bank analytics')
            console.error('Analytics fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-400 mb-4"></div>
                    <p className="text-white text-lg">Loading analytics...</p>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
                <div className="glass-effect rounded-2xl p-12 text-center max-w-md">
                    <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-4">Error Loading Analytics</h2>
                    <p className="text-gray-300">{error}</p>
                </div>
            </section>
        )
    }

    if (!analytics) {
        return (
            <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
                <div className="glass-effect rounded-2xl p-12 text-center max-w-md">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-4">No Data Available</h2>
                    <p className="text-gray-300">No analytics data available</p>
                </div>
            </section>
        )
    }

    const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

    return (
        <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white py-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-8">
                {/* Header */}
                <div className="text-center mb-12 animate-fadeInUp">
                    <h1 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center">
                        <Activity className="mr-3 h-8 w-8" />
                        Blood Bank Analytics Dashboard
                    </h1>
                    <p className="text-xl text-gray-300">
                        Comprehensive insights into your blood bank operations and performance
                    </p>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Package className="h-8 w-8 text-blue-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-300">Total Blood Units</p>
                                <p className="text-2xl font-bold text-white">{analytics.inventory.totalUnits}</p>
                                <p className="text-xs text-blue-400">Available: {analytics.inventory.availableUnits}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Target className="h-8 w-8 text-green-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-300">Fulfillment Rate</p>
                                <p className="text-2xl font-bold text-white">{analytics.fulfillment.rate}%</p>
                                <p className="text-xs text-green-400">{analytics.fulfillment.fulfilled}/{analytics.fulfillment.total} requests</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Users className="h-8 w-8 text-purple-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-300">Active Donors</p>
                                <p className="text-2xl font-bold text-white">{analytics.donors.active}</p>
                                <p className="text-xs text-purple-400">This month: {analytics.donors.thisMonth}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Zap className="h-8 w-8 text-yellow-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-300">Emergency Requests</p>
                                <p className="text-2xl font-bold text-white">{analytics.emergency.count}</p>
                                <p className="text-xs text-yellow-400">Response: {analytics.emergency.responseRate}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row 1: Inventory Distribution & Request Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Blood Type Distribution */}
                    <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Package className="mr-2 h-6 w-6" />
                            Blood Type Inventory
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analytics.inventory.byBloodType}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ bloodType, units }) => `${bloodType}: ${units}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="units"
                                >
                                    {analytics.inventory.byBloodType.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                        border: '1px solid rgba(75, 85, 99, 0.5)',
                                        borderRadius: '8px',
                                        color: '#F9FAFB'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Monthly Request Trends */}
                    <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <TrendingUp className="mr-2 h-6 w-6" />
                            Monthly Request Trends
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={analytics.requestTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="month" stroke="#D1D5DB" />
                                <YAxis stroke="#D1D5DB" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                        border: '1px solid rgba(75, 85, 99, 0.5)',
                                        borderRadius: '8px',
                                        color: '#F9FAFB'
                                    }}
                                />
                                <Area type="monotone" dataKey="totalRequests" stackId="1" stroke="#3B82F6" fill="rgba(59, 130, 246, 0.3)" name="Total Requests" />
                                <Area type="monotone" dataKey="fulfilledRequests" stackId="2" stroke="#10B981" fill="rgba(16, 185, 129, 0.3)" name="Fulfilled" />
                                <Area type="monotone" dataKey="emergencyRequests" stackId="3" stroke="#EF4444" fill="rgba(239, 68, 68, 0.3)" name="Emergency" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Charts Row 2: Donation Sources & Expiry Tracking */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Donation Sources */}
                    <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Users className="mr-2 h-6 w-6" />
                            Donation Sources
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.donationSources}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="source" stroke="#D1D5DB" />
                                <YAxis stroke="#D1D5DB" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                        border: '1px solid rgba(75, 85, 99, 0.5)',
                                        borderRadius: '8px',
                                        color: '#F9FAFB'
                                    }}
                                />
                                <Bar dataKey="donations" fill="#8B5CF6" name="Donations" />
                                <Bar dataKey="units" fill="#EC4899" name="Units Collected" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Expiry Tracking */}
                    <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Clock className="mr-2 h-6 w-6" />
                            Blood Unit Expiry Tracking
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                <div>
                                    <p className="text-red-400 font-semibold">Expiring in 7 days</p>
                                    <p className="text-2xl font-bold text-white">{analytics.expiry.next7Days}</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-red-400" />
                            </div>
                            <div className="flex justify-between items-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                                <div>
                                    <p className="text-yellow-400 font-semibold">Expiring in 14 days</p>
                                    <p className="text-2xl font-bold text-white">{analytics.expiry.next14Days}</p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-400" />
                            </div>
                            <div className="flex justify-between items-center p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                <div>
                                    <p className="text-green-400 font-semibold">Expiring in 30 days</p>
                                    <p className="text-2xl font-bold text-white">{analytics.expiry.next30Days}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Hospitals & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Top Requesting Hospitals */}
                    <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Award className="mr-2 h-6 w-6" />
                            Top Requesting Hospitals
                        </h2>
                        <div className="space-y-4">
                            {analytics.topHospitals.map((hospital, index) => (
                                <div key={hospital.hospital_id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 ${
                                            index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                            index === 1 ? 'bg-gray-500/20 text-gray-400' :
                                            index === 2 ? 'bg-orange-500/20 text-orange-400' :
                                            'bg-gray-600/20 text-gray-300'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">{hospital.name}</p>
                                            <p className="text-gray-400 text-sm">{hospital.location}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold">{hospital.totalRequests}</p>
                                        <p className="text-gray-400 text-sm">requests</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Activity className="mr-2 h-6 w-6" />
                            Performance Metrics
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={analytics.performanceMetrics}>
                                <RadialBar
                                    dataKey="value"
                                    cornerRadius={10}
                                    fill="#8884d8"
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                        border: '1px solid rgba(75, 85, 99, 0.5)',
                                        borderRadius: '8px',
                                        color: '#F9FAFB'
                                    }}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <Calendar className="mr-2 h-6 w-6" />
                        Recent Activity
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Activity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-900/30 divide-y divide-gray-700">
                                {analytics.recentActivity.map((activity, index) => (
                                    <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {activity.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                activity.type === 'donation' ? 'bg-green-500/20 text-green-400' :
                                                activity.type === 'request' ? 'bg-blue-500/20 text-blue-400' :
                                                activity.type === 'emergency' ? 'bg-red-500/20 text-red-400' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {activity.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white">
                                            {activity.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                activity.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                activity.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                                {activity.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default BloodBankDashboard