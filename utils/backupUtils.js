const { logChannelId } = require('../config/config');
const { EmbedBuilder } = require('discord.js');

function chunkString(str, size) {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
        chunks.push(str.slice(i, i + size));
    }
    return chunks;
}

module.exports = {
    async backupPost(client, user, postContent) {
        const logChannel = await client.channels.fetch(logChannelId);
        const chunks = chunkString(postContent, 1000);
        const totalChunks = chunks.length;

        const embed = new EmbedBuilder()
            .setColor(0xEFAFEF)
            .setTitle('Backup Post')
            .setAuthor({
                name: user.tag,
                iconURL: user.displayAvatarURL()
            })
            .setThumbnail(user.displayAvatarURL());

        chunks.forEach((chunk, index) => {
            embed.addFields({ name: `Part ${index + 1}/${totalChunks}`, value: `\`\`\`\n${chunk}\`\`\`` });
        });

        embed.addFields({ name: 'User ID', value: `\`${user.id}\``, inline: true })
            .addFields({ name: 'Username', value: `\`${user.username}\``, inline: true })
            .addFields({ name: 'Tag', value: `\`${user.tag}\``, inline: true })
            .addFields({ name: 'Discriminator', value: user.discriminator, inline: true })
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    },
};
