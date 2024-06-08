const { REST, Routes } = require('discord.js');
const config = require('./config/config');
const fs = require('fs');
const path = require('path');

// 创建 REST 实例
const rest = new REST({ version: '10' }).setToken(config.token);

// 读取所有命令文件
const commands = [];
const commandFiles = fs.readdirSync(path.resolve(__dirname, './commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

// 清除并重新注册斜线指令
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        // 清除所有现有的指令
        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: [] },
        );

        // 重新注册所有指令
        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
