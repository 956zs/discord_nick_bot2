const { announcementChannelId } = require('../config/config');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { createCanvas, registerFont } = require('canvas');

registerFont(path.resolve(__dirname, '../fonts/SourceHanSansCN-Regular.otf'), { family: 'Source Han Sans' });

function readTotalCount() {
    const data = fs.readFileSync(path.resolve(__dirname, '../data/totalCount.json'));
    const json = JSON.parse(data);
    return json.totalCount;
}

function writeTotalCount(totalCount) {
    const json = JSON.stringify({ totalCount }, null, 2);
    fs.writeFileSync(path.resolve(__dirname, '../data/totalCount.json'), json);
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function textToImage(text, filePath, totalCount) {
    const width = 1080;
    const height = 1350;
    const margin = 40; // Increased margin for inner content
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 背景
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // 字體
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let fontSize = 40;
    ctx.font = `${fontSize}px "Source Han Sans"`;

    let lines = wrapText(ctx, text, width - 2 * margin);

    // Adjust font size if text is too large
    while (lines.length * fontSize > height - 2 * margin && fontSize > 10) {
        fontSize--;
        ctx.font = `${fontSize}px "Source Han Sans"`;
        lines = wrapText(ctx, text, width - 2 * margin);
    }

    const lineHeight = fontSize * 1.5;
    const yStart = margin + (height - 2 * margin - lines.length * lineHeight) / 2;

    lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, yStart + index * lineHeight);
    });

    ctx.fillStyle = '#ffffff';
    ctx.font = '40px "Source Han Sans"';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('匿名大安', margin, margin);
    ctx.fillText(`編號: ${totalCount}`, margin, margin + 60);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);
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

        const chunks = postContent.match(/[\s\S]{1,990}/g) || [];
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
            // await message.crosspost();
            console.log('Announcement post successfully crossposted.');
        } catch (error) {
            console.error('Error crossposting the announcement post:', error);
        }

        // 保存文字為圖片
        const filePath = path.resolve(__dirname, `../images/post_${totalCount}.png`);
        textToImage(postContent, filePath, totalCount);
        console.log(`Image saved to ${filePath}`);
    },
};
