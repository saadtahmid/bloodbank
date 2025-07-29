import { Router } from 'express'
import { generateToken, verifyToken, optionalAuth } from '../middleware/auth.js'
import {
    getAllUsers,
    getAllDonors,
    getAllBloodBanks,
    getAllHospitals,
    findUserByEmail,
    getCampsByDivision,
    createCamp,
    getCampsForBloodBank,
    registerUserWithRole,
    registerDonorForCamp,
    getRegisteredCampsForDonor,
    getRegistrationsForBloodBank,
    updateRegistrationAttendedStatus,
    addDonationForRegistration,
    getDonationHistoryForDonor,
    getBloodRequestHistoryForHospital,
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
    updateBloodBankProfile,
    getDonorLeaderboard,
    getHospitalAnalytics,
    getHospitalRecommendations,
    getBloodBankAnalytics
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
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
    }
    try {
        const user = await findUserByEmail(email, password)
        if (user) {
            // Generate JWT token
            const token = generateToken(user)
            res.json({
                success: true,
                user,
                token,
                message: 'Login successful'
            })
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' })
        }
    } catch (err) {
        console.error('Login error:', err)
        res.status(500).json({ error: 'Login failed' })
    }
})

// Protected route to get current user info
router.get('/me', verifyToken, async (req, res) => {
    try {
        // req.user is set by the verifyToken middleware
        res.json({
            success: true,
            user: req.user,
            message: 'User authenticated'
        })
    } catch (err) {
        console.error('Get current user error:', err)
        res.status(500).json({ error: 'Failed to get user info' })
    }
})

