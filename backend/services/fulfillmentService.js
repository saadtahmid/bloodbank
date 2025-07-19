/* filepath: d:\BloodBank\backend\services\fulfillmentService.js */
import sql from '../db.js'

// Base fulfillment service for all types of requests
export class FulfillmentService {

    // Reserve units for any type of transfer/request
    static async reserveUnits(bloodbank_id, blood_type, units_needed, reservation_type = 'TRANSFER') {
        try {
            // Get available units (FIFO - oldest first)
            const availableUnits = await sql`
                SELECT unit_id, collected_date, expiry_date 
                FROM bloodbank.BloodUnit 
                WHERE bloodbank_id = ${bloodbank_id} 
                AND blood_type = ${blood_type} 
                AND status = 'AVAILABLE'
                ORDER BY expiry_date ASC, collected_date ASC
                LIMIT ${units_needed}
            `

            if (availableUnits.length < units_needed) {
                return {
                    success: false,
                    error: `Only ${availableUnits.length} units available, need ${units_needed}`
                }
            }

            const unitIds = availableUnits.map(u => u.unit_id)

            // Mark units as reserved
            await sql`
                UPDATE bloodbank.BloodUnit 
                SET status = 'RESERVED'
                WHERE unit_id = ANY(${unitIds})
            `

            return {
                success: true,
                reserved_units: availableUnits,
                unit_ids: unitIds
            }
        } catch (err) {
            console.error('Reserve units error:', err)
            return { success: false, error: 'Failed to reserve units' }
        }
    }

    // Release reserved units back to available
    static async releaseReservedUnits(unit_ids) {
        try {
            await sql`
                UPDATE bloodbank.BloodUnit 
                SET status = 'AVAILABLE'
                WHERE unit_id = ANY(${unit_ids}) AND status = 'RESERVED'
            `
            return { success: true }
        } catch (err) {
            console.error('Release reserved units error:', err)
            return { success: false, error: 'Failed to release units' }
        }
    }

    // Transfer units between blood banks
    static async transferUnits(from_bloodbank_id, to_bloodbank_id, unit_ids) {
        try {
            // Get unit details
            const units = await sql`
                SELECT unit_id, blood_type, collected_date, expiry_date 
                FROM bloodbank.BloodUnit 
                WHERE unit_id = ANY(${unit_ids}) 
                AND bloodbank_id = ${from_bloodbank_id}
                AND status = 'RESERVED'
            `

            if (units.length !== unit_ids.length) {
                return { success: false, error: 'Some units not found or not reserved' }
            }

            // Remove units from sender
            await sql`
                DELETE FROM bloodbank.BloodUnit 
                WHERE unit_id = ANY(${unit_ids})
            `

            // Add units to receiver
            for (const unit of units) {
                await sql`
                    INSERT INTO bloodbank.BloodUnit 
                    (bloodbank_id, blood_type, units, collected_date, expiry_date, status)
                    VALUES (
                        ${to_bloodbank_id}, 
                        ${unit.blood_type}, 
                        1, 
                        ${unit.collected_date}, 
                        ${unit.expiry_date}, 
                        'AVAILABLE'
                    )
                `
            }

            return { success: true, transferred_units: units }
        } catch (err) {
            console.error('Transfer units error:', err)
            return { success: false, error: 'Failed to transfer units' }
        }
    }

    // Consume units (for hospital requests)
    static async consumeUnits(bloodbank_id, blood_type, units_needed, request_id) {
        try {
            // Reserve units first
            const reservation = await this.reserveUnits(bloodbank_id, blood_type, units_needed, 'CONSUMPTION')
            if (!reservation.success) {
                return reservation
            }

            // Mark reserved units as used
            await sql`
                UPDATE bloodbank.BloodUnit 
                SET status = 'USED'
                WHERE unit_id = ANY(${reservation.unit_ids})
            `

            return {
                success: true,
                consumed_units: reservation.reserved_units,
                request_id
            }
        } catch (err) {
            console.error('Consume units error:', err)
            return { success: false, error: 'Failed to consume units' }
        }
    }
}