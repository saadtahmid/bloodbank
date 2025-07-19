/* filepath: d:\BloodBank\backend\services\transferService.js */
import sql from '../db.js'
import { FulfillmentService } from './fulfillmentService.js'

// Blood Bank to Blood Bank Request Functions
export async function createBloodBankRequest({ from_bloodbank_id, to_bloodbank_id, blood_type, units_requested, message }) {
    try {
        // Verify both blood banks exist
        const bloodbanks = await sql`
            SELECT bloodbank_id FROM bloodbank.BloodBank 
            WHERE bloodbank_id IN (${from_bloodbank_id}, ${to_bloodbank_id})
        `

        if (bloodbanks.length !== 2) {
            return { success: false, error: 'Invalid blood bank ID(s)' }
        }

        const result = await sql`
            INSERT INTO bloodbank.BloodBankRequest 
            (from_bloodbank_id, to_bloodbank_id, blood_type, units_requested, message)
            VALUES (${from_bloodbank_id}, ${to_bloodbank_id}, ${blood_type}, ${units_requested}, ${message || ''})
            RETURNING bb_request_id
        `

        return { success: true, request_id: result[0].bb_request_id }
    } catch (err) {
        console.error('Create blood bank request error:', err)
        return { success: false, error: 'Database error' }
    }
}

export async function getBloodBankRequests(bloodbank_id) {
    try {
        const requests = await sql`
            SELECT 
                bbr.*,
                bb_from.name as from_name,
                bb_to.name as to_name,
                bbr.bb_request_id as request_id,
                bbr.from_bloodbank_id,
                bbr.to_bloodbank_id
            FROM bloodbank.BloodBankRequest bbr
            LEFT JOIN bloodbank.BloodBank bb_from ON bbr.from_bloodbank_id = bb_from.bloodbank_id
            LEFT JOIN bloodbank.BloodBank bb_to ON bbr.to_bloodbank_id = bb_to.bloodbank_id
            WHERE bbr.from_bloodbank_id = ${bloodbank_id} OR bbr.to_bloodbank_id = ${bloodbank_id}
            ORDER BY bbr.request_date DESC
        `

        // Format dates
        return requests.map(request => ({
            ...request,
            request_date: request.request_date ? request.request_date.toISOString().slice(0, 10) : null,
            fulfilled_date: request.fulfilled_date ? request.fulfilled_date.toISOString().slice(0, 10) : null
        }))
    } catch (err) {
        console.error('Get blood bank requests error:', err)
        throw new Error('Failed to fetch blood requests')
    }
}

export async function updateBloodBankRequestStatus(request_id, status) {
    try {
        // Get request details
        const request = await sql`
            SELECT * FROM bloodbank.BloodBankRequest WHERE bb_request_id = ${request_id}
        `

        if (request.length === 0) {
            return { success: false, error: 'Request not found' }
        }

        const requestData = request[0]

        // Handle status-specific logic
        if (status === 'APPROVED') {
            // Reserve units when approved
            const reservation = await FulfillmentService.reserveUnits(
                requestData.to_bloodbank_id,
                requestData.blood_type,
                requestData.units_requested,
                'BB_REQUEST'
            )

            if (!reservation.success) {
                return { success: false, error: reservation.error }
            }

            // Store reserved unit IDs in request
            await sql`
                UPDATE bloodbank.BloodBankRequest 
                SET status = ${status}, reserved_unit_ids = ${JSON.stringify(reservation.unit_ids)}
                WHERE bb_request_id = ${request_id}
            `
        } else if (status === 'FULFILLED') {
            // Get reserved units and transfer them
            const reservedUnitIds = requestData.reserved_unit_ids ? JSON.parse(requestData.reserved_unit_ids) : null

            if (!reservedUnitIds) {
                return { success: false, error: 'No units reserved for this request' }
            }

            const transfer = await FulfillmentService.transferUnits(
                requestData.to_bloodbank_id,
                requestData.from_bloodbank_id,
                reservedUnitIds
            )

            if (!transfer.success) {
                return { success: false, error: transfer.error }
            }

            await sql`
                UPDATE bloodbank.BloodBankRequest 
                SET status = ${status}, fulfilled_date = CURRENT_DATE
                WHERE bb_request_id = ${request_id}
            `
        } else if (status === 'REJECTED') {
            // Release reserved units if any
            if (requestData.reserved_unit_ids) {
                const unitIds = JSON.parse(requestData.reserved_unit_ids)
                await FulfillmentService.releaseReservedUnits(unitIds)
            }

            await sql`
                UPDATE bloodbank.BloodBankRequest 
                SET status = ${status}
                WHERE bb_request_id = ${request_id}
            `
        } else {
            // For PENDING status
            await sql`
                UPDATE bloodbank.BloodBankRequest 
                SET status = ${status}
                WHERE bb_request_id = ${request_id}
            `
        }

        return { success: true }
    } catch (err) {
        console.error('Update request status error:', err)
        return { success: false, error: 'Failed to update request status' }
    }
}

