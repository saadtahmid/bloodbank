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