// Route to refresh token
router.post('/refresh-token', verifyToken, async (req, res) => {
    try {
        // Generate a new token with updated info
        const token = generateToken(req.user)
        res.json({
            success: true,
            token,
            message: 'Token refreshed successfully'
        })
    } catch (err) {
        console.error('Token refresh error:', err)
        res.status(500).json({ error: 'Failed to refresh token' })
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

// Create a new camp (for blood banks)
router.post('/camps', verifyToken, async (req, res) => {
    const { camp_name, location, start_date, end_date } = req.body

    // Validate required fields
    if (!camp_name || !location || !start_date || !end_date) {
        return res.status(400).json({
            success: false,
            error: 'Camp name, location, start date, and end date are required'
        })
    }

    // Validate dates
    const startDate = new Date(start_date)
    const endDate = new Date(end_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate < today) {
        return res.status(400).json({
            success: false,
            error: 'Start date cannot be in the past'
        })
    }

    if (endDate < startDate) {
        return res.status(400).json({
            success: false,
            error: 'End date cannot be before start date'
        })
    }

    // Check if user is a blood bank
    if (!req.user.bloodbank_id) {
        return res.status(403).json({
            success: false,
            error: 'Only blood banks can create camps'
        })
    }

    try {
        const result = await createCamp(req.user.bloodbank_id, {
            camp_name,
            location,
            start_date,
            end_date
        })

        if (result.success) {
            res.status(201).json(result)
        } else {
            res.status(400).json(result)
        }
    } catch (err) {
        console.error('Error creating camp:', err)
        res.status(500).json({ success: false, error: 'Failed to create camp' })
    }
})

// Get camps for a specific blood bank
router.get('/camps/bloodbank/:bloodbank_id', async (req, res) => {
    const { bloodbank_id } = req.params

    try {
        const camps = await getCampsForBloodBank(bloodbank_id)
        res.json(camps)
    } catch (err) {
        console.error('Error fetching camps for blood bank:', err)
        res.status(500).json({ error: 'Failed to fetch camps' })
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

// Add a direct donation (not from camp)
router.post('/donations/direct', async (req, res) => {
    console.log('POST /api/donations/direct called')
    console.log('Request body:', req.body)
    const { donor_id, bloodbank_id, blood_type, units, urgent_need_id } = req.body
    if (!donor_id || !bloodbank_id || !blood_type || !units) {
        console.log('Missing required fields')
        return res.status(400).json({ error: 'donor_id, bloodbank_id, blood_type, and units are required' })
    }
    try {
        const result = await addDirectDonation({ donor_id, bloodbank_id, blood_type, units, urgent_need_id })
        console.log('Direct donation insert result:', result)
        if (result.success) {
            res.json({ success: true, donation_id: result.donation_id })
        } else {
            res.status(400).json({ success: false, error: result.error })
        }
    } catch (err) {
        console.error('Failed to add direct donation:', err)
        res.status(500).json({ error: 'Failed to add direct donation' })
    }
})

// Get donation history for a donor
router.get('/donations/history/:donor_id', async (req, res) => {
    const { donor_id } = req.params
    if (!donor_id) {
        return res.status(400).json({ error: 'donor_id is required' })
    }
    try {
        const donations = await getDonationHistoryForDonor(donor_id)
        res.json(donations)
    } catch (err) {
        console.error('Error fetching donation history:', err)
        res.status(500).json({ error: 'Failed to fetch donation history' })
    }
})

// Get blood request history for a hospital
router.get('/blood-requests/history/:hospital_id', async (req, res) => {
    const { hospital_id } = req.params
    if (!hospital_id) {
        return res.status(400).json({ error: 'hospital_id is required' })
    }
    try {
        const requests = await getBloodRequestHistoryForHospital(hospital_id)
        res.json(requests)
    } catch (err) {
        console.error('Error fetching blood request history:', err)
        res.status(500).json({ error: 'Failed to fetch blood request history' })
    }
})

// Hospital requests blood from a blood bank
router.post('/blood-requests', async (req, res) => {
    const {
        hospital_id,
        blood_type,
        units_requested,
        requested_to,
        priority,
        required_by,
        patient_condition,
        broadcast_to_multiple,
        broadcast_group_id // Add this line
    } = req.body

    if (!hospital_id || !blood_type || !units_requested || !requested_to) {
        return res.status(400).json({ error: 'Hospital ID, blood type, units requested, and requested_to are required' })
    }

    try {
        const result = await createBloodRequest({
            hospital_id,
            blood_type,
            units_requested,
            requested_to,
            priority,
            required_by,
            patient_condition,
            broadcast_to_multiple,
            broadcast_group_id  // Add this line
        })

        if (result.success) {
            res.json(result)
        } else {
            res.status(400).json({ error: result.error })
        }
    } catch (error) {
        console.error('Blood request error:', error)
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
        console.log('Fulfill request result:', result)
        if (result.success) {
            res.json({
                success: true,
                consumed_units: result.consumed_units,
                broadcast_cancelled: result.broadcast_cancelled
            })
        } else {
            console.log('Fulfill request failed:', result.error)
            res.status(400).json({ success: false, error: result.error })
        }
    } catch (err) {
        console.error('Fulfill request route error:', err)
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
        console.error('Error in urgent-needs/for-donor:', err)
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

// Get donor leaderboard
router.get('/donor-leaderboard', async (req, res) => {
    try {
        console.log('Fetching donor leaderboard...')
        const leaderboard = await getDonorLeaderboard()
        res.json({
            success: true,
            leaderboard
        })
    } catch (error) {
        console.error('Leaderboard error:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch donor leaderboard'
        })
    }
})

// Get hospital analytics for dashboard
router.get('/hospital/:hospital_id/analytics', async (req, res) => {
    try {
        const { hospital_id } = req.params
        console.log('Fetching hospital analytics for hospital_id:', hospital_id)

        const analytics = await getHospitalAnalytics(hospital_id)
        res.json({
            success: true,
            analytics
        })
    } catch (error) {
        console.error('Hospital analytics error:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch hospital analytics'
        })
    }
})

// Get hospital recommendations
router.get('/hospital/:hospital_id/recommendations', async (req, res) => {
    try {
        const { hospital_id } = req.params
        console.log('Fetching hospital recommendations for hospital_id:', hospital_id)

        const recommendations = await getHospitalRecommendations(hospital_id)
        res.json({
            success: true,
            recommendations
        })
    } catch (error) {
        console.error('Hospital recommendations error:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch hospital recommendations'
        })
    }
})

// Blood bank analytics
router.get('/bloodbank/:bloodbank_id/analytics', async (req, res) => {
    try {
        const { bloodbank_id } = req.params
        const analytics = await getBloodBankAnalytics(bloodbank_id)
        res.json({ success: true, analytics })
    } catch (error) {
        console.error('Blood bank analytics error:', error)
        res.status(500).json({ success: false, error: 'Failed to fetch analytics' })
    }
})

export default router