// Existing transfer functions (keeping as they were)
export async function createTransfer({ from_bloodbank_id, to_bloodbank_id, blood_type, units_transferred }) {
    try {
        // Check availability using fulfillment service
        const reservation = await FulfillmentService.reserveUnits(
            from_bloodbank_id,
            blood_type,
            units_transferred,
            'DIRECT_TRANSFER'
        )

        if (!reservation.success) {
            return { success: false, error: reservation.error }
        }

        // Release reservation for now (will re-reserve when status changes)
        await FulfillmentService.releaseReservedUnits(reservation.unit_ids)

        // Verify both blood banks exist
        const bloodbanks = await sql`
            SELECT bloodbank_id FROM bloodbank.BloodBank 
            WHERE bloodbank_id IN (${from_bloodbank_id}, ${to_bloodbank_id})
        `

        if (bloodbanks.length !== 2) {
            return { success: false, error: 'Invalid blood bank ID(s)' }
        }

        // Create transfer record
        const result = await sql`
            INSERT INTO bloodbank.BloodBankTransfer 
            (from_bloodbank_id, to_bloodbank_id, blood_type, units_transferred)
            VALUES (${from_bloodbank_id}, ${to_bloodbank_id}, ${blood_type}, ${units_transferred})
            RETURNING transfer_id
        `

        return { success: true, transfer_id: result[0].transfer_id }
    } catch (err) {
        console.error('Create transfer error:', err)
        return { success: false, error: 'Database error' }
    }
}

export async function getTransfersByBloodBank(bloodbank_id) {
    try {
        const transfers = await sql`
            SELECT 
                bt.*,
                bb_from.name as from_name,
                bb_to.name as to_name
            FROM bloodbank.BloodBankTransfer bt
            LEFT JOIN bloodbank.BloodBank bb_from ON bt.from_bloodbank_id = bb_from.bloodbank_id
            LEFT JOIN bloodbank.BloodBank bb_to ON bt.to_bloodbank_id = bb_to.bloodbank_id
            WHERE bt.from_bloodbank_id = ${bloodbank_id} OR bt.to_bloodbank_id = ${bloodbank_id}
            ORDER BY bt.transfer_date DESC
        `

        // Format dates
        return transfers.map(transfer => ({
            ...transfer,
            transfer_date: transfer.transfer_date ? transfer.transfer_date.toISOString().slice(0, 10) : null
        }))
    } catch (err) {
        console.error('Get transfers error:', err)
        throw new Error('Failed to fetch transfers')
    }
}

