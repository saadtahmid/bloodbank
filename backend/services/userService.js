import sql from '../db.js'
import bcrypt from 'bcryptjs'
import { FulfillmentService } from './fulfillmentService.js'

// Get all users
export async function getAllUsers() {
    const result = await sql`SELECT user_id, email, role FROM bloodbank.Users ORDER BY user_id`
    console.log('getAllUsers result:', result)
    return result

}

// Get all donors
export async function getAllDonors() {
    const result = await sql`SELECT * FROM bloodbank.Donors ORDER BY donor_id`
    console.log('getAllDonors result:', result)
    return result
}

// Get all blood banks
export async function getAllBloodBanks() {
    const result = await sql`SELECT * FROM bloodbank.BloodBank ORDER BY bloodbank_id`
    console.log('getAllBloodBanks result:', result)
    return result
}

// Get all hospitals
export async function getAllHospitals() {
    const result = await sql`SELECT * FROM bloodbank.Hospital ORDER BY hospital_id`
    console.log('getAllHospitals result:', result)
    return result
}

// Hash password using bcrypt
async function hashPassword(password) {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
}

// Verify password using bcrypt with fallback to old crypto method for existing users
async function verifyPassword(password, hashed) {
    // Check if it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if (hashed.startsWith('$2')) {
        return await bcrypt.compare(password, hashed)
    }

    // Fallback to old crypto method for existing users
    const { scryptSync, randomBytes, timingSafeEqual } = await import('crypto')
    const [salt, key] = hashed.split(':')
    try {
        const hashBuffer = Buffer.from(key, 'base64')
        const testBuffer = scryptSync(password, salt, 32)
        if (timingSafeEqual(hashBuffer, testBuffer)) return true
    } catch { }
    try {
        const hashBuffer = Buffer.from(key, 'hex')
        const testBuffer = scryptSync(password, salt, 32)
        if (timingSafeEqual(hashBuffer, testBuffer)) return true
    } catch { }
    return false
}

export async function registerUserWithRole(email, password, role, details) {
    // Check if user already exists
    const existing = await sql`SELECT user_id FROM bloodbank.Users WHERE email = ${email}`
    if (existing.length > 0) {
        return { success: false, error: 'User already exists' }
    }
    const userCount = await sql`SELECT MAX(USER_ID) as count FROM bloodbank.Users`
    console.log('User count before insert:', userCount[0].count)
    console.log('registerUserWithRole called with:', { email, role, details })
    // Hash the password
    const hashedPassword = await hashPassword(password)
    console.log('Hashed password:', hashedPassword)
    //find count of users before insert

    //userCount[0].count this is string cast to integer 
    const userCountInt = parseInt(userCount[0].count, 10) + 1
    const user_id = userCountInt

    // Extract image_url from details if provided
    const image_url = details.image_url || null

    const userRes = await sql`
        INSERT INTO bloodbank.Users (user_id, email, password, role, image_url)
        VALUES (${user_id}, ${email}, ${hashedPassword}, ${role}, ${image_url})
        RETURNING user_id
    `

    if (!user_id) return { success: false, error: 'User creation failed' }
    console.log('User ID:', user_id)
    // Insert into role-specific table
    if (role.toUpperCase() === 'DONOR') {
        const DonorCount = await sql`SELECT Max(DONOR_ID) as count FROM bloodbank.Donors`
        const DonorCountInt = parseInt(DonorCount[0].count, 10) + 1
        const donor_id = DonorCountInt
        console.log('Donor ID:', donor_id)
        await sql`
            INSERT INTO bloodbank.Donors
            (donor_id,user_id, name, gender, blood_type, weight, location, contact_info, last_donation_date, birth_date)
            VALUES (
                ${donor_id},
                ${user_id},
                ${details.name || null},
                ${details.gender || null},
                ${details.blood_type || null},
                ${details.weight || null},
                ${details.location || null},
                ${details.contact_number || null},
                ${details.last_donation_date || null},
                ${details.birth_date || null}
            )
        `
    } else if (role.toUpperCase() === 'HOSPITAL') {
        const HospitalCount = await sql`SELECT Max(HOSPITAL_ID) as count FROM bloodbank.Hospital`
        const HospitalCountInt = parseInt(HospitalCount[0].count, 10) + 1
        const hospital_id = HospitalCountInt
        console.log('Hospital ID:', hospital_id)
        await sql`
            INSERT INTO bloodbank.Hospital
            (
            hospital_id,user_id, name, location, contact_info)
            VALUES (
                ${hospital_id},
                ${user_id},
                ${details.name || null},
                ${details.location || null},
                ${details.contact_number || null}
            )
        `
    } else if (role.toUpperCase() === 'BLOODBANK') {
        const BloodBankCount = await sql`SELECT Max(BLOODBANK_ID) as count FROM bloodbank.BloodBank`
        const BloodBankCountInt = parseInt(BloodBankCount[0].count, 10) + 1
        const bloodbank_id = BloodBankCountInt
        console.log('Blood Bank ID:', bloodbank_id)
        await sql`
            INSERT INTO bloodbank.BloodBank
            (bloodbank_id,user_id, name, location, contact_number)
            VALUES (
                ${bloodbank_id},
                ${user_id},
                ${details.name || null},
                ${details.location || null},
                ${details.contact_number || null}
            )
        `
    }
    console.log('Role-specific details inserted')
    return { success: true, user_id }
}

