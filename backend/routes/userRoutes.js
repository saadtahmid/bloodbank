import { Router } from 'express'
import {
    getAllUsers,
    getAllDonors,
    getAllBloodBanks,
    getAllHospitals,
    findUserByEmail,
    getCampsByDivision,
    registerUserWithRole,
    registerDonorForCamp,
    getRegisteredCampsForDonor,
    getRegistrationsForBloodBank,
    updateRegistrationAttendedStatus,
    addDonationForRegistration,
    createBloodRequest,
    getBloodRequestsForBank,
    getAvailableBloodUnitsForBank,
    fulfillBloodRequest,
    getDonorById,
    addDirectDonation,
    getUrgentNeedsForDonor,
    getUrgentNeedsForBank,
    getDonorsByBloodType,
    fulfillUrgentNeed,
    getLatestUnseenNotifications,
    markNotificationAsSeen,
    getHospitalById,
    getBloodBankById,
    updateDonorProfile,
    updateHospitalProfile,
    updateBloodBankProfile
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
    const { email, password } = req.body // Remove role from destructuring
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
    }
    try {
        const user = await findUserByEmail(email, password) // Use new function
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

// Add a donation for a camp registration
router.post('/donations', async (req, res) => {
    console.log('POST /api/donations called')
    console.log('Request body:', req.body)
    const { donor_id, bloodbank_id, camp_id, blood_type, units } = req.body
    if (!donor_id || !bloodbank_id || !camp_id || !blood_type || !units) {
        console.log('Missing required fields')
        return res.status(400).json({ error: 'All fields are required' })
    }
    try {
        const result = await addDonationForRegistration({ donor_id, bloodbank_id, camp_id, blood_type, units })
        console.log('Donation insert result:', result)
        if (result.success) {
            res.json({ success: true, donation_id: result.donation_id })
        } else {
            res.status(400).json({ success: false, error: result.error })
        }
    } catch (err) {
        console.error('Failed to add donation:', err)
        res.status(500).json({ error: 'Failed to add donation' })
    }
})

// Hospital requests blood from a blood bank
router.post('/blood-requests', async (req, res) => {
    const { hospital_id, blood_type, units_requested, requested_to } = req.body
    if (!hospital_id || !blood_type || !units_requested || !requested_to) {
        return res.status(400).json({ error: 'All fields are required' })
    }
    try {
        const result = await createBloodRequest({ hospital_id, blood_type, units_requested, requested_to })
        if (result.success) {
            res.json({ success: true, request_id: result.request_id })
        } else {
            res.status(400).json({ success: false, error: result.error })
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to create blood request' })
    }
})

// Blood banks can view requests sent to them
router.get('/blood-requests/for-bank/:bloodbank_id', async (req, res) => {
    const { bloodbank_id } = req.params
    if (!bloodbank_id) {
        return res.status(400).json({ error: 'bloodbank_id is required' })
    }
    try {
        const result = await getBloodRequestsForBank(bloodbank_id)
        res.json(result)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch blood requests' })
    }
})

// Get available blood units for a blood bank
router.get('/blood-units/:bloodbank_id', async (req, res) => {
    const { bloodbank_id } = req.params
    if (!bloodbank_id) {
        return res.status(400).json({ error: 'bloodbank_id is required' })
    }
    try {
        const units = await getAvailableBloodUnitsForBank(bloodbank_id)
        res.json(units)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch blood units' })
    }
})

// Fulfill a blood request
router.post('/blood-requests/fulfill/:request_id', async (req, res) => {
    const { request_id } = req.params
    try {
        const result = await fulfillBloodRequest(request_id)
        if (result.success) {
            res.json({ success: true, used_units: result.used_units })
        } else {
            res.status(400).json({ success: false, error: result.error })
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to fulfill request' })
    }
})

// Get profile data for different user types
router.get('/donors/:donor_id', async (req, res) => {
    const { donor_id } = req.params
    if (!donor_id) return res.status(400).json({ error: 'donor_id is required' })
    try {
        const donor = await getDonorById(donor_id)
        if (donor) res.json(donor)
        else res.status(404).json({ error: 'Donor not found' })
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch donor' })
    }
})

router.get('/hospitals/:hospital_id', async (req, res) => {
    const { hospital_id } = req.params
    if (!hospital_id) return res.status(400).json({ error: 'hospital_id is required' })
    try {
        const hospital = await getHospitalById(hospital_id)
        if (hospital) res.json(hospital)
        else res.status(404).json({ error: 'Hospital not found' })
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch hospital' })
    }
})

router.get('/bloodbanks/:bloodbank_id', async (req, res) => {
    const { bloodbank_id } = req.params
    if (!bloodbank_id) return res.status(400).json({ error: 'bloodbank_id is required' })
    try {
        const bloodbank = await getBloodBankById(bloodbank_id)
        if (bloodbank) res.json(bloodbank)
        else res.status(404).json({ error: 'Blood bank not found' })
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch blood bank' })
    }
})

// Update profile data
router.put('/donors/:donor_id', async (req, res) => {
    const { donor_id } = req.params
    const { location, weight, contact_info } = req.body
    try {
        const result = await updateDonorProfile(donor_id, { location, weight, contact_info })
        if (result.success) {
            res.json({ success: true })
        } else {
            res.status(400).json({ success: false, error: result.error })
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update donor profile' })
    }
})

router.put('/hospitals/:hospital_id', async (req, res) => {
    const { hospital_id } = req.params
    const { location, contact_info } = req.body
    try {
        const result = await updateHospitalProfile(hospital_id, { location, contact_info })
        if (result.success) {
            res.json({ success: true })
        } else {
            res.status(400).json({ success: false, error: result.error })
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update hospital profile' })
    }
})

router.put('/bloodbanks/:bloodbank_id', async (req, res) => {
    const { bloodbank_id } = req.params
    const { location, contact_number } = req.body
    try {
        const result = await updateBloodBankProfile(bloodbank_id, { location, contact_number })
        if (result.success) {
            res.json({ success: true })
        } else {
            res.status(400).json({ success: false, error: result.error })
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update blood bank profile' })
    }
})

// For donors
router.get('/urgent-needs/for-donor/:donor_id', async (req, res) => {
    try {
        const urgent = await getUrgentNeedsForDonor(req.params.donor_id)
        res.json(urgent)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch urgent needs' })
    }
})

// For blood banks
router.get('/urgent-needs/for-bank/:bloodbank_id', async (req, res) => {
    try {
        const urgent = await getUrgentNeedsForBank(req.params.bloodbank_id)
        res.json(urgent)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch urgent needs' })
    }
})

// Get all donors for a blood type
router.get('/donors/by-blood-type/:blood_type', async (req, res) => {
    const { blood_type } = req.params
    try {
        const donors = await getDonorsByBloodType(blood_type)
        res.json(donors)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch donors' })
    }
})

// Fulfill urgent need
router.post('/urgent-needs/fulfill/:urgent_need_id', async (req, res) => {
    const { urgent_need_id } = req.params
    const { donor_id, bloodbank_id, units } = req.body
    if (!donor_id || !bloodbank_id || !units) {
        return res.status(400).json({ error: 'All fields are required' })
    }
    try {
        const result = await fulfillUrgentNeed({ urgent_need_id, donor_id, bloodbank_id, units })
        if (result.success) {
            res.json({ success: true })
        } else {
            res.status(400).json({ success: false, error: result.error })
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to fulfill urgent need' })
    }
})

// Get latest unseen notifications for a user
router.get('/notifications/latest/:user_id', async (req, res) => {
    try {
        const notifications = await getLatestUnseenNotifications(req.params.user_id)
        res.json(notifications)
    } catch (err) {
        res.status(500).json({ error: 'Failed to load notifications' })
    }
})

// Mark notification as seen
router.post('/notifications/seen/:notification_id', async (req, res) => {
    try {
        await markNotificationAsSeen(req.params.notification_id)
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark notification as seen' })
    }
})

export default router