export async function updateTransferStatus(transfer_id, status) {
    try {
        // Get transfer details
        const transfer = await sql`
            SELECT * FROM bloodbank.BloodBankTransfer WHERE transfer_id = ${transfer_id}
        `

        if (transfer.length === 0) {
            return { success: false, error: 'Transfer not found' }
        }

        const transferData = transfer[0]

        // Validate status transition
        if (transferData.status === 'COMPLETED' || transferData.status === 'CANCELLED') {
            return { success: false, error: 'Cannot modify completed or cancelled transfer' }
        }

        // Update transfer status
        await sql`
            UPDATE bloodbank.BloodBankTransfer 
            SET status = ${status}
            WHERE transfer_id = ${transfer_id}
        `

        // Handle status-specific actions
        if (status === 'IN_TRANSIT') {
            await reserveUnitsForTransfer(transferData)
        } else if (status === 'COMPLETED') {
            await completeTransfer(transferData)
        } else if (status === 'CANCELLED') {
            await releaseReservedUnits(transferData)
        }

        return { success: true }
    } catch (err) {
        console.error('Update transfer status error:', err)
        return { success: false, error: 'Failed to update transfer status' }
    }
}

async function reserveUnitsForTransfer(transfer) {
    try {
        // Get available units (oldest first)
        const units = await sql`
            SELECT unit_id FROM bloodbank.BloodUnit 
            WHERE bloodbank_id = ${transfer.from_bloodbank_id} 
            AND blood_type = ${transfer.blood_type} 
            AND status = 'AVAILABLE'
            ORDER BY expiry_date ASC, collected_date ASC
            LIMIT ${transfer.units_transferred}
        `

        if (units.length < transfer.units_transferred) {
            throw new Error('Not enough units available to reserve')
        }

        const unitIds = units.map(u => u.unit_id)

        // Mark units as reserved (now this will work with updated schema)
        await sql`
            UPDATE bloodbank.BloodUnit 
            SET status = 'RESERVED'
            WHERE unit_id = ANY(${unitIds})
        `
    } catch (err) {
        console.error('Reserve units error:', err)
        throw err
    }
}

async function completeTransfer(transfer) {
    try {
        // Get reserved units for this transfer
        const reservedUnits = await sql`
            SELECT unit_id, collected_date, expiry_date FROM bloodbank.BloodUnit 
            WHERE bloodbank_id = ${transfer.from_bloodbank_id} 
            AND blood_type = ${transfer.blood_type} 
            AND status = 'RESERVED'
            ORDER BY expiry_date ASC, collected_date ASC
            LIMIT ${transfer.units_transferred}
        `

        if (reservedUnits.length < transfer.units_transferred) {
            throw new Error('Not enough reserved units to complete transfer')
        }

        // Remove reserved units from sender
        const unitIds = reservedUnits.map(u => u.unit_id)
        await sql`
            DELETE FROM bloodbank.BloodUnit 
            WHERE unit_id = ANY(${unitIds})
        `

        // Add new units to recipient with same expiry dates
        for (const unit of reservedUnits) {
            await sql`
                INSERT INTO bloodbank.BloodUnit 
                (bloodbank_id, blood_type, units, collected_date, expiry_date, status)
                VALUES (
                    ${transfer.to_bloodbank_id}, 
                    ${transfer.blood_type}, 
                    1, 
                    ${unit.collected_date}, 
                    ${unit.expiry_date}, 
                    'AVAILABLE'
                )
            `
        }
    } catch (err) {
        console.error('Complete transfer error:', err)
        throw err
    }
}

async function releaseReservedUnits(transfer) {
    try {
        // Release reserved units back to available
        await sql`
            UPDATE bloodbank.BloodUnit 
            SET status = 'AVAILABLE'
            WHERE bloodbank_id = ${transfer.from_bloodbank_id} 
            AND blood_type = ${transfer.blood_type} 
            AND status = 'RESERVED'
        `
    } catch (err) {
        console.error('Release reserved units error:', err)
        throw err
    }
}

export async function getBloodInventoryForBank(bloodbank_id) {
    try {
        const inventory = await sql`
            SELECT 
                blood_type,
                SUM(units) as total_units,
                COUNT(*) as unit_count
            FROM bloodbank.BloodUnit 
            WHERE bloodbank_id = ${bloodbank_id} 
            AND status = 'AVAILABLE'
            GROUP BY blood_type
            ORDER BY blood_type
        `

        return inventory
    } catch (err) {
        console.error('Get blood inventory error:', err)
        throw new Error('Failed to fetch blood inventory')
    }
}