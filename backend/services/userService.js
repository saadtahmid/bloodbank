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
