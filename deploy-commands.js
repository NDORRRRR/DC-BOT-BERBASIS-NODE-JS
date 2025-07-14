const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('dotenv').config().parsed;
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`Mulai me-refresh ${commands.length} application (/) commands.`);

        // Mendaftarkan command ke server spesifik (guild) untuk testing
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`Berhasil me-refresh ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();