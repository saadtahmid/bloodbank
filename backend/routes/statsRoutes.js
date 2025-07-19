import express from 'express';
import { getSystemStats } from '../services/userService.js';

const router = express.Router();

// Get system statistics
router.get('/system', async (req, res) => {
    try {
        const stats = await getSystemStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching system statistics:', error);
        // Return fallback stats in case of database error
        const fallbackStats = {
            totalDonations: 0,
            activeDonors: 0,
            totalHospitals: 0,
            totalBloodBanks: 0,
            availableUnits: 0,
            totalCamps: 0
        };
        res.json(fallbackStats);
    }
});

export default router;