export async function findUserByEmail(email, password) {
    // First, get the user from Users table
    const userResult = await sql`
        SELECT user_id, email, password, role, image_url
        FROM bloodbank.Users
        WHERE email = ${email}
        LIMIT 1
    `

    if (userResult.length === 0) return null

    const user = userResult[0]
    console.log('User found:', user)

    // Verify password
    if (!(await verifyPassword(password, user.password))) {
        console.log('Invalid password for user:', email)
        return null
    }

    // Now get role-specific data based on user's role
    let roleSpecificData = {}

    if (user.role.toLowerCase() === 'hospital') {
        const hospitalResult = await sql`
            SELECT hospital_id FROM bloodbank.Hospital WHERE user_id = ${user.user_id}
        `
        if (hospitalResult[0]) roleSpecificData.hospital_id = hospitalResult[0].hospital_id
    }
    else if (user.role.toLowerCase() === 'bloodbank') {
        const bloodbankResult = await sql`
            SELECT bloodbank_id FROM bloodbank.BloodBank WHERE user_id = ${user.user_id}
        `
        if (bloodbankResult[0]) roleSpecificData.bloodbank_id = bloodbankResult[0].bloodbank_id
    }
    else if (user.role.toLowerCase() === 'donor') {
        const donorResult = await sql`
            SELECT donor_id FROM bloodbank.Donors WHERE user_id = ${user.user_id}
        `
        if (donorResult[0]) roleSpecificData.donor_id = donorResult[0].donor_id
    }

    // Return user without password hash
    const { password: _, ...userWithoutPassword } = user
    console.log('User authenticated successfully:', userWithoutPassword)

    return { ...userWithoutPassword, ...roleSpecificData }
}

export async function getCampsByDivision(division) {
    let query = `
        SELECT c.*, b.name as bloodbank_name
        FROM bloodbank.Camp c
        JOIN bloodbank.BloodBank b ON c.bloodbank_id = b.bloodbank_id
        WHERE 1=1
    `
    const params = []
    if (division) {
        query += ` AND c.location ILIKE '%' || $${params.length + 1} || '%'`
        params.push(division)
    }
    query += ` ORDER BY c.start_date DESC`
    const result = await sql.unsafe(query, params)

    // Format start_date and end_date to YYYY-MM-DD (date only)
    return result.map(camp => ({
        ...camp,
        start_date: camp.start_date ? camp.start_date.toISOString().slice(0, 10) : null,
        end_date: camp.end_date ? camp.end_date.toISOString().slice(0, 10) : null,
    }))
}

// Create a new camp for a blood bank
export async function createCamp(bloodbank_id, campData) {
    const { camp_name, location, start_date, end_date } = campData

    try {
        const result = await sql`
            INSERT INTO bloodbank.Camp (bloodbank_id, camp_name, location, start_date, end_date)
            VALUES (${bloodbank_id}, ${camp_name}, ${location}, ${start_date}, ${end_date})
            RETURNING camp_id, camp_name, location, start_date, end_date
        `

        if (result.length > 0) {
            const camp = result[0]
            return {
                success: true,
                camp: {
                    ...camp,
                    start_date: camp.start_date ? camp.start_date.toISOString().slice(0, 10) : null,
                    end_date: camp.end_date ? camp.end_date.toISOString().slice(0, 10) : null
                }
            }
        } else {
            return { success: false, error: 'Failed to create camp' }
        }
    } catch (error) {
        console.error('Error creating camp:', error)
        return { success: false, error: 'Database error while creating camp' }
    }
}

// Get camps for a specific blood bank
export async function getCampsForBloodBank(bloodbank_id) {
    try {
        const result = await sql`
            SELECT c.*, b.name as bloodbank_name
            FROM bloodbank.Camp c
            JOIN bloodbank.BloodBank b ON c.bloodbank_id = b.bloodbank_id
            WHERE c.bloodbank_id = ${bloodbank_id}
            ORDER BY c.start_date DESC
        `

        return result.map(camp => ({
            ...camp,
            start_date: camp.start_date ? camp.start_date.toISOString().slice(0, 10) : null,
            end_date: camp.end_date ? camp.end_date.toISOString().slice(0, 10) : null,
        }))
    } catch (error) {
        console.error('Error fetching camps for blood bank:', error)
        return []
    }
}

export async function registerDonorForCamp(donor_id, camp_id) {
    // Check if already registered
    const existing = await sql`
        SELECT registration_id FROM bloodbank.CampRegistration
        WHERE donor_id = ${donor_id} AND camp_id = ${camp_id}
    `
    if (existing.length > 0) {
        return { success: false, error: 'Already registered for this camp' }
    }
    // Register
    await sql`
        INSERT INTO bloodbank.CampRegistration (donor_id, camp_id)
        VALUES (${donor_id}, ${camp_id})
    `
    return { success: true }
}

export async function getRegisteredCampsForDonor(donor_id) {
    const result = await sql`
        SELECT c.*, b.name as bloodbank_name, r.registration_date, r.attended
        FROM bloodbank.CampRegistration r
        JOIN bloodbank.Camp c ON r.camp_id = c.camp_id
        JOIN bloodbank.BloodBank b ON c.bloodbank_id = b.bloodbank_id
        WHERE r.donor_id = ${donor_id}
        ORDER BY c.start_date DESC
    `
    return result.map(camp => ({
        ...camp,
        start_date: camp.start_date ? camp.start_date.toISOString().slice(0, 10) : null,
        end_date: camp.end_date ? camp.end_date.toISOString().slice(0, 10) : null,
        registration_date: camp.registration_date ? camp.registration_date.toISOString().slice(0, 10) : null,
    }))
}

export async function getRegistrationsForBloodBank(bloodbank_id) {
    const result = await sql`
        SELECT r.registration_id, r.donor_id, d.name as donor_name, d.blood_type, d.gender, d.contact_info,
               r.camp_id, c.camp_name, r.registration_date, r.attended
        FROM bloodbank.CampRegistration r
        JOIN bloodbank.Camp c ON r.camp_id = c.camp_id
        JOIN bloodbank.Donors d ON r.donor_id = d.donor_id
        WHERE c.bloodbank_id = ${bloodbank_id} and (d.last_donation_date IS NULL OR d.last_donation_date < NOW() - INTERVAL '3 months')
        ORDER BY r.registration_date DESC
    `
    return result.map(row => ({
        ...row,
        registration_date: row.registration_date ? row.registration_date.toISOString().slice(0, 10) : null,
    }))
}

