const { announcementChannelId } = require('../config/config');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

function chunkString(str, size) {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
        chunks.push(str.slice(i, i + size));
    }
    return chunks;
}

function readTotalCount() {
    const data = fs.readFileSync(path.resolve(__dirname, '../data/totalCount.json'));
    const json = JSON.parse(data);
    return json.totalCount;
}

function writeTotalCount(totalCount) {
    const json = JSON.stringify({ totalCount }, null, 2);
    fs.writeFileSync(path.resolve(__dirname, '../data/totalCount.json'), json);
}

module.exports = {
    async announcePost(client, postContent) {
        const announcementChannel = await client.channels.fetch(announcementChannelId);
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const messages = await announcementChannel.messages.fetch({ limit: 100 });
        const todayMessages = messages.filter(msg => msg.embeds[0]?.title?.startsWith(`匿名大安有新貼文囉-${date}`));
        const count = todayMessages.size + 1;

        let totalCount = readTotalCount();
        totalCount++;
        writeTotalCount(totalCount);

        const chunks = chunkString(postContent, 990);
        const totalChunks = chunks.length;

        const announcementTitle = `匿名大安有新貼文囉-${date}${count > 1 ? `-${count}` : ''}`;

        const embed = new EmbedBuilder()
            .setColor(0xEFAFEF)
            .setTitle(announcementTitle)
            .setAuthor({
                name: '匿名大安發文平台',
                iconURL: 'https://media.discordapp.net/attachments/1248203795045810226/1248203875664527400/AUD1A3pYVpFqu4T1sF76kFCaaqh9q0Mu.png?ex=6662cff2&is=66617e72&hm=7ee6fefe26e4d581522d90dd169617597b454e9be39333264daed7b90962da4f&=&format=webp&quality=lossless'
            });

        chunks.forEach((chunk, index) => {
            embed.addFields({ name: `Part ${index + 1}/${totalChunks}`, value: `\`\`\`\n${chunk}\`\`\`` });
        });

        embed.setTimestamp().setFooter({ text: 'Anonymous Daan#1159   |   文章所有內容不屬於本專頁發表立場，僅提供匿名發文功能。' });

        const message = await announcementChannel.send({ embeds: [embed] });

        try {
            await message.crosspost();
            console.log('Announcement post successfully crossposted.');
        } catch (error) {
            console.error('Error crossposting the announcement post:', error);
        }
    },
};
