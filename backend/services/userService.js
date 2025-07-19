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







    const userRes = await sql`
        INSERT INTO bloodbank.Users (user_id,email, password, role)
        VALUES (${user_id},${email}, ${hashedPassword}, ${role})
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
        SELECT user_id, email, password, role
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
        WHERE c.bloodbank_id = ${bloodbank_id}
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

export async function createBloodRequest({ hospital_id, blood_type, units_requested, requested_to }) {
    const result = await sql`
        INSERT INTO bloodbank.BloodRequest (hospital_id, blood_type, units_requested, requested_to)
        VALUES (${hospital_id}, ${blood_type}, ${units_requested}, ${requested_to})
        RETURNING request_id
    `
    if (result.length > 0) {
        return { success: true, request_id: result[0].request_id }
    }
    return { success: false, error: 'Failed to create blood request' }
}

export async function getBloodRequestsForBank(bloodbank_id) {
    const result = await sql`
        SELECT r.*, h.name as hospital_name
        FROM bloodbank.BloodRequest r
        JOIN bloodbank.Hospital h ON r.hospital_id = h.hospital_id
        WHERE r.requested_to = ${bloodbank_id}
        ORDER BY r.request_date DESC
    `
    return result.map(r => ({
        ...r,
        request_date: r.request_date ? r.request_date.toISOString().slice(0, 10) : null,
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
        // Get request details
        const req = await sql`
            SELECT * FROM bloodbank.BloodRequest WHERE request_id = ${request_id}
        `
        if (!req[0]) return { success: false, error: 'Request not found' }

        const { blood_type, units_requested, requested_to } = req[0]

        // Use consistent fulfillment service
        const consumption = await FulfillmentService.consumeUnits(
            requested_to,
            blood_type,
            units_requested,
            request_id
        )

        if (!consumption.success) {
            return { success: false, error: consumption.error }
        }

        // Update request status
        await sql`
            UPDATE bloodbank.BloodRequest
            SET status = 'FULFILLED'
            WHERE request_id = ${request_id}
        `

        return { success: true, consumed_units: consumption.consumed_units }
    } catch (err) {
        console.error('Fulfill blood request error:', err)
        return { success: false, error: 'Failed to fulfill request' }
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
                bb.name as bloodbank_name,
                bb.location as bloodbank_location,
                bb.contact_number as bloodbank_phone
            FROM bloodbank.BloodRequest r
            LEFT JOIN bloodbank.BloodBank bb ON r.requested_to = bb.bloodbank_id
            WHERE r.hospital_id = ${hospital_id}
            ORDER BY r.request_date DESC
        `
        
        return result.map(r => ({
            ...r,
            request_date: r.request_date ? r.request_date.toISOString().slice(0, 10) : null,
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
        SELECT * FROM bloodbank.Donors WHERE blood_type = ${blood_type}
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




