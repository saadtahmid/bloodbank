import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/profiles/'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // For registration uploads, use a generic prefix since we don't have user_id yet
        const prefix = req.user ? `profile_${req.user.user_id}` : 'profile_temp';
        cb(null, `${prefix}_${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// API endpoint for image upload during registration (no database update)
export const uploadRegistrationImage = async (req, res) => {
    try {
        console.log('=== REGISTRATION IMAGE UPLOAD ENDPOINT HIT ===');
        console.log('File:', req.file);

        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imageUrl = `/uploads/profiles/${req.file.filename}`;
        console.log('Image URL:', imageUrl);

        // Just return the image URL without updating database
        res.json({
            success: true,
            image_url: imageUrl,
            message: 'Registration image uploaded successfully'
        });
    } catch (error) {
        console.error('Registration image upload error:', error);
        res.status(500).json({ error: 'Failed to upload registration image' });
    }
};

// API endpoint for image upload
export const uploadProfileImage = async (req, res) => {
    try {
        console.log('=== IMAGE UPLOAD ENDPOINT HIT ===');
        console.log('User:', req.user);
        console.log('File:', req.file);

        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imageUrl = `/uploads/profiles/${req.file.filename}`;
        console.log('Image URL:', imageUrl);

        // Update user's image_url in database
        const sql = (await import('../db.js')).default;
        console.log('Updating database for user:', req.user.user_id);

        await sql`
      UPDATE bloodbank.users 
      SET image_url = ${imageUrl}
      WHERE user_id = ${req.user.user_id}
    `;

        console.log('Database updated successfully');

        res.json({
            success: true,
            image_url: imageUrl,
            message: 'Profile image uploaded successfully'
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
};
