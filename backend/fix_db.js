const { sequelize } = require('./models');

async function fixDB() {
    try {
        console.log("Altering messages table...");
        await sequelize.query("ALTER TABLE messages MODIFY COLUMN message_type ENUM('text', 'image', 'direct', 'group') DEFAULT 'direct'");
        
        // Let's also update the old 'text' messages to 'direct' so they don't break logic
        await sequelize.query("UPDATE messages SET message_type = 'direct' WHERE message_type = 'text'");
        
        console.log("Success! DB altered.");
    } catch (err) {
        console.error("DB Error:", err);
    }
    process.exit(0);
}
fixDB();
