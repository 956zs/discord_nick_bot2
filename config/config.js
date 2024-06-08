require('dotenv').config();

module.exports = {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    serverId: process.env.SERVER_ID,
    reviewChannelId: process.env.REVIEW_CHANNEL_ID,
    logChannelId: process.env.LOG_CHANNEL_ID,
    announcementChannelId: process.env.ANNOUNCEMENT_CHANNEL_ID,
    imageBackupChannelId: process.env.IMAGE_BACKUP_CHANNEL_ID,
    adminroleid: process.env.ADMIN_ROLE_ID,
};
