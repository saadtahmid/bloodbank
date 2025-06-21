import { Router } from 'express'
import {
    getAllUsers,
    getAllDonors,
    getAllBloodBanks,
    getAllHospitals,
    findUserByEmailAndRole,
    getCampsByDivision,
    registerUserWithRole,
    registerDonorForCamp,
    getRegisteredCampsForDonor,
    getRegistrationsForBloodBank,
    updateRegistrationAttendedStatus
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

// Register a donor for a camp
router.post('/camps/register', async (req, res) => {
    const { donor_id, camp_id } = req.body
    if (!donor_id || !camp_id) {
        return res.status(400).json({ success: false, error: 'donor_id and camp_id are required' })
    }
    try {
        const result = await registerDonorForCamp(donor_id, camp_id)
        if (result.success) {
            res.json({ success: true })
        } else {
            res.status(400).json({ success: false, error: result.error })
        }
    } catch (err) {
        res.status(500).json({ success: false, error: 'Registration failed' })
    }
})

// Get all camps a donor is registered for
router.get('/camps/registered/:donor_id', async (req, res) => {
    const { donor_id } = req.params
    if (!donor_id) {
        return res.status(400).json({ error: 'donor_id is required' })
    }
    try {
        const result = await getRegisteredCampsForDonor(donor_id)
        res.json(result)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch registered camps' })
    }
})

// Get all registrations for all camps organized by a blood bank
router.get('/camps/registrations/:bloodbank_id', async (req, res) => {
    const { bloodbank_id } = req.params
    if (!bloodbank_id) {
        return res.status(400).json({ error: 'bloodbank_id is required' })
    }
    try {
        const result = await getRegistrationsForBloodBank(bloodbank_id)
        res.json(result)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch registrations' })
    }
})

// Update attended status for a registration
router.put('/camps/registration/:registration_id', async (req, res) => {
    const { registration_id } = req.params
    const { attended } = req.body
    if (!registration_id || !['Y', 'N'].includes(attended)) {
        return res.status(400).json({ error: 'registration_id and valid attended status are required' })
    }
    try {
        const result = await updateRegistrationAttendedStatus(registration_id, attended)
        if (result.success) {
            res.json({ success: true })
        } else {
            res.status(400).json({ success: false, error: result.error })
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update registration' })
    }
})

export default router
