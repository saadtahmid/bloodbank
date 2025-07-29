import { useState, useEffect } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts'
import { Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react'

const HospitalDashboard = ({ hospitalId }) => {
    const [analytics, setAnalytics] = useState(null)
    const [recommendations, setRecommendations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchAnalytics()
        fetchRecommendations()
    }, [hospitalId])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/hospital/${hospitalId}/analytics`)
            const data = await response.json()

            if (data.success) {
                setAnalytics(data.analytics)
            } else {
                setError(data.error)
            }
        } catch (err) {
            setError('Failed to fetch hospital analytics')
            console.error('Analytics fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchRecommendations = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/hospital/${hospitalId}/recommendations`)
            const data = await response.json()

            if (data.success) {
                setRecommendations(data.recommendations)
            }
        } catch (err) {
            console.error('Recommendations fetch error:', err)
        }
    }

    if (loading) {
        return (
            <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-400"></div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center p-6">
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl p-6 backdrop-blur-sm max-w-md">
                    <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-200">Error</h3>
                            <div className="text-sm text-red-300 mt-2">{error}</div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (!analytics) {
        return (
            <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center p-6">
                <div className="bg-gray-900/50 border border-gray-700/50 text-gray-300 rounded-xl p-6 backdrop-blur-sm">
                    <p className="text-gray-300">No analytics data available</p>
                </div>
            </section>
        )
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

    const getRecommendationIcon = (type) => {
        switch (type) {
            case 'urgent': return <AlertTriangle className="h-5 w-5 text-red-500" />
            case 'warning': return <Clock className="h-5 w-5 text-yellow-500" />
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
            default: return <Activity className="h-5 w-5 text-blue-500" />
        }
    }

    const getRecommendationBgColor = (type) => {
        switch (type) {
            case 'urgent': return 'bg-red-500/10 border-red-500/30'
            case 'warning': return 'bg-yellow-500/10 border-yellow-500/30'
            case 'success': return 'bg-green-500/10 border-green-500/30'
            default: return 'bg-blue-500/10 border-blue-500/30'
        }
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white py-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>

            <div className="relative z-10 container mx-auto px-6 space-y-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Hospital Analytics Dashboard</h1>
                    <p className="text-gray-300">Comprehensive insights into your blood request patterns and success rates</p>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <TrendingUp className="h-8 w-8 text-blue-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-300">Overall Success Rate</p>
                                <p className="text-2xl font-bold text-white">{analytics.successRates.overall}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-8 w-8 text-red-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-300">Emergency Success Rate</p>
                                <p className="text-2xl font-bold text-white">{analytics.successRates.emergency}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Calendar className="h-8 w-8 text-green-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-300">Total Requests</p>
                                <p className="text-2xl font-bold text-white">{analytics.successRates.totalRequests}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-purple-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-300">Fulfilled Requests</p>
                                <p className="text-2xl font-bold text-white">{analytics.successRates.fulfilledRequests}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Usage Statistics */}
                <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 mb-8 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold text-white mb-6">Monthly Usage Statistics</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={analytics.monthlyStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="month"
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                                stroke="#D1D5DB"
                            />
                            <YAxis stroke="#D1D5DB" />
                            <Tooltip
                                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                contentStyle={{
                                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                    border: '1px solid rgba(75, 85, 99, 0.5)',
                                    borderRadius: '8px',
                                    color: '#F9FAFB'
                                }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="totalRequests" stackId="1" stroke="#3B82F6" fill="rgba(59, 130, 246, 0.3)" name="Total Requests" />
                            <Area type="monotone" dataKey="fulfilledRequests" stackId="2" stroke="#10B981" fill="rgba(16, 185, 129, 0.3)" name="Fulfilled Requests" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Blood Type Demand Patterns and Yearly Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Blood Type Demand */}
                    <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white mb-6">Blood Type Demand Patterns</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analytics.demandPatterns}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ bloodType, totalUnitsRequested }) => `${bloodType}: ${totalUnitsRequested}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="totalUnitsRequested"
                                >
                                    {analytics.demandPatterns.map((entry, index) => (
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

                    {/* Yearly Comparison */}
                    <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white mb-6">Yearly Comparison</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.yearlyComparison}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="year" stroke="#D1D5DB" />
                                <YAxis stroke="#D1D5DB" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                        border: '1px solid rgba(75, 85, 99, 0.5)',
                                        borderRadius: '8px',
                                        color: '#F9FAFB'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="totalRequests" fill="#3B82F6" name="Total Requests" />
                                <Bar dataKey="fulfilledRequests" fill="#10B981" name="Fulfilled Requests" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Emergency Request Tracking */}
                <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 mb-8 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold text-white mb-6">Recent Emergency Requests</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Request ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Blood Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Units
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Request Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Required By
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800/30 divide-y divide-gray-700">
                                {analytics.emergencyTracking.map((request) => (
                                    <tr key={request.request_id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                            #{request.request_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {request.blood_type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {request.units_requested}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${request.status === 'FULFILLED'
                                                    ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                                                    : request.status === 'PENDING'
                                                        ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                                                        : 'bg-red-500/20 border border-red-500/50 text-red-400'
                                                }`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {request.request_date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {request.required_by ? new Date(request.required_by).toLocaleString() : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="bg-gray-900/50 rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white mb-6">Recommendations</h2>
                        <div className="space-y-4">
                            {recommendations.map((rec, index) => (
                                <div key={index} className={`border rounded-xl p-4 ${getRecommendationBgColor(rec.type)}`}>
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            {getRecommendationIcon(rec.type)}
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-white">{rec.title}</h3>
                                            <p className="mt-1 text-sm text-gray-300">{rec.description}</p>
                                            {rec.actionable && (
                                                <div className="mt-2">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 border border-blue-500/50 text-blue-400">
                                                        Actionable
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default HospitalDashboard
