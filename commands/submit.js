const { SlashCommandBuilder } = require('@discordjs/builders');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('submit')
        .setDescription('Submit an anonymous post'),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('submitModal')
            .setTitle('Anonymous Post Submission');

        const postInput = new TextInputBuilder()
            .setCustomId('postContent')
            .setLabel('Your Post')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(postInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    },
};
