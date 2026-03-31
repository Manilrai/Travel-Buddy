const { sequelize } = require('./models');

async function alterDB() {
    try {
        console.log("Adding reply_to_id to messages table...");
        await sequelize.query("ALTER TABLE messages ADD COLUMN reply_to_id INTEGER DEFAULT NULL;");
        await sequelize.query("ALTER TABLE messages ADD CONSTRAINT fk_messages_reply_to FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL;");
        
        console.log("Success! DB altered.");
    } catch (err) {
        console.error("DB Error. It might already exist:", err.message);
    }
    process.exit(0);
}
alterDB();
