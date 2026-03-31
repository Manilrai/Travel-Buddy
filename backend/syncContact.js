const { sequelize } = require('./models/index.js');
const Contact = require('./models/Contact.js');

async function syncContactTable() {
    try {
        console.log('Syncing Contact table...');
        await Contact.sync({ alter: true });
        console.log('Contact table synced successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error syncing Contact table:', error);
        process.exit(1);
    }
}

syncContactTable();