export async function updateRegistrationAttendedStatus(registration_id, attended) {
    const result = await sql`
        UPDATE bloodbank.CampRegistration
        SET attended = ${attended}
        WHERE registration_id = ${registration_id}
        RETURNING registration_id
    `
    if (result.length > 0) {
        return { success: true }
    }
    return { success: false, error: 'Registration not found' }
}

export async function addDonationForRegistration({ donor_id, bloodbank_id, camp_id, blood_type, units }) {
    console.log('addDonationForRegistration called with:', { donor_id, bloodbank_id, camp_id, blood_type, units })

    // Check if a donation already exists for this registration
    const existing = await sql`
        SELECT donation_id FROM bloodbank.Donation
        WHERE donor_id = ${donor_id} AND camp_id = ${camp_id} AND bloodbank_id = ${bloodbank_id}
    `
    if (existing.length > 0) {
        return { success: false, error: 'Donation already added for this registration' }
    }

    // Insert into Donation table
    const donationResult = await sql`
        INSERT INTO bloodbank.Donation (donor_id, bloodbank_id, camp_id, blood_type, units)
        VALUES (${donor_id}, ${bloodbank_id}, ${camp_id}, ${blood_type}, ${units})
        RETURNING donation_id, donation_date
    `
    if (donationResult.length === 0) {
        return { success: false, error: 'Failed to add donation' }
    }
    const { donation_id, donation_date } = donationResult[0]
    const collectedDate = donation_date || new Date()
    const expiryDate = new Date(collectedDate)
    expiryDate.setDate(expiryDate.getDate() + 35)

    return { success: true, donation_id }
}

// Updated createBloodRequest function
export async function createBloodRequest({
    hospital_id,
    blood_type,
    units_requested,
    requested_to,
    priority = 'NORMAL',
    required_by = null,
    patient_condition = null,
    broadcast_to_multiple = false,
    broadcast_group_id = null
}) {
    const result = await sql`
        INSERT INTO bloodbank.bloodrequest (
            hospital_id, 
            blood_type, 
            units_requested, 
            requested_to, 
            priority, 
            required_by, 
            patient_condition, 
            broadcast_to_multiple,
            broadcast_group_id
        )
        VALUES (
            ${hospital_id}, 
            ${blood_type}, 
            ${units_requested}, 
            ${requested_to}, 
            ${priority}, 
            ${required_by}, 
            ${patient_condition}, 
            ${broadcast_to_multiple},
            ${broadcast_group_id}
        )
        RETURNING request_id, broadcast_group_id
    `

    if (result.length > 0) {
        return {
            success: true,
            request_id: result[0].request_id,
            broadcast_group_id: result[0].broadcast_group_id
        }
    }
    return { success: false, error: 'Failed to create blood request' }
}

export async function getBloodRequestsForBank(bloodbank_id) {
    const result = await sql`
        SELECT r.*, h.name as hospital_name
        FROM bloodbank.bloodrequest r
        JOIN bloodbank.Hospital h ON r.hospital_id = h.hospital_id
        WHERE r.requested_to = ${bloodbank_id}
        ORDER BY r.request_date DESC
    `
    return result.map(r => ({
        ...r,
        request_date: r.request_date ? r.request_date.toISOString().slice(0, 10) : null,
        required_by: r.required_by ? r.required_by.toISOString() : null,
    }))
}

export async function getAvailableBloodUnitsForBank(bloodbank_id) {
    const result = await sql`
        SELECT unit_id, blood_type, units, collected_date, expiry_date, status
        FROM bloodbank.BloodUnit
        WHERE bloodbank_id = ${bloodbank_id} AND status = 'AVAILABLE'
        ORDER BY blood_type, expiry_date
    `
    return result.map(u => ({
        ...u,
        collected_date: u.collected_date ? u.collected_date.toISOString().slice(0, 10) : null,
        expiry_date: u.expiry_date ? u.expiry_date.toISOString().slice(0, 10) : null,
    }))
}

export async function fulfillBloodRequest(request_id) {
    try {
        // Start a transaction to ensure all operations are atomic
        return await sql.begin(async (tx) => {
            // Get request details
            const req = await tx`
                SELECT * FROM bloodbank.bloodrequest WHERE request_id = ${request_id}
            `
            if (!req[0]) {
                throw new Error('Request not found')
            }

            const { blood_type, units_requested, requested_to, broadcast_group_id, broadcast_to_multiple } = req[0]

            // Check if this broadcast group is already fulfilled BEFORE consuming units
            if (broadcast_to_multiple && broadcast_group_id) {
                const groupStatus = await tx`
                    SELECT COUNT(CASE WHEN status = 'FULFILLED' THEN 1 END) as fulfilled_requests
                    FROM bloodbank.bloodrequest 
                    WHERE broadcast_group_id = ${broadcast_group_id}
                `

                if (groupStatus[0].fulfilled_requests > 0) {
                    throw new Error('This broadcast request has already been fulfilled by another blood bank')
                }
            }

            // Get available units (FIFO - oldest first) within the transaction
            const availableUnits = await tx`
                SELECT unit_id, collected_date, expiry_date 
                FROM bloodbank.BloodUnit 
                WHERE bloodbank_id = ${requested_to} 
                AND blood_type = ${blood_type} 
                AND status = 'AVAILABLE'
                ORDER BY expiry_date ASC, collected_date ASC
                LIMIT ${units_requested}
            `

            if (availableUnits.length < units_requested) {
                throw new Error(`Only ${availableUnits.length} units available, need ${units_requested}`)
            }

            const unitIds = availableUnits.map(u => u.unit_id)

            // Mark units as used within the transaction
            await tx`
                UPDATE bloodbank.BloodUnit 
                SET status = 'USED'
                WHERE unit_id = ANY(${unitIds})
            `

            // Update request as fulfilled
            await tx`
                UPDATE bloodbank.bloodrequest
                SET status = 'FULFILLED'
                WHERE request_id = ${request_id}
            `

            // If this is a broadcast request, reject all other requests in the group
            if (broadcast_to_multiple && broadcast_group_id) {
                await tx`
                    UPDATE bloodbank.bloodrequest
                    SET status = 'REJECTED'
                    WHERE broadcast_group_id = ${broadcast_group_id}
                    AND request_id != ${request_id}
                    AND status = 'PENDING'
                `
            }

            return {
                success: true,
                consumed_units: availableUnits,
                broadcast_cancelled: broadcast_to_multiple ? true : false
            }
        })
    } catch (err) {
        console.error('Fulfill blood request error:', err)
        return { success: false, error: err.message || 'Failed to fulfill request' }
    }
}



