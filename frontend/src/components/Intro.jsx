import React from 'react'

const Intro = () => (
    <section className="bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white py-20 flex flex-col items-center relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse-gentle"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-600/5 rounded-full blur-3xl animate-pulse-gentle"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-8">
            <h2 className="text-5xl font-bold mb-8 animate-fadeInUp">
                <span className="gradient-text">Bridging the Gap</span>
                <br />
                <span className="text-white">Between Life and Hope</span>
            </h2>
            <div className="space-y-6 text-lg text-gray-300 leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <p className="glass-effect rounded-2xl p-6 backdrop-blur-sm border border-white/10 card-hover">
                    Our <span className="text-red-400 font-semibold">Blood Donation Management System</span> revolutionizes
                    how donors, hospitals, and blood banks connect and collaborate to save lives.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="glass-effect rounded-2xl p-6 card-hover animate-slideInLeft">
                        <div className="text-3xl mb-4 text-center">🎯</div>
                        <h3 className="text-xl font-bold text-red-400 mb-3">Our Mission</h3>
                        <p>To create a seamless, efficient network that ensures no one in need of blood goes without help.</p>
                    </div>
                    <div className="glass-effect rounded-2xl p-6 card-hover animate-slideInLeft" style={{ animationDelay: '0.3s' }}>
                        <div className="text-3xl mb-4 text-center">💡</div>
                        <h3 className="text-xl font-bold text-red-400 mb-3">Our Vision</h3>
                        <p>A world where technology bridges the gap between blood donors and those who need life-saving transfusions.</p>
                    </div>
                </div>
            </div>
            <div className="mt-12 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                <div className="flex flex-wrap justify-center gap-4">
                    <div className="glass-effect px-6 py-3 rounded-full border border-red-500/30">
                        <span className="text-red-400 font-semibold">Real-time Tracking</span>
                    </div>
                    <div className="glass-effect px-6 py-3 rounded-full border border-red-500/30">
                        <span className="text-red-400 font-semibold">Smart Matching</span>
                    </div>
                    <div className="glass-effect px-6 py-3 rounded-full border border-red-500/30">
                        <span className="text-red-400 font-semibold">Emergency Alerts</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
)

export default Intro
