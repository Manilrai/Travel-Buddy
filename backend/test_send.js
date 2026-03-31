const { Message, User, Profile } = require('./models');

async function testSend() {
    try {
        console.log("Attempting to create message...");
        const messageData = {
            senderId: 2,
            receiverId: 10,
            content: "hello",
            messageType: "direct"
        };
        const message = await Message.create(messageData);
        console.log("Success! ID:", message.id);
    } catch (err) {
        console.error("Error creating message:");
        console.error(err.name);
        console.error(err.message);
        if (err.errors) console.error(err.errors);
    }
    process.exit(0);
}
testSend();