export async function getDonorById(donor_id) {
    const result = await sql`
        SELECT * FROM bloodbank.Donors WHERE donor_id = ${donor_id}
    `
    return result[0] || null
}

export async function addDirectDonation({ donor_id, bloodbank_id, blood_type, units, urgent_need_id = null }) {
    // Insert into Donation table (no camp_id)
    const donationResult = await sql`
        INSERT INTO bloodbank.Donation (donor_id, bloodbank_id, blood_type, units, urgent_need_id)
        VALUES (${donor_id}, ${bloodbank_id}, ${blood_type}, ${units}, ${urgent_need_id})
        RETURNING donation_id, donation_date
    `
    if (donationResult.length === 0) {
        return { success: false, error: 'Failed to add donation' }
    }
    const { donation_id, donation_date } = donationResult[0]
    const collectedDate = donation_date || new Date()
    const expiryDate = new Date(collectedDate)
    expiryDate.setDate(expiryDate.getDate() + 35)


    return { success: true, donation_id }
}

export async function getDonationHistoryForDonor(donor_id) {
    try {
        const result = await sql`
            SELECT 
                d.donation_id,
                d.blood_type,
                d.units,
                d.donation_date,
                bb.name as bloodbank_name,
                bb.location as bloodbank_location,
                bb.contact_number as bloodbank_phone,
                c.camp_name,
                c.location as camp_location
            FROM bloodbank.Donation d
            LEFT JOIN bloodbank.BloodBank bb ON d.bloodbank_id = bb.bloodbank_id
            LEFT JOIN bloodbank.Camp c ON d.camp_id = c.camp_id
            WHERE d.donor_id = ${donor_id}
            ORDER BY d.donation_date DESC
        `

        return result.map(d => ({
            ...d,
            donation_date: d.donation_date ? d.donation_date.toISOString().slice(0, 10) : null,
        }))
    } catch (err) {
        console.error('Get donation history error:', err)
        return []
    }
}

export async function getBloodRequestHistoryForHospital(hospital_id) {
    try {
        const result = await sql`
            SELECT 
                r.request_id,
                r.blood_type,
                r.units_requested,
                r.status,
                r.request_date,
                r.priority,
                r.required_by,
                r.patient_condition,
                r.broadcast_to_multiple,
                bb.name as bloodbank_name,
                bb.location as bloodbank_location,
                bb.contact_number as bloodbank_phone
            FROM bloodbank.bloodrequest r
            LEFT JOIN bloodbank.BloodBank bb ON r.requested_to = bb.bloodbank_id
            WHERE r.hospital_id = ${hospital_id}
            ORDER BY r.request_date DESC
        `

        return result.map(r => ({
            ...r,
            request_date: r.request_date ? r.request_date.toISOString().slice(0, 10) : null,
            required_by: r.required_by ? r.required_by.toISOString() : null,
        }))
    } catch (err) {
        console.error('Get blood request history error:', err)
        return []
    }
}

// Get urgent needs for a donor (by blood type)
export async function getUrgentNeedsForDonor(donor_id) {
    try {
        // Get the donor's blood type
        const donor = await sql`SELECT blood_type FROM bloodbank.Donors WHERE donor_id = ${donor_id}`

        if (!donor[0]) {
            return []
        }

        // Get urgent needs for this blood type
        const urgent = await sql`
            SELECT * FROM bloodbank.UrgentNeed 
            WHERE status = 'OPEN' AND blood_type = ${donor[0].blood_type}
            ORDER BY posted_date DESC
        `

        // For each urgent need, get blood bank info separately
        const urgentWithBankInfo = await Promise.all(
            urgent.map(async (need) => {
                try {
                    const bankInfo = await sql`
                        SELECT name, contact_number as contact_info 
                        FROM bloodbank.BloodBank 
                        WHERE bloodbank_id = ${need.bloodbank_id}
                    `
                    return {
                        ...need,
                        bloodbank_name: bankInfo[0]?.name || null,
                        bloodbank_contact: bankInfo[0]?.contact_info || null
                    }
                } catch (err) {
                    // If bank info fails, still return the urgent need without bank details
                    return {
                        ...need,
                        bloodbank_name: null,
                        bloodbank_contact: null
                    }
                }
            })
        )

        return urgentWithBankInfo

    } catch (error) {
        console.error('Error in getUrgentNeedsForDonor:', error)
        throw error
    }
}

// Get urgent needs for a blood bank
export async function getUrgentNeedsForBank(bloodbank_id) {
    const urgent = await sql`
        SELECT * FROM bloodbank.UrgentNeed
        WHERE status = 'OPEN' AND bloodbank_id = ${bloodbank_id}
        ORDER BY posted_date DESC
    `
    return urgent
}

export async function getDonorsByBloodType(blood_type) {
    const result = await sql`
        SELECT * FROM bloodbank.Donors WHERE blood_type = ${blood_type} and (last_donation_date IS NULL OR last_donation_date < NOW() - INTERVAL '3 months')
    `
    return result
}

export async function fulfillUrgentNeed({ urgent_need_id, donor_id, bloodbank_id, units }) {
    // Get urgent need details
    const urgent = await sql`SELECT * FROM bloodbank.UrgentNeed WHERE urgent_need_id = ${urgent_need_id} AND status = 'OPEN'`
    if (!urgent[0]) return { success: false, error: 'Urgent need not found or already fulfilled' }
    const blood_type = urgent[0].blood_type

    // Add donation, pass urgent_need_id
    const donationResult = await addDirectDonation({ donor_id, bloodbank_id, blood_type, units, urgent_need_id })
    if (!donationResult.success) return { success: false, error: 'Failed to add donation' }

    // Mark urgent need as fulfilled
    await sql`
        UPDATE bloodbank.UrgentNeed
        SET status = 'FULFILLED'
        WHERE urgent_need_id = ${urgent_need_id}
    `
    return { success: true }
}

