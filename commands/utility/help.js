const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const db = require('../../database.js');

// Fungsi untuk mengambil prefix, agar bisa ditampilkan di help
function getPrefix(guildId) {
    const stmt = db.prepare('SELECT prefix FROM server_settings WHERE guild_id = ?');
    const result = stmt.get(guildId);
    return (result && result.prefix) ? result.prefix : '!';
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Menampilkan semua command yang tersedia berdasarkan kategori.'),
    async execute(interaction) {
        const prefix = getPrefix(interaction.guild.id);

        const helpEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📜 Bantuan Command Bot')
            .setDescription(`Berikut adalah daftar semua command yang bisa kamu gunakan.\nPrefix untuk server ini adalah: \`${prefix}\``);

        // --- Mengambil Slash Commands ---
        const slashCommandsPath = path.join(__dirname, '../../commands');
        const slashCommandFolders = fs.readdirSync(slashCommandsPath);

        for (const folder of slashCommandFolders) {
            const commandsList = [];
            const folderPath = path.join(slashCommandsPath, folder);
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(path.join(folderPath, file));
                if (command.data) {
                    commandsList.push(`\`/${command.data.name}\` - ${command.data.description}`);
                }
            }
            if (commandsList.length > 0) {
                const categoryName = folder.charAt(0).toUpperCase() + folder.slice(1);
                helpEmbed.addFields({ name: `Kategori Slash: ${categoryName}`, value: commandsList.join('\n'), inline: false });
            }
        }

        // --- Mengambil Prefix Commands ---
        const prefixCommandsPath = path.join(__dirname, '../../prefix_commands');
        if (fs.existsSync(prefixCommandsPath)) {
            const prefixCommandFolders = fs.readdirSync(prefixCommandsPath);

            for (const folder of prefixCommandFolders) {
                const commandsList = [];
                const folderPath = path.join(prefixCommandsPath, folder);
                const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
                for (const file of commandFiles) {
                    const command = require(path.join(folderPath, file));
                    if (command.name) {
                        commandsList.push(`\`${prefix}${command.name}\` - ${command.description || 'Tidak ada deskripsi.'}`);
                    }
                }
                if (commandsList.length > 0) {
                    const categoryName = folder.charAt(0).toUpperCase() + folder.slice(1);
                    helpEmbed.addFields({ name: `Kategori Prefix: ${categoryName}`, value: commandsList.join('\n'), inline: false });
                }
            }
        }
        
        await interaction.reply({ embeds: [helpEmbed] });
    }
};