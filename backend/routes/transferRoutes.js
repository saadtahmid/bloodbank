/* filepath: d:\BloodBank\backend\routes\transferRoutes.js */
import express from 'express'
import {
    createBloodBankRequest,
    getBloodBankRequests,
    updateBloodBankRequestStatus,
    createTransfer,
    getTransfersByBloodBank,
    updateTransferStatus,
    getBloodInventoryForBank
} from '../services/transferService.js'

const router = express.Router()

// Create a blood request between blood banks
router.post('/blood-requests/bloodbank', async (req, res) => {
    const { from_bloodbank_id, to_bloodbank_id, blood_type, units_requested, message } = req.body

    if (!from_bloodbank_id || !to_bloodbank_id || !blood_type || !units_requested) {
        return res.status(400).json({ error: 'All required fields must be provided' })
    }

    if (from_bloodbank_id === to_bloodbank_id) {
        return res.status(400).json({ error: 'Cannot request from yourself' })
    }

    try {
        const result = await createBloodBankRequest({ from_bloodbank_id, to_bloodbank_id, blood_type, units_requested, message })
        if (result.success) {
            res.json({ success: true, request_id: result.request_id })
        } else {
            res.status(400).json({ error: result.error })
        }
    } catch (err) {
        console.error('Create blood request error:', err)
        res.status(500).json({ error: 'Failed to create blood request' })
    }
})

// Get blood requests for a blood bank (sent and received)
router.get('/blood-requests/bloodbank/:bloodbank_id', async (req, res) => {
    const { bloodbank_id } = req.params

    if (!bloodbank_id) {
        return res.status(400).json({ error: 'bloodbank_id is required' })
    }

    try {
        const requests = await getBloodBankRequests(bloodbank_id)
        res.json(requests)
    } catch (err) {
        console.error('Get blood requests error:', err)
        res.status(500).json({ error: 'Failed to fetch blood requests' })
    }
})

// Update blood request status
router.put('/blood-requests/bloodbank/:request_id', async (req, res) => {
    const { request_id } = req.params
    const { status } = req.body

    if (!request_id || !status) {
        return res.status(400).json({ error: 'request_id and status are required' })
    }

    if (!['PENDING', 'APPROVED', 'REJECTED', 'FULFILLED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' })
    }

    try {
        const result = await updateBloodBankRequestStatus(request_id, status)
        if (result.success) {
            res.json({ success: true })
        } else {
            res.status(400).json({ error: result.error })
        }
    } catch (err) {
        console.error('Update request status error:', err)
        res.status(500).json({ error: 'Failed to update request status' })
    }
})

// Create a new transfer request
router.post('/bloodbank-transfers', async (req, res) => {
    const { from_bloodbank_id, to_bloodbank_id, blood_type, units_transferred } = req.body

    if (!from_bloodbank_id || !to_bloodbank_id || !blood_type || !units_transferred) {
        return res.status(400).json({ error: 'All fields are required' })
    }

    if (from_bloodbank_id === to_bloodbank_id) {
        return res.status(400).json({ error: 'Cannot transfer to the same blood bank' })
    }

    try {
        const result = await createTransfer({ from_bloodbank_id, to_bloodbank_id, blood_type, units_transferred })
        if (result.success) {
            res.json({ success: true, transfer_id: result.transfer_id })
        } else {
            res.status(400).json({ error: result.error })
        }
    } catch (err) {
        console.error('Transfer creation error:', err)
        res.status(500).json({ error: 'Failed to create transfer' })
    }
})

// Get transfers for a blood bank (sent and received)
router.get('/bloodbank-transfers/:bloodbank_id', async (req, res) => {
    const { bloodbank_id } = req.params

    if (!bloodbank_id) {
        return res.status(400).json({ error: 'bloodbank_id is required' })
    }

    try {
        const transfers = await getTransfersByBloodBank(bloodbank_id)
        res.json(transfers)
    } catch (err) {
        console.error('Get transfers error:', err)
        res.status(500).json({ error: 'Failed to fetch transfers' })
    }
})

// Update transfer status
router.put('/bloodbank-transfers/:transfer_id', async (req, res) => {
    const { transfer_id } = req.params
    const { status } = req.body

    if (!transfer_id || !status) {
        return res.status(400).json({ error: 'transfer_id and status are required' })
    }

    if (!['PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' })
    }

    try {
        const result = await updateTransferStatus(transfer_id, status)
        if (result.success) {
            res.json({ success: true })
        } else {
            res.status(400).json({ error: result.error })
        }
    } catch (err) {
        console.error('Update transfer status error:', err)
        res.status(500).json({ error: 'Failed to update transfer status' })
    }
})

// Get blood inventory for a blood bank (for transfer component)
router.get('/blood-inventory/:bloodbank_id', async (req, res) => {
    const { bloodbank_id } = req.params

    if (!bloodbank_id) {
        return res.status(400).json({ error: 'bloodbank_id is required' })
    }

    try {
        const inventory = await getBloodInventoryForBank(bloodbank_id)
        res.json(inventory)
    } catch (err) {
        console.error('Get inventory error:', err)
        res.status(500).json({ error: 'Failed to fetch inventory' })
    }
})

export default router