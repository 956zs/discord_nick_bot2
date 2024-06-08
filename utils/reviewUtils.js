const { reviewChannelId, adminroleid } = require('../config/config');
const { EmbedBuilder } = require('discord.js');

function chunkString(str, size) {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
        chunks.push(str.slice(i, i + size));
    }
    return chunks;
}

module.exports = {
    async reviewPost(client, postContent) {
        const reviewChannel = await client.channels.fetch(reviewChannelId);
        const chunks = chunkString(postContent, 1000);
        const totalChunks = chunks.length;

        const embed = new EmbedBuilder()
            .setColor(0xEFAFEF)
            .setTitle('Post for Review')
            .setTimestamp();

        chunks.forEach((chunk, index) => {
            embed.addFields({ name: `Part ${index + 1}/${totalChunks}`, value: chunk });
        });

        const message = await reviewChannel.send({ content: `<@&${adminroleid}>`, embeds: [embed] });
        await message.react('✅');
        await message.react('❌');

        const filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && !user.bot;
        const collector = message.createReactionCollector({ filter, time: 86400000 });

        collector.on('collect', async (reaction, user) => {
            if (reaction.emoji.name === '✅') {
                await require('./announceUtils').announcePost(client, postContent);
            }
            await message.delete();
        });
    },
};
