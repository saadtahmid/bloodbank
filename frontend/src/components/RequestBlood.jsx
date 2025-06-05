import React from 'react'

const RequestBlood = ({ user }) => {
    if (!user) {
        return (
            <div className="text-center text-red-500 mt-10">
                Please <a href="#login" className="underline text-red-400">login</a> as a hospital to request blood.
            </div>
        )
    }
    if (user.role.toLowerCase() !== 'hospital') {
        return (
            <div className="text-center text-red-500 mt-10">
                Only hospital accounts can request blood.
            </div>
        )
    }
    return (
        <section className="bg-black text-white py-8 flex flex-col items-center min-h-[40vh]">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Request Blood</h2>
            {/* Blood request form will go here */}
            <div className="text-gray-300">Blood request form coming soon...</div>
        </section>
    )
}

export default RequestBlood
