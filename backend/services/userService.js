import sql from '../db.js'
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'

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

function hashPassword(password) {
    const salt = randomBytes(8).toString('hex')
    const hash = scryptSync(password, salt, 32).toString("base64")
    return `${salt}:${hash}`
}

function verifyPassword(password, hashed) {
    const [salt, key] = hashed.split(':')
    const hashBuffer = Buffer.from(key, 'hex')
    const testBuffer = scryptSync(password, salt, 32)
    return timingSafeEqual(hashBuffer, testBuffer)
}

export async function registerUserWithRole(email, password, role, details) {
    // Check if user already exists
    const existing = await sql`SELECT user_id FROM bloodbank.Users WHERE email = ${email}`
    if (existing.length > 0) {
        return { success: false, error: 'User already exists' }
    }

    // Hash the password
    const hashedPassword = hashPassword(password)

    // Insert into Users table
    const userRes = await sql`
        INSERT INTO bloodbank.Users (email, password, role)
        VALUES (${email}, ${hashedPassword}, ${role})
        RETURNING user_id
    `
    const user_id = userRes[0]?.user_id
    if (!user_id) return { success: false, error: 'User creation failed' }

    // Insert into role-specific table
    if (role.toUpperCase() === 'DONOR') {
        await sql`
            INSERT INTO bloodbank.Donors
            (user_id, name, gender, blood_type, weight, location, contact_info, last_donation_date, birth_date)
            VALUES (
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
        await sql`
            INSERT INTO bloodbank.Hospital
            (user_id, name, location, contact_info)
            VALUES (
                ${user_id},
                ${details.name || null},
                ${details.location || null},
                ${details.contact_number || null}
            )
        `
    } else if (role.toUpperCase() === 'BLOODBANK') {
        await sql`
            INSERT INTO bloodbank.BloodBank
            (user_id, name, location, contact_number)
            VALUES (
                ${user_id},
                ${details.name || null},
                ${details.location || null},
                ${details.contact_number || null}
            )
        `
    }
    return { success: true, user_id }
}

export async function findUserByEmailAndRole(email, password, role) {
    let result
    if (role.toLowerCase() === 'hospital') {
        result = await sql`
            SELECT u.user_id, u.email, u.password, u.role, h.hospital_id
            FROM bloodbank.Users u
            LEFT JOIN bloodbank.Hospital h ON u.user_id = h.user_id
            WHERE u.email = ${email} AND u.role = ${role}
            LIMIT 1
        `
    }
    else if (role.toLowerCase() === 'bloodbank') {
        result = await sql`
            SELECT u.user_id, u.email, u.password, u.role, b.bloodbank_id
            FROM bloodbank.Users u
            LEFT JOIN bloodbank.BloodBank b ON u.user_id = b.user_id
            WHERE u.email = ${email} AND u.role = ${role}
            LIMIT 1 `
    }
    else if (role.toLowerCase() === 'donor') {
        result = await sql`
            SELECT u.user_id, u.email, u.password, u.role, d.donor_id
            FROM bloodbank.Users u
            LEFT JOIN bloodbank.Donors d ON u.user_id = d.user_id
            WHERE u.email = ${email} AND u.role = ${role}
            LIMIT 1
        `
    } else {
        result = await sql`
            SELECT user_id, email, password, role
            FROM bloodbank.Users
            WHERE email = ${email} AND role = ${role}
            LIMIT 1
        `
    }
    if (result.length === 0) return null
    const user = result[0]
    if (verifyPassword(password, user.password)) {
        // Do not return password hash
        const { password, ...userWithoutPassword } = user
        return userWithoutPassword
    }
    return null
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
    const result = await sql`
        INSERT INTO bloodbank.Donation (donor_id, bloodbank_id, camp_id, blood_type, units)
        VALUES (${donor_id}, ${bloodbank_id}, ${camp_id}, ${blood_type}, ${units})
        RETURNING donation_id
    `
    console.log('SQL insert result:', result)
    if (result.length > 0) {
        return { success: true, donation_id: result[0].donation_id }
    }
    return { success: false, error: 'Failed to add donation' }
}