export async function getLatestUnseenNotifications(user_id) {
    const result = await sql`
        SELECT notification_id, description, time
        FROM bloodbank.notification
        WHERE user_id = ${user_id} AND seen = 'N'
        ORDER BY time DESC
        LIMIT 10
    `
    return result
}

export async function markNotificationAsSeen(notification_id) {
    await sql`
        UPDATE bloodbank.notification
        SET seen = 'Y'
        WHERE notification_id = ${notification_id}
    `
    return true
}

export async function getHospitalById(hospital_id) {
    const result = await sql`
        SELECT * FROM bloodbank.Hospital WHERE hospital_id = ${hospital_id}
    `
    return result[0] || null
}

export async function getBloodBankById(bloodbank_id) {
    const result = await sql`
        SELECT * FROM bloodbank.BloodBank WHERE bloodbank_id = ${bloodbank_id}
    `
    return result[0] || null
}

export async function updateDonorProfile(donor_id, { location, weight, contact_info }) {
    try {
        await sql`
            UPDATE bloodbank.Donors 
            SET location = ${location}, weight = ${weight}, contact_info = ${contact_info}
            WHERE donor_id = ${donor_id}
        `
        return { success: true }
    } catch (err) {
        return { success: false, error: 'Failed to update donor profile' }
    }
}

export async function updateHospitalProfile(hospital_id, { location, contact_info }) {
    try {
        await sql`
            UPDATE bloodbank.Hospital 
            SET location = ${location}, contact_info = ${contact_info}
            WHERE hospital_id = ${hospital_id}
        `
        return { success: true }
    } catch (err) {
        return { success: false, error: 'Failed to update hospital profile' }
    }
}

export async function updateBloodBankProfile(bloodbank_id, { location, contact_number }) {
    try {
        await sql`
            UPDATE bloodbank.BloodBank 
            SET location = ${location}, contact_number = ${contact_number}
            WHERE bloodbank_id = ${bloodbank_id}
        `
        return { success: true }
    } catch (err) {
        return { success: false, error: 'Failed to update blood bank profile' }
    }
}

// Get system statistics
export async function getSystemStats() {
    try {
        // Get total donations count
        const donationsResult = await sql`
            SELECT COUNT(*) as total_donations FROM bloodbank.donation
        `

        // Get active donors count
        const donorsResult = await sql`
            SELECT COUNT(*) as active_donors FROM bloodbank.donors
        `

        // Get total hospitals count
        const hospitalsResult = await sql`
            SELECT COUNT(*) as total_hospitals FROM bloodbank.hospital
        `

        // Get blood banks count
        const bloodBanksResult = await sql`
            SELECT COUNT(*) as total_blood_banks FROM bloodbank.bloodbank
        `

        // Get total available blood units (not expired)
        const bloodUnitsResult = await sql`
            SELECT COUNT(*) as total_units FROM bloodbank.bloodunit 
            WHERE status = 'AVAILABLE' AND expiry_date > CURRENT_DATE
        `

        // Get total camps count
        const campsResult = await sql`
            SELECT COUNT(*) as total_camps FROM bloodbank.camp
        `

        const stats = {
            totalDonations: parseInt(donationsResult[0].total_donations) || 0,
            activeDonors: parseInt(donorsResult[0].active_donors) || 0,
            totalHospitals: parseInt(hospitalsResult[0].total_hospitals) || 0,
            totalBloodBanks: parseInt(bloodBanksResult[0].total_blood_banks) || 0,
            availableUnits: parseInt(bloodUnitsResult[0].total_units) || 0,
            totalCamps: parseInt(campsResult[0].total_camps) || 0
        }

        console.log('System stats from service:', stats)
        return stats
    } catch (error) {
        console.error('Error fetching system statistics in service:', error)
        throw error
    }
}

// Get donor leaderboard with rankings and badges
export async function getDonorLeaderboard() {
    try {
        const result = await sql`
            SELECT 
                d.donor_id,
                d.name,
                u.image_url,
                COUNT(don.donation_id) as total_donations,
                RANK() OVER (ORDER BY COUNT(don.donation_id) DESC) as rank
            FROM bloodbank.donors d
            INNER JOIN bloodbank.users u ON d.user_id = u.user_id
            LEFT JOIN bloodbank.donation don ON d.donor_id = don.donor_id
            GROUP BY d.donor_id, d.name, u.image_url
            ORDER BY total_donations DESC, d.name ASC
        `

        // Add badges based on donation count
        const leaderboard = result.map(donor => {
            let badge = null
            let badgeColor = null

            if (donor.total_donations >= 5) {
                badge = '🥇'
                badgeColor = 'golden'
            } else if (donor.total_donations >= 3) {
                badge = '🥈'
                badgeColor = 'silver'
            } else if (donor.total_donations >= 1) {
                badge = '🥉'
                badgeColor = 'bronze'
            }

            return {
                ...donor,
                total_donations: parseInt(donor.total_donations),
                rank: parseInt(donor.rank),
                badge,
                badgeColor
            }
        })

        console.log('Donor leaderboard:', leaderboard)
        return leaderboard
    } catch (error) {
        console.error('Error fetching donor leaderboard:', error)
        throw error
    }
}

