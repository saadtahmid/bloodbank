import React, { useState, useEffect } from 'react';
import ProfileImage from './ProfileImage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DonorLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/donor-leaderboard`);
            const data = await response.json();

            if (data.success) {
                setLeaderboard(data.leaderboard);
            } else {
                setError('Failed to load leaderboard');
            }
        } catch (err) {
            console.error('Leaderboard fetch error:', err);
            setError('Network error while loading leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const getBadgeStyle = (badgeColor) => {
        switch (badgeColor) {
            case 'golden':
                return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900';
            case 'silver':
                return 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900';
            case 'bronze':
                return 'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900';
            default:
                return 'bg-gray-600 text-gray-300';
        }
    };

    const getRankStyle = (rank) => {
        if (rank === 1) return 'text-yellow-400 font-bold text-xl';
        if (rank === 2) return 'text-gray-300 font-bold text-lg';
        if (rank === 3) return 'text-orange-400 font-bold text-lg';
        return 'text-gray-400 font-semibold';
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return '👑';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    if (loading) {
        return (
            <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white py-12">
                <div className="max-w-6xl mx-auto px-8">
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-gray-300">Loading leaderboard...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white py-12">
                <div className="max-w-6xl mx-auto px-8">
                    <div className="text-center py-20">
                        <div className="text-6xl mb-6">❌</div>
                        <h3 className="text-2xl font-bold text-red-400 mb-4">Error Loading Leaderboard</h3>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <button
                            onClick={fetchLeaderboard}
                            className="button-modern px-6 py-3 rounded-xl font-semibold text-white"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white py-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>

            <div className="relative z-10 max-w-6xl mx-auto px-8">
                {/* Header */}
                <div className="text-center mb-12 animate-fadeInUp">
                    <h2 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center">
                        <span className="mr-3">🏆</span>
                        Donor Leaderboard
                    </h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Celebrating our heroes who save lives through blood donation
                    </p>
                </div>

                {/* Leaderboard */}
                <div className="glass-effect rounded-2xl p-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    {leaderboard.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-6">🩸</div>
                            <h3 className="text-2xl font-bold text-red-400 mb-4">No Donors Yet</h3>
                            <p className="text-gray-300">Be the first to make a donation and claim the top spot!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Table Header */}
                            <div className="grid grid-cols-5 gap-4 p-4 bg-gray-900/50 rounded-xl font-semibold text-red-400 border-b border-red-500/20">
                                <div className="text-center">Rank</div>
                                <div className="text-center">Donor</div>
                                <div className="text-center">Name</div>
                                <div className="text-center">Total Donations</div>
                                <div className="text-center">Badge</div>
                            </div>

                            {/* Leaderboard Entries */}
                            {leaderboard.map((donor, index) => (
                                <div
                                    key={donor.donor_id}
                                    className={`grid grid-cols-5 gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                                        donor.rank <= 3
                                            ? 'bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-500/30 shadow-lg'
                                            : 'bg-gray-900/30 hover:bg-gray-800/50'
                                    }`}
                                    style={{ animationDelay: `${0.1 * index}s` }}
                                >
                                    {/* Rank */}
                                    <div className="flex items-center justify-center">
                                        <span className={`${getRankStyle(donor.rank)} flex items-center gap-1`}>
                                            {donor.rank <= 3 && <span>{getRankIcon(donor.rank)}</span>}
                                            {donor.rank > 3 && getRankIcon(donor.rank)}
                                        </span>
                                    </div>

                                    {/* Profile Image */}
                                    <div className="flex items-center justify-center">
                                        <ProfileImage
                                            imageUrl={donor.image_url}
                                            size="w-12 h-12"
                                            fallbackIcon="🩸"
                                        />
                                    </div>

                                    {/* Name */}
                                    <div className="flex items-center justify-center text-center">
                                        <span className="font-semibold text-white">{donor.name}</span>
                                    </div>

                                    {/* Total Donations */}
                                    <div className="flex items-center justify-center">
                                        <span className="text-red-400 font-bold text-lg">
                                            {donor.total_donations}
                                        </span>
                                    </div>

                                    {/* Badge */}
                                    <div className="flex items-center justify-center">
                                        {donor.badge ? (
                                            <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getBadgeStyle(donor.badgeColor)}`}>
                                                <span>{donor.badge}</span>
                                                <span className="capitalize">{donor.badgeColor}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">—</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Badge Legend */}
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <div className="glass-effect rounded-xl p-6 text-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                        <div className="text-3xl mb-3">🥇</div>
                        <h3 className="text-lg font-bold text-yellow-400 mb-2">Golden Badge</h3>
                        <p className="text-gray-300 text-sm">5+ Donations</p>
                    </div>

                    <div className="glass-effect rounded-xl p-6 text-center animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                        <div className="text-3xl mb-3">🥈</div>
                        <h3 className="text-lg font-bold text-gray-300 mb-2">Silver Badge</h3>
                        <p className="text-gray-300 text-sm">3-4 Donations</p>
                    </div>

                    <div className="glass-effect rounded-xl p-6 text-center animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                        <div className="text-3xl mb-3">🥉</div>
                        <h3 className="text-lg font-bold text-orange-400 mb-2">Bronze Badge</h3>
                        <p className="text-gray-300 text-sm">1-2 Donations</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DonorLeaderboard;
