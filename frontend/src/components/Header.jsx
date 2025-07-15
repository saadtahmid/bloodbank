import React from 'react'

const Header = () => (
    <header className="relative bg-gradient-to-r from-black via-gray-900 to-red-900 text-white py-16 flex flex-col items-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-black/40"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-xl animate-pulse-gentle"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-red-600/10 rounded-full blur-2xl animate-pulse-gentle"></div>

        <div className="relative z-10 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fadeInUp">
                <span className="gradient-text">Blood Donation</span>
                <br />
                <span className="text-white">Management System</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 animate-fadeInUp animation-delay-200 max-w-3xl mx-auto leading-relaxed">
                Streamlining coordination between donors, hospitals, and blood banks with modern technology.
            </p>
            <div className="mt-8 animate-fadeInUp animation-delay-400">
                <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    <span className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                    <span className="text-sm text-gray-300">System Online</span>
                </div>
            </div>
        </div>
    </header>
)

export default Header
