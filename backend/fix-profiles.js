require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { Profile } = require('./models');
const { sequelize } = require('./config/database');

async function fixProfilePictures() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const profiles = await Profile.findAll();
        let updatedCount = 0;

        for (let profile of profiles) {
            let pic = profile.profilePicture;
            
            if (!pic) {
                // If it's already null/empty string, we might want to do nothing, 
                // because the frontend fallback already handles it.
                // But the user specifically asked "add that picture as default".
                // We can explicitly set it to '/default-avatar.svg' or null.
                // null is better since frontend handles it gracefully.
                continue;
            }

            // If it's a URL or path, verify it exists.
            // In our system, uploaded pictures are paths like '/uploads/profiles/...'
            if (pic.startsWith('/uploads/')) {
                const absolutePath = path.join(__dirname, pic);
                if (!fs.existsSync(absolutePath)) {
                    console.log(`Setting missing picture to null for Profile ID: ${profile.id} (File not found: ${absolutePath})`);
                    profile.profilePicture = null;
                    await profile.save();
                    updatedCount++;
                }
            } else if (pic.includes('ui-avatars.com') || pic.includes('default-avatar.png')) {
                console.log(`Setting legacy default to null for Profile ID: ${profile.id}`);
                profile.profilePicture = null;
                await profile.save();
                updatedCount++;
            }
        }

        console.log(`Successfully updated ${updatedCount} profiles with missing/legacy profile pictures to use the new default system.`);
        process.exit(0);
    } catch (error) {
        fs.writeFileSync('error.txt', error.stack || error.message || String(error));
        process.exit(1);
    }
}

fixProfilePictures();