// Get hospital analytics for dashboard
export async function getHospitalAnalytics(hospital_id) {
    try {
        // Blood request success rates
        const successRateResult = await sql`
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'FULFILLED' THEN 1 END) as fulfilled_requests,
                COUNT(CASE WHEN priority = 'EMERGENCY' THEN 1 END) as emergency_requests,
                COUNT(CASE WHEN status = 'FULFILLED' AND priority = 'EMERGENCY' THEN 1 END) as emergency_fulfilled
            FROM bloodbank.bloodrequest 
            WHERE hospital_id = ${hospital_id}
        `

        const stats = successRateResult[0]
        const totalRequests = parseInt(stats.total_requests) || 0
        const fulfilledRequests = parseInt(stats.fulfilled_requests) || 0
        const emergencyRequests = parseInt(stats.emergency_requests) || 0
        const emergencyFulfilled = parseInt(stats.emergency_fulfilled) || 0

        const successRate = totalRequests > 0 ? (fulfilledRequests / totalRequests * 100).toFixed(1) : 0
        const emergencySuccessRate = emergencyRequests > 0 ? (emergencyFulfilled / emergencyRequests * 100).toFixed(1) : 0

        // Monthly usage statistics (last 12 months)
        const monthlyStatsResult = await sql`
            SELECT 
                DATE_TRUNC('month', request_date) as month,
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'FULFILLED' THEN 1 END) as fulfilled_requests,
                SUM(units_requested) as total_units_requested,
                SUM(CASE WHEN status = 'FULFILLED' THEN units_requested ELSE 0 END) as total_units_received
            FROM bloodbank.bloodrequest 
            WHERE hospital_id = ${hospital_id} 
                AND request_date >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', request_date)
            ORDER BY month DESC
        `

        // Blood type demand patterns
        const demandPatternsResult = await sql`
            SELECT 
                blood_type,
                COUNT(*) as request_count,
                SUM(units_requested) as total_units_requested,
                COUNT(CASE WHEN status = 'FULFILLED' THEN 1 END) as fulfilled_count,
                SUM(CASE WHEN status = 'FULFILLED' THEN units_requested ELSE 0 END) as fulfilled_units
            FROM bloodbank.bloodrequest 
            WHERE hospital_id = ${hospital_id}
                AND request_date >= CURRENT_DATE - INTERVAL '6 months'
            GROUP BY blood_type
            ORDER BY total_units_requested DESC
        `

        // Emergency request tracking (last 30 days)
        const emergencyTrackingResult = await sql`
            SELECT 
                request_id,
                blood_type,
                units_requested,
                priority,
                status,
                request_date,
                required_by,
                patient_condition
            FROM bloodbank.bloodrequest 
            WHERE hospital_id = ${hospital_id} 
                AND priority = 'EMERGENCY'
                AND request_date >= CURRENT_DATE - INTERVAL '30 days'
            ORDER BY request_date DESC
            LIMIT 10
        `

        // Yearly comparison
        const currentYear = new Date().getFullYear()
        const yearlyComparisonResult = await sql`
            SELECT 
                EXTRACT(YEAR FROM request_date) as year,
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'FULFILLED' THEN 1 END) as fulfilled_requests,
                SUM(units_requested) as total_units_requested
            FROM bloodbank.bloodrequest 
            WHERE hospital_id = ${hospital_id}
                AND EXTRACT(YEAR FROM request_date) IN (${currentYear}, ${currentYear - 1})
            GROUP BY EXTRACT(YEAR FROM request_date)
            ORDER BY year DESC
        `

        return {
            successRates: {
                overall: parseFloat(successRate),
                emergency: parseFloat(emergencySuccessRate),
                totalRequests,
                fulfilledRequests,
                emergencyRequests,
                emergencyFulfilled
            },
            monthlyStats: monthlyStatsResult.map(stat => ({
                month: stat.month,
                totalRequests: parseInt(stat.total_requests),
                fulfilledRequests: parseInt(stat.fulfilled_requests),
                totalUnitsRequested: parseInt(stat.total_units_requested) || 0,
                totalUnitsReceived: parseInt(stat.total_units_received) || 0,
                successRate: stat.total_requests > 0 ?
                    (stat.fulfilled_requests / stat.total_requests * 100).toFixed(1) : 0
            })),
            demandPatterns: demandPatternsResult.map(pattern => ({
                bloodType: pattern.blood_type,
                requestCount: parseInt(pattern.request_count),
                totalUnitsRequested: parseInt(pattern.total_units_requested) || 0,
                fulfilledCount: parseInt(pattern.fulfilled_count),
                fulfilledUnits: parseInt(pattern.fulfilled_units) || 0,
                fulfillmentRate: pattern.request_count > 0 ?
                    (pattern.fulfilled_count / pattern.request_count * 100).toFixed(1) : 0
            })),
            emergencyTracking: emergencyTrackingResult.map(emergency => ({
                ...emergency,
                request_date: emergency.request_date ? emergency.request_date.toISOString().slice(0, 10) : null,
                required_by: emergency.required_by ? emergency.required_by.toISOString() : null
            })),
            yearlyComparison: yearlyComparisonResult.map(year => ({
                year: parseInt(year.year),
                totalRequests: parseInt(year.total_requests),
                fulfilledRequests: parseInt(year.fulfilled_requests),
                totalUnitsRequested: parseInt(year.total_units_requested) || 0,
                successRate: year.total_requests > 0 ?
                    (year.fulfilled_requests / year.total_requests * 100).toFixed(1) : 0
            }))
        }
    } catch (error) {
        console.error('Error fetching hospital analytics:', error)
        throw error
    }
}

