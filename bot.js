const fetch = require('node-fetch');

const botToken = "7729674779:AAFi8rDdIvAMYI2tcdIHc4oX60QLGeGwtkc"; // Replace with your bot's API token
const apiUrl = `https://api.telegram.org/bot${botToken}/getUpdates`;

async function getChatId() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch updates: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.ok) {
            throw new Error(`Telegram API error: ${data.description}`);
        }

        const updates = data.result;
        if (updates.length === 0) {
            console.log("No messages found. Send a message to your bot and try again.");
        } else {
            const lastMessage = updates[updates.length - 1].message;
            const chatId = lastMessage.chat.id;
            console.log(`Your chat ID is: ${chatId}`);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

getChatId();
