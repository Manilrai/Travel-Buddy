const { Message } = require('./models');

async function checkMessages() {
    try {
        const messages = await Message.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        console.log("Latest messages in DB:");
        messages.forEach(m => console.log(`- ID: ${m.id}, Sender: ${m.senderId}, Receiver: ${m.receiverId}, Content: "${m.content}"`));
    } catch (err) {
        console.error("DB Error:", err);
    }
    process.exit(0);
}

checkMessages();
