const { EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const db = require('../../database.js');

function getPrefix(guildId) {
    const stmt = db.prepare('SELECT prefix FROM server_settings WHERE guild_id = ?');
    const result = stmt.get(guildId);
    return (result && result.prefix) ? result.prefix : '!';
}

module.exports = {
    name: 'help',
    description: 'Menampilkan daftar semua prefix command yang tersedia.',
    execute(message, args) {
        const prefix = getPrefix(message.guild.id);
        const helpEmbed = new EmbedBuilder()
            .setColor('#790202ff')
            .setTitle('📜 Bantuan Prefix Command')
            .setDescription(`Gunakan prefix \`${prefix}\` sebelum setiap nama command.`);

        const prefixCommandsPath = path.join(__dirname, '../../prefix_commands');
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
                helpEmbed.addFields({ name: `Kategori: ${categoryName}`, value: commandsList.join('\n'), inline: false });
            }
        }
        
        message.channel.send({ embeds: [helpEmbed] });
    }
};