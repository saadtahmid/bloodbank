import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { upload, uploadProfileImage, uploadRegistrationImage } from '../middleware/imageUpload.js';

const router = Router();

// Upload profile image (requires authentication)
router.post('/upload-image', verifyToken, upload.single('image'), uploadProfileImage);

// Upload profile image for registration (no authentication required)
router.post('/upload-registration-image', upload.single('image'), uploadRegistrationImage);

// Get user profile with image
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const sql = (await import('../db.js')).default;

        const userResult = await sql`
      SELECT user_id, email, role, image_url
      FROM bloodbank.users 
      WHERE user_id = ${req.user.user_id}
    `;

        if (userResult.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: userResult[0]
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get user profile' });
    }
});

// Update user profile image URL
router.put('/update-image', verifyToken, async (req, res) => {
    try {
        const { image_url } = req.body;

        // Allow null/empty to remove image, but image_url must be present in body
        if (image_url === undefined) {
            return res.status(400).json({ error: 'Image URL parameter is required' });
        }

        const sql = (await import('../db.js')).default;
        await sql`
      UPDATE bloodbank.users 
      SET image_url = ${image_url}
      WHERE user_id = ${req.user.user_id}
    `;

        res.json({
            success: true,
            message: image_url ? 'Profile image updated successfully' : 'Profile image removed successfully'
        });
    } catch (error) {
        console.error('Update image error:', error);
        res.status(500).json({ error: 'Failed to update profile image' });
    }
});

export default router;
