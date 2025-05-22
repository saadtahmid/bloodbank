import React from 'react'

const Features = () => (
    <section className="features bg-black text-white py-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4 text-center">Key Features</h2>
        <ul className="max-w-2xl w-full text-left space-y-3">
            <li><strong className="text-red-400">User Role Management:</strong> Secure access for Donors, Blood Banks, Hospitals, and Admins.</li>
            <li><strong className="text-red-400">Geographical Integration:</strong> Standardized location data for all users and facilities.</li>
            <li><strong className="text-red-400">Donor Tracking:</strong> Manage donor health, contact info, and donation history.</li>
            <li><strong className="text-red-400">Camp Organization:</strong> Blood banks can organize and track donation camps.</li>
            <li><strong className="text-red-400">Blood Inventory:</strong> Real-time monitoring of blood units and expiry dates.</li>
            <li><strong className="text-red-400">Hospital Requests:</strong> Hospitals can request blood and track request status.</li>
            <li><strong className="text-red-400">Urgent Needs:</strong> Blood banks can post urgent appeals for donors.</li>
            <li><strong className="text-red-400">Inter-Bank Transfers:</strong> Manage and track blood unit transfers between banks.</li>
        </ul>
    </section>
)

export default Features