// Get hospital dashboard recommendations
export async function getHospitalRecommendations(hospital_id) {
    try {
        const recommendations = []

        // Check for low success rate blood types
        const lowSuccessRateResult = await sql`
            SELECT 
                blood_type,
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'FULFILLED' THEN 1 END) as fulfilled_requests
            FROM bloodbank.bloodrequest 
            WHERE hospital_id = ${hospital_id}
                AND request_date >= CURRENT_DATE - INTERVAL '3 months'
            GROUP BY blood_type
            HAVING COUNT(*) >= 3 AND 
                   (COUNT(CASE WHEN status = 'FULFILLED' THEN 1 END)::float / COUNT(*)::float) < 0.7
        `

        lowSuccessRateResult.forEach(result => {
            const successRate = (result.fulfilled_requests / result.total_requests * 100).toFixed(1)
            recommendations.push({
                type: 'warning',
                title: `Low Success Rate for ${result.blood_type}`,
                description: `Only ${successRate}% of ${result.blood_type} requests were fulfilled in the last 3 months. Consider reaching out to multiple blood banks.`,
                actionable: true
            })
        })

        // Check for frequently requested blood types
        const frequentRequestsResult = await sql`
            SELECT 
                blood_type,
                COUNT(*) as request_count
            FROM bloodbank.bloodrequest 
            WHERE hospital_id = ${hospital_id}
                AND request_date >= CURRENT_DATE - INTERVAL '1 month'
            GROUP BY blood_type
            ORDER BY request_count DESC
            LIMIT 1
        `

        if (frequentRequestsResult.length > 0) {
            const mostRequested = frequentRequestsResult[0]
            recommendations.push({
                type: 'info',
                title: `Most Requested: ${mostRequested.blood_type}`,
                description: `${mostRequested.blood_type} has been your most requested blood type this month (${mostRequested.request_count} requests). Consider establishing partnerships with blood banks that have good ${mostRequested.blood_type} availability.`,
                actionable: true
            })
        }

        // Check emergency response time
        const emergencyResponseResult = await sql`
            SELECT 
                COUNT(*) as emergency_count,
                COUNT(CASE WHEN status = 'FULFILLED' THEN 1 END) as emergency_fulfilled
            FROM bloodbank.bloodrequest 
            WHERE hospital_id = ${hospital_id}
                AND priority = 'EMERGENCY'
                AND request_date >= CURRENT_DATE - INTERVAL '1 month'
        `

        if (emergencyResponseResult[0] && emergencyResponseResult[0].emergency_count > 0) {
            const emergencyData = emergencyResponseResult[0]
            const emergencyRate = (emergencyData.emergency_fulfilled / emergencyData.emergency_count * 100).toFixed(1)

            if (emergencyRate < 90) {
                recommendations.push({
                    type: 'urgent',
                    title: 'Emergency Request Success Rate Needs Improvement',
                    description: `Your emergency request fulfillment rate is ${emergencyRate}%. Consider setting up emergency blood bank partnerships or maintaining emergency inventory agreements.`,
                    actionable: true
                })
            } else {
                recommendations.push({
                    type: 'success',
                    title: 'Excellent Emergency Response',
                    description: `Your emergency request fulfillment rate is ${emergencyRate}%. Keep up the excellent emergency preparedness!`,
                    actionable: false
                })
            }
        }

        return recommendations
    } catch (error) {
        console.error('Error fetching hospital recommendations:', error)
        return []
    }
}

