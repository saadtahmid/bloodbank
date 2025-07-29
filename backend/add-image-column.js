import 'dotenv/config';
import sql from './db.js';

async function addImageColumn() {
    try {
        console.log('Adding image_url column to users table...');
        
        await sql`
            ALTER TABLE bloodbank.users 
            ADD COLUMN IF NOT EXISTS image_url CHARACTER VARYING(500) NULL
        `;
        
        console.log('✅ Successfully added image_url column to users table');
        
        // Test the column exists
        const result = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'bloodbank' 
            AND table_name = 'users' 
            AND column_name = 'image_url'
        `;
        
        if (result.length > 0) {
            console.log('✅ Column verification successful');
        } else {
            console.log('❌ Column verification failed');
        }
        
    } catch (error) {
        console.error('❌ Error adding image_url column:', error.message);
    }
    
    process.exit(0);
}

addImageColumn();
