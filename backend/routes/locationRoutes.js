import { Router } from 'express'
import { getDivisions, getDistricts, getCities, searchBloodBanks } from '../services/locationService.js'

const router = Router()

router.get('/divisions', async (req, res) => {
    try {
        const divisions = await getDivisions()
        res.json(divisions)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch divisions' })
    }
})

router.get('/districts', async (req, res) => {
    const { division } = req.query
    if (!division) return res.status(400).json({ error: 'division required' })
    try {
        const districts = await getDistricts(division)
        res.json(districts)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch districts' })
    }
})

router.get('/cities', async (req, res) => {
    const { district } = req.query
    if (!district) return res.status(400).json({ error: 'district required' })
    try {
        const cities = await getCities(district)
        res.json(cities)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cities' })
    }
})

router.get('/search-bloodbanks', async (req, res) => {
    const { division = '', district = '', city = '' } = req.query
    try {
        const banks = await searchBloodBanks(division, district, city)
        res.json(banks)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch blood banks' })
    }
})

export default router
