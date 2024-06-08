const { Client, GatewayIntentBits, Events } = require('discord.js');
const config = require('./config/config');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Map();

// 加载指令
const commandHandler = require('./handlers/commandHandler');
commandHandler(client);

// 加载事件
const eventFiles = fs.readdirSync(path.resolve(__dirname, './events')).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// InteractionCreate 事件监听器
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isModalSubmit()) {
        try {
            const modalHandler = require('./handlers/modalHandler');
            await modalHandler.handleModalSubmit(interaction);
        } catch (error) {
            console.error('Error in interaction create event:', error);
        }
    }
});

client.login(config.token);
