import { Router } from 'express'
import {
    getAllUsers,
    getAllDonors,
    getAllBloodBanks,
    getAllHospitals,
    findUserByEmailAndRole,
    getCampsByDivision,
    registerUserWithRole
} from '../services/userService.js'

const router = Router()

router.get('/users', async (req, res) => {
    try {
        const users = await getAllUsers()
        res.json(users)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' })
    }
})

router.get('/donors', async (req, res) => {
    try {
        const donors = await getAllDonors()
        res.json(donors)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch donors' })
    }
})

router.get('/bloodbanks', async (req, res) => {
    try {
        const banks = await getAllBloodBanks()
        res.json(banks)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch blood banks' })
    }
})

router.get('/hospitals', async (req, res) => {
    try {
        const hospitals = await getAllHospitals()
        res.json(hospitals)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch hospitals' })
    }
})

router.post('/login', async (req, res) => {
    const { email, password, role } = req.body
    if (!email || !password || !role) {
        return res.status(400).json({ error: 'Email, password, and role are required' })
    }
    try {
        const user = await findUserByEmailAndRole(email, password, role)
        if (user) {
            res.json({ success: true, user })
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' })
        }
    } catch (err) {
        res.status(500).json({ error: 'Login failed' })
    }
})

router.post('/register', async (req, res) => {
    try {
        const { email, password, role, ...rest } = req.body
        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Email, password, and role are required' })
        }
        const result = await registerUserWithRole(email, password, role, rest)
        if (result.success) {
            res.json({ success: true, user_id: result.user_id })
        } else {
            res.status(400).json({ success: false, error: result.error })
        }
    } catch (err) {
        res.status(500).json({ error: 'Registration failed' })
    }
})

router.get('/camps', async (req, res) => {
    const { division = '' } = req.query
    try {
        const camps = await getCampsByDivision(division)
        res.json(camps)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch camps' })
    }
})

export default router
