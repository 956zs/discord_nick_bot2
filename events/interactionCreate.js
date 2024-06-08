const { InteractionType } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (command) await command.execute(interaction);
        }
    },
};
