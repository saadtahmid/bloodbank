import { Router } from 'express'
import {
    getAllUsers,
    getAllDonors,
    getAllBloodBanks,
    getAllHospitals,
    findUserByEmailAndRole
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

export default router