// Get blood bank analytics for dashboard
export async function getBloodBankAnalytics(bloodbank_id) {
    try {
        // Inventory Statistics
        const inventoryStats = await sql`
            SELECT 
                COUNT(*) as total_units,
                COUNT(CASE WHEN status = 'AVAILABLE' THEN 1 END) as available_units,
                COUNT(CASE WHEN status = 'USED' THEN 1 END) as used_units,
                COUNT(CASE WHEN status = 'EXPIRED' THEN 1 END) as expired_units
            FROM bloodbank.bloodunit 
            WHERE bloodbank_id = ${bloodbank_id}
        `

        // Blood Type Distribution
        const bloodTypeDistribution = await sql`
            SELECT 
                blood_type,
                SUM(units) as units
            FROM bloodbank.bloodunit 
            WHERE bloodbank_id = ${bloodbank_id} AND status = 'AVAILABLE'
            GROUP BY blood_type
            ORDER BY units DESC
        `

        // Fulfillment Statistics
        const fulfillmentStats = await sql`
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'FULFILLED' THEN 1 END) as fulfilled_requests,
                COUNT(CASE WHEN priority = 'EMERGENCY' THEN 1 END) as emergency_requests,
                COUNT(CASE WHEN status = 'FULFILLED' AND priority = 'EMERGENCY' THEN 1 END) as emergency_fulfilled
            FROM bloodbank.bloodrequest 
            WHERE requested_to = ${bloodbank_id}
        `

        // Monthly Request Trends (last 6 months)
        const requestTrends = await sql`
            SELECT 
                DATE_TRUNC('month', request_date) as month,
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'FULFILLED' THEN 1 END) as fulfilled_requests,
                COUNT(CASE WHEN priority = 'EMERGENCY' THEN 1 END) as emergency_requests
            FROM bloodbank.bloodrequest 
            WHERE requested_to = ${bloodbank_id}
                AND request_date >= CURRENT_DATE - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', request_date)
            ORDER BY month DESC
        `

        // Donation Sources
        const donationSources = await sql`
            SELECT 
                CASE 
                    WHEN camp_id IS NOT NULL THEN 'Camp Donations'
                    ELSE 'Direct Donations'
                END as source,
                COUNT(*) as donations,
                SUM(units) as units
            FROM bloodbank.donation 
            WHERE bloodbank_id = ${bloodbank_id}
                AND donation_date >= CURRENT_DATE - INTERVAL '6 months'
            GROUP BY CASE 
                WHEN camp_id IS NOT NULL THEN 'Camp Donations'
                ELSE 'Direct Donations'
            END
        `

        // Donor Statistics
        const donorStats = await sql`
            SELECT 
                COUNT(DISTINCT d.donor_id) as active_donors,
                COUNT(CASE WHEN don.donation_date >= CURRENT_DATE - INTERVAL '1 month' THEN 1 END) as donations_this_month
            FROM bloodbank.donors d
            LEFT JOIN bloodbank.donation don ON d.donor_id = don.donor_id 
                AND don.bloodbank_id = ${bloodbank_id}
        `

        // Expiry Tracking
        const expiryTracking = await sql`
            SELECT 
                COUNT(CASE WHEN expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as next_7_days,
                COUNT(CASE WHEN expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '14 days' THEN 1 END) as next_14_days,
                COUNT(CASE WHEN expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days' THEN 1 END) as next_30_days
            FROM bloodbank.bloodunit 
            WHERE bloodbank_id = ${bloodbank_id} 
                AND status = 'AVAILABLE'
                AND expiry_date > CURRENT_DATE
        `

        // Top Requesting Hospitals
        const topHospitals = await sql`
            SELECT 
                h.hospital_id,
                h.name,
                h.location,
                COUNT(r.request_id) as total_requests,
                COUNT(CASE WHEN r.status = 'FULFILLED' THEN 1 END) as fulfilled_requests
            FROM bloodbank.hospital h
            JOIN bloodbank.bloodrequest r ON h.hospital_id = r.hospital_id
            WHERE r.requested_to = ${bloodbank_id}
                AND r.request_date >= CURRENT_DATE - INTERVAL '6 months'
            GROUP BY h.hospital_id, h.name, h.location
            ORDER BY total_requests DESC
            LIMIT 5
        `

        // Recent Activity
        const recentActivity = await sql`
            SELECT 
                'request' as type,
                r.request_date as date,
                'Blood request from ' || h.name || ' for ' || r.units_requested || ' units of ' || r.blood_type as description,
                r.status
            FROM bloodbank.bloodrequest r
            JOIN bloodbank.hospital h ON r.hospital_id = h.hospital_id
            WHERE r.requested_to = ${bloodbank_id}
                AND r.request_date >= CURRENT_DATE - INTERVAL '30 days'
            
            UNION ALL
            
            SELECT 
                'donation' as type,
                d.donation_date as date,
                'Donation of ' || d.units || ' units of ' || d.blood_type || ' received' as description,
                'completed' as status
            FROM bloodbank.donation d
            WHERE d.bloodbank_id = ${bloodbank_id}
                AND d.donation_date >= CURRENT_DATE - INTERVAL '30 days'
            
            ORDER BY date DESC
            LIMIT 10
        `

        // Blood Type Coverage - Percentage of blood types that have available stock
        const bloodTypeCoverageQuery = await sql`
            SELECT 
                COUNT(DISTINCT blood_type) as types_in_stock
            FROM bloodbank.bloodunit 
            WHERE bloodbank_id = ${bloodbank_id} 
                AND status = 'AVAILABLE' 
                AND units > 0
        `

        const totalBloodTypes = 8 // A+, A-, B+, B-, AB+, AB-, O+, O-
        const typesInStock = parseInt(bloodTypeCoverageQuery[0].types_in_stock) || 0
        const bloodTypeCoverage = ((typesInStock / totalBloodTypes) * 100).toFixed(1)

        // Calculate performance metrics
        const fulfillmentRate = fulfillmentStats[0].total_requests > 0
            ? (fulfillmentStats[0].fulfilled_requests / fulfillmentStats[0].total_requests * 100).toFixed(1)
            : 0

        const emergencyResponseRate = fulfillmentStats[0].emergency_requests > 0
            ? (fulfillmentStats[0].emergency_fulfilled / fulfillmentStats[0].emergency_requests * 100).toFixed(1)
            : 0

        const performanceMetrics = [
            { name: 'Fulfillment Rate', value: parseFloat(fulfillmentRate), fill: '#10B981' },
            { name: 'Emergency Response', value: parseFloat(emergencyResponseRate), fill: '#EF4444' },
            { name: 'Blood Type Coverage', value: parseFloat(bloodTypeCoverage), fill: '#3B82F6' },
        ]

        return {
            inventory: {
                totalUnits: parseInt(inventoryStats[0].total_units) || 0,
                availableUnits: parseInt(inventoryStats[0].available_units) || 0,
                usedUnits: parseInt(inventoryStats[0].used_units) || 0,
                expiredUnits: parseInt(inventoryStats[0].expired_units) || 0,
                byBloodType: bloodTypeDistribution.map(bt => ({
                    bloodType: bt.blood_type,
                    units: parseInt(bt.units) || 0
                }))
            },
            fulfillment: {
                total: parseInt(fulfillmentStats[0].total_requests) || 0,
                fulfilled: parseInt(fulfillmentStats[0].fulfilled_requests) || 0,
                rate: fulfillmentRate
            },
            emergency: {
                count: parseInt(fulfillmentStats[0].emergency_requests) || 0,
                fulfilled: parseInt(fulfillmentStats[0].emergency_fulfilled) || 0,
                responseRate: emergencyResponseRate
            },
            donors: {
                active: parseInt(donorStats[0].active_donors) || 0,
                thisMonth: parseInt(donorStats[0].donations_this_month) || 0
            },
            requestTrends: requestTrends.map(trend => ({
                month: trend.month ? trend.month.toISOString().slice(0, 7) : '',
                totalRequests: parseInt(trend.total_requests) || 0,
                fulfilledRequests: parseInt(trend.fulfilled_requests) || 0,
                emergencyRequests: parseInt(trend.emergency_requests) || 0
            })),
            donationSources: donationSources.map(source => ({
                source: source.source,
                donations: parseInt(source.donations) || 0,
                units: parseInt(source.units) || 0
            })),
            expiry: {
                next7Days: parseInt(expiryTracking[0].next_7_days) || 0,
                next14Days: parseInt(expiryTracking[0].next_14_days) || 0,
                next30Days: parseInt(expiryTracking[0].next_30_days) || 0
            },
            topHospitals: topHospitals.map(hospital => ({
                hospital_id: hospital.hospital_id,
                name: hospital.name,
                location: hospital.location,
                totalRequests: parseInt(hospital.total_requests) || 0,
                fulfilledRequests: parseInt(hospital.fulfilled_requests) || 0
            })),
            performanceMetrics,
            recentActivity: recentActivity.map(activity => ({
                type: activity.type,
                date: activity.date ? activity.date.toISOString().slice(0, 10) : '',
                description: activity.description,
                status: activity.status
            }))
        }

    } catch (error) {
        console.error('Error fetching blood bank analytics:', error)
        throw error
    }
}




