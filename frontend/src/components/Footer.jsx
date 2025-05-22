import React from 'react'

const Footer = () => (
    <footer className="bg-black text-white py-4  flex justify-center items-center">
        <p className="text-sm text-center">
            &copy; {new Date().getFullYear()} <span className="text-red-500">Blood Donation Management System</span>
        </p>
    </footer>
)

export default Footer
