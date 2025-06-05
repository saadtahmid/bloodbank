import sql from '../db.js'

// Get all unique divisions
export async function getDivisions() {
    const result = await sql`SELECT DISTINCT division FROM bloodbank.Location ORDER BY division`
    return result.map(r => r.division)
}

// Get all unique districts for a division
export async function getDistricts(division) {
    const result = await sql`SELECT DISTINCT district FROM bloodbank.Location WHERE division = ${division} ORDER BY district`
    return result.map(r => r.district)
}

// Get all unique cities for a district
export async function getCities(district) {
    const result = await sql`SELECT DISTINCT city FROM bloodbank.Location WHERE district = ${district} ORDER BY city`
    return result.map(r => r.city)
}

// Search blood banks by division, district, and city using LIKE on location
export async function searchBloodBanks(division, district, city) {
    let query = `
        SELECT bloodbank_id, name, location, contact_number
        FROM bloodbank.BloodBank
        WHERE 1=1
    `
    const params = []
    if (division) {
        query += ` AND location ILIKE '%' || $${params.length + 1} || '%'`
        params.push(division)
    }
    if (district) {
        query += ` AND location ILIKE '%' || $${params.length + 1} || '%'`
        params.push(district)
    }
    if (city) {
        query += ` AND location ILIKE '%' || $${params.length + 1} || '%'`
        params.push(city)
    }
    query += ' ORDER BY name'
    const result = await sql.unsafe(query, params)
    return result
}
