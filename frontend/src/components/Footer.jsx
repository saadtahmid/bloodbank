import React from 'react'

const Footer = () => (
    <footer className="bg-gradient-to-t from-black via-gray-900 to-black text-white py-12 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/5 via-transparent to-red-900/5"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-8">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="glass-effect rounded-2xl p-6 card-hover animate-fadeInUp">
                    <h3 className="text-xl font-bold gradient-text mb-4 flex items-center">
                        <span className="mr-2">🩸</span>
                        Blood Donation System
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                        Connecting lives through technology. Every drop counts, every donor matters.
                    </p>
                    <div className="mt-4 flex space-x-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-400">System Active 24/7</span>
                    </div>
                </div>

                <div className="glass-effect rounded-2xl p-6 card-hover animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center">
                        <span className="mr-2">📞</span>
                        Emergency Contact
                    </h3>
                    <div className="space-y-3 text-gray-300">
                        <p className="flex items-center">
                            <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                            Hotline: 999
                        </p>
                        <p className="flex items-center">
                            <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                            Email: emergency@bloodbank.org
                        </p>
                        <p className="flex items-center">
                            <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                            Available 24/7
                        </p>
                    </div>
                </div>

                <div className="glass-effect rounded-2xl p-6 card-hover animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center">
                        <span className="mr-2">📊</span>
                        Quick Stats
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Lives Saved</span>
                            <span className="text-green-400 font-bold">10,000+</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Active Donors</span>
                            <span className="text-blue-400 font-bold">5,000+</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Partner Hospitals</span>
                            <span className="text-purple-400 font-bold">50+</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-700/50 pt-8 mt-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 mb-4 md:mb-0">
                        © 2025 Blood Donation Management System. Saving lives through technology.
                    </p>
                    <div className="flex space-x-6">
                        <button className="text-gray-400 hover:text-red-400 transition-colors duration-200 hover:scale-110 transform">
                            Privacy Policy
                        </button>
                        <button className="text-gray-400 hover:text-red-400 transition-colors duration-200 hover:scale-110 transform">
                            Terms of Service
                        </button>
                        <button className="text-gray-400 hover:text-red-400 transition-colors duration-200 hover:scale-110 transform">
                            Contact Us
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </footer>
)

export default Footer
