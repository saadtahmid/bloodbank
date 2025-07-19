/* filepath: d:\BloodBank\backend\middleware\auth.js */
import jwt from 'jsonwebtoken'

export const generateToken = (user) => {
    return jwt.sign(
        {
            user_id: user.user_id,
            email: user.email,
            role: user.role,
            ...(user.donor_id && { donor_id: user.donor_id }),
            ...(user.hospital_id && { hospital_id: user.hospital_id }),
            ...(user.bloodbank_id && { bloodbank_id: user.bloodbank_id })
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        }
    )
}

export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' })
        }

        const token = authHeader.substring(7) // Remove 'Bearer ' prefix

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' })
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' })
        }
        return res.status(500).json({ error: 'Token verification failed' })
    }
}

// Optional middleware for routes that work with or without auth
export const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = decoded
        }
        next()
    } catch (err) {
        // Continue without user if token is invalid
        next()
    }
}