const { reviewChannelId, adminroleid } = require('../config/config');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

function chunkString(str, size) {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
        chunks.push(str.slice(i, i + size));
    }
    return chunks;
}

module.exports = {
    async reviewPost(client, postContent, userId) {
        try {
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
                try {
                    const reviewer = user.tag;
                    if (reaction.emoji.name === '✅') {
                        await require('./announceUtils').announcePost(client, postContent);
                        await message.channel.send(`審核通過由: ${reviewer}`);
                    } else if (reaction.emoji.name === '❌') {
                        await sendRejectionMenu(client, message, userId, reviewer);
                    }
                    await message.delete();
                } catch (err) {
                    console.error('Error handling reaction:', err);
                }
            });
        } catch (err) {
            console.error('Error in reviewPost:', err);
        }
    }
};

async function sendRejectionMenu(client, message, userId, reviewer) {
    try {
        const rejectionReasons = [
            { label: '不符合社群規範', value: '不符合社群規範，請詳閱<#1248202716446982269>' },
            { label: '重複內容', value: '重複內容' },
            { label: '沒有意義的發言', value: '沒有意義的投稿文章' },
            { label: '內容過短', value: '內容過短，請嘗試加長內文並再試一次' },
            { label: '其他原因', value: '其他原因' }
        ];

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('rejection_reason')
                .setPlaceholder('選擇退件原因')
                .addOptions(rejectionReasons)
        );

        const rejectMessage = await message.channel.send({ content: '請選擇退件原因：', components: [row] });

        const filter = i => i.customId === 'rejection_reason' && i.user.id !== message.author.id;
        const collector = rejectMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            try {
                const reason = i.values[0];
                await i.update({ content: `已選擇退件原因：${reason}`, components: [] });

                const user = await client.users.fetch(userId);
                try {
                    await user.send(`您的投稿未通過審核，原因：${reason}`);
                    await message.channel.send(`審核不通過由: ${reviewer}`);
                } catch (err) {
                    console.error('無法發送DM:', err);
                }
            } catch (err) {
                console.error('Error in rejection menu selection:', err);
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                rejectMessage.edit({ content: '未選擇退件原因。', components: [] });
            }
        });
    } catch (err) {
        console.error('Error in sendRejectionMenu:', err);
    }
}
