import sql from '../db.js'

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

export async function findUserByEmailAndRole(email, password, role) {
    const result = await sql`
        SELECT user_id, email, role
        FROM bloodbank.Users
        WHERE email = ${email} AND password = ${password} AND role = ${role}
        LIMIT 1
    `
    console.log('findUserByEmailAndRole result:', result)
    return result[0] || null
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

export async function registerUserWithRole(email, password, role, details) {
    // Check if user already exists
    const existing = await sql`SELECT user_id FROM bloodbank.Users WHERE email = ${email}`
    if (existing.length > 0) {
        return { success: false, error: 'User already exists' }
    }

    // Insert into Users table
    const userRes = await sql`
        INSERT INTO bloodbank.Users (email, password, role)
        VALUES (${email}, ${password}, ${role})
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
