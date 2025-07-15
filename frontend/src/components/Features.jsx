import React from 'react'

const Features = () => (
    <section className="bg-gradient-to-b from-black to-gray-900 text-white py-16 flex flex-col items-center">
        <h2 className="text-4xl font-bold gradient-text mb-12 text-center animate-fadeInUp">
            Key Features
        </h2>
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
            {[
                { icon: "👥", title: "User Role Management", desc: "Secure access for Donors, Blood Banks, Hospitals, and Admins." },
                { icon: "🌍", title: "Geographical Integration", desc: "Standardized location data for all users and facilities." },
                { icon: "💉", title: "Donor Tracking", desc: "Manage donor health, contact info, and donation history." },
                { icon: "🏕️", title: "Camp Organization", desc: "Blood banks can organize and track donation camps." },
                { icon: "🩸", title: "Blood Inventory", desc: "Real-time monitoring of blood units and expiry dates." },
                { icon: "🏥", title: "Hospital Requests", desc: "Hospitals can request blood and track request status." },
                { icon: "🚨", title: "Urgent Needs", desc: "Blood banks can post urgent appeals for donors." },
                { icon: "🔄", title: "Inter-Bank Transfers", desc: "Manage and track blood unit transfers between banks." }
            ].map((feature, index) => (
                <div
                    key={index}
                    className="glass-effect rounded-2xl p-6 card-hover animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <div className="text-4xl mb-4 text-center animate-pulse-gentle">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-red-400 mb-3 text-center">{feature.title}</h3>
                    <p className="text-gray-300 text-center leading-relaxed">{feature.desc}</p>
                </div>
            ))}
        </div>
    </section>
)

export default Features
