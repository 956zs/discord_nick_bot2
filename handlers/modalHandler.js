const { reviewPost } = require('../utils/reviewUtils');
const { backupPost } = require('../utils/backupUtils');

module.exports = {
    async handleModalSubmit(interaction) {
        console.log('Handling modal submit:', interaction.customId);

        try {
            if (interaction.customId === 'submitModal') {
                const postContent = interaction.fields.getTextInputValue('postContent');

                if (interaction.replied || interaction.deferred) {
                    console.warn('Interaction already replied or deferred');
                    return;
                }

                await interaction.deferReply({ ephemeral: true });

                console.log('Backing up post...');
                await backupPost(interaction.client, interaction.user, postContent);

                console.log('Sending post for review...');
                await reviewPost(interaction.client, postContent, interaction.user.id);

                console.log('Replying to user...');
                await interaction.editReply({ content: '感謝您的回覆，我們會盡快審核。' });

                console.log('Modal submit handled successfully.');
            }
        } catch (error) {
            console.error('Error handling modal submit:', error);

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '提交過程中出現錯誤，請稍後再試。', ephemeral: true });
            } else {
                await interaction.editReply({ content: '提交過程中出現錯誤，請稍後再試。' });
            }
        }
    },
};
