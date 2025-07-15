import React from 'react'  

const About = () => {
    const bloodCompatibility = [
        { donor: 'O-', recipients: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], title: 'Universal Donor' },
        { donor: 'O+', recipients: ['O+', 'A+', 'B+', 'AB+'], title: 'Common Donor' },
        { donor: 'A-', recipients: ['A-', 'A+', 'AB-', 'AB+'], title: 'A Negative' },
        { donor: 'A+', recipients: ['A+', 'AB+'], title: 'A Positive' },
        { donor: 'B-', recipients: ['B-', 'B+', 'AB-', 'AB+'], title: 'B Negative' },
        { donor: 'B+', recipients: ['B+', 'AB+'], title: 'B Positive' },
        { donor: 'AB-', recipients: ['AB-', 'AB+'], title: 'AB Negative' },
        { donor: 'AB+', recipients: ['AB+'], title: 'Universal Recipient' }
    ]

    const donationFacts = [
        { icon: '🩸', title: 'Save Lives', description: 'One donation can save up to 3 lives', color: 'from-red-500 to-red-600' },
        { icon: '⏰', title: '56 Days', description: 'Time between whole blood donations', color: 'from-blue-500 to-blue-600' },
        { icon: '🔬', title: '4 Components', description: 'Red cells, platelets, plasma, and cryoprecipitate', color: 'from-green-500 to-green-600' },
        { icon: '💪', title: 'Health Benefits', description: 'Regular donation can improve cardiovascular health', color: 'from-purple-500 to-purple-600' },
        { icon: '🌍', title: 'Global Impact', description: '118.5 million blood donations collected globally', color: 'from-orange-500 to-orange-600' },
        { icon: '⚡', title: '10 Minutes', description: 'The actual donation process takes only 8-10 minutes', color: 'from-yellow-500 to-yellow-600' }
    ]

    const eligibilityCriteria = [
        { icon: '🎂', title: 'Age', requirement: '18-65 years old', eligible: true },
        { icon: '⚖️', title: 'Weight', requirement: 'Minimum 50kg (110 lbs)', eligible: true },
        { icon: '❤️', title: 'Health', requirement: 'Good general health', eligible: true },
        { icon: '🩺', title: 'Hemoglobin', requirement: 'Men: ≥13.0 g/dL, Women: ≥12.5 g/dL', eligible: true },
        { icon: '🍺', title: 'Alcohol', requirement: 'No alcohol 24 hours before', eligible: false },
        { icon: '💊', title: 'Medications', requirement: 'Some medications may defer donation', eligible: false }
    ]

    const donationProcess = [
        { step: 1, title: 'Registration', description: 'Fill out donor information form', icon: '📝', time: '5 min' },
        { step: 2, title: 'Health Screening', description: 'Mini-physical and health history', icon: '🩺', time: '10 min' },
        { step: 3, title: 'Donation', description: 'The actual blood collection', icon: '🩸', time: '8-10 min' },
        { step: 4, title: 'Recovery', description: 'Rest and refreshments', icon: '🍪', time: '10 min' }
    ]

    return (
        <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white py-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-400/5 rounded-full blur-3xl"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-8">
                {/* Hero Section */}
                <div className="text-center mb-16 animate-fadeInUp">
                    <h1 className="text-5xl font-bold gradient-text mb-6 flex items-center justify-center">
                        <span className="mr-4">🩸</span>
                        About Blood Donation
                    </h1>
                    <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                        Blood donation is a voluntary procedure that can help save the lives of others.
                        Learn about the life-saving impact of your donation and how you can become a hero in your community.
                    </p>
                </div>

                {/* Blood Compatibility Chart */}
                <div className="mb-16 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <div className="glass-effect rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-red-400 mb-8 text-center flex items-center justify-center">
                            <span className="mr-3">🔄</span>
                            Blood Type Compatibility Chart
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {bloodCompatibility.map((blood, index) => (
                                <div
                                    key={blood.donor}
                                    className="glass-effect rounded-xl p-6 card-hover animate-fadeInUp"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="text-center mb-4">
                                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold mb-3 ${blood.donor === 'O-' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                                blood.donor === 'AB+' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                                    'bg-gradient-to-r from-red-500 to-red-600'
                                            }`}>
                                            {blood.donor}
                                        </div>
                                        <h3 className="text-lg font-bold text-red-400">{blood.title}</h3>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-300 text-sm mb-3">Can donate to:</p>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {blood.recipients.map(recipient => (
                                                <span
                                                    key={recipient}
                                                    className="bg-gray-700/50 px-2 py-1 rounded text-xs font-semibold border border-gray-600/50"
                                                >
                                                    {recipient}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Donation Facts */}
                <div className="mb-16 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                    <div className="glass-effect rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-red-400 mb-8 text-center flex items-center justify-center">
                            <span className="mr-3">📊</span>
                            Blood Donation Facts
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {donationFacts.map((fact, index) => (
                                <div
                                    key={fact.title}
                                    className="glass-effect rounded-xl p-6 card-hover animate-fadeInUp"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="text-center">
                                        <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${fact.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                                            {fact.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-red-400 mb-2">{fact.title}</h3>
                                        <p className="text-gray-300 leading-relaxed">{fact.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Donation Process */}
                <div className="mb-16 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                    <div className="glass-effect rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-red-400 mb-8 text-center flex items-center justify-center">
                            <span className="mr-3">🔄</span>
                            Donation Process
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {donationProcess.map((process, index) => (
                                <div
                                    key={process.step}
                                    className="relative glass-effect rounded-xl p-6 card-hover animate-fadeInUp"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                        {process.step}
                                    </div>
                                    <div className="text-center pt-2">
                                        <div className="text-4xl mb-4">{process.icon}</div>
                                        <h3 className="text-lg font-bold text-red-400 mb-2">{process.title}</h3>
                                        <p className="text-gray-300 text-sm mb-3">{process.description}</p>
                                        <div className="bg-green-500/20 border border-green-500/50 rounded-full px-3 py-1 text-green-400 text-xs font-semibold">
                                            ~{process.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <div className="glass-effect rounded-xl p-6 max-w-md mx-auto">
                                <h3 className="text-xl font-bold text-red-400 mb-2">Total Time</h3>
                                <p className="text-2xl font-bold text-white">~45 minutes</p>
                                <p className="text-gray-300 text-sm">Complete donation experience</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Eligibility Criteria */}
                <div className="mb-16 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
                    <div className="glass-effect rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-red-400 mb-8 text-center flex items-center justify-center">
                            <span className="mr-3">✅</span>
                            Eligibility Criteria
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {eligibilityCriteria.map((criteria, index) => (
                                <div
                                    key={criteria.title}
                                    className="glass-effect rounded-xl p-6 card-hover animate-fadeInUp"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="text-3xl mr-4">{criteria.icon}</div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-red-400">{criteria.title}</h3>
                                            <div className={`w-3 h-3 rounded-full ${criteria.eligible ? 'bg-green-400' : 'bg-yellow-400'
                                                } animate-pulse`}></div>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 text-sm">{criteria.requirement}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center animate-fadeInUp" style={{ animationDelay: '1s' }}>
                    <div className="glass-effect rounded-2xl p-12 max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-red-400 mb-6 flex items-center justify-center">
                            <span className="mr-3">💝</span>
                            Ready to Save Lives?
                        </h2>
                        <p className="text-xl text-gray-300 leading-relaxed mb-8">
                            Your donation can make the difference between life and death for someone in need.
                            Join thousands of heroes who donate blood regularly and help build a stronger, healthier community.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6">
                            <a
                                href="#view-camps"
                                className="button-modern px-8 py-4 rounded-xl font-semibold text-white shadow-xl hover:scale-105 transition-transform duration-200 flex items-center"
                            >
                                <span className="mr-2">🏕️</span>
                                Find Donation Camps
                            </a>
                            <a
                                href="#blood-bank-directory"
                                className="bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 px-8 py-4 rounded-xl font-semibold text-white shadow-xl hover:scale-105 transition-all duration-200 flex items-center"
                            >
                                <span className="mr-2">🏥</span>
                                Find Blood Banks
                            </a>
                        </div>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <div className="bg-red-500/20 border border-red-500/30 px-4 py-2 rounded-full">
                                <span className="text-red-400 font-semibold">📞 Emergency: 999</span>
                            </div>
                            <div className="bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-full">
                                <span className="text-blue-400 font-semibold">🕒 Available 24/7</span>
                            </div>
                            <div className="bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-full">
                                <span className="text-green-400 font-semibold">🩸 Safe & Secure</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default About