const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Menampilkan daftar semua prefix command yang tersedia.',
    execute(message, args) {
        // Mengambil semua prefix command dari koleksi client
        const commands = message.client.prefixCommands;

        const helpEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Bantuan Prefix Command')
            .setDescription('Berikut adalah daftar command yang bisa kamu gunakan dengan prefix server ini.');
        
        // Membuat daftar command
        const commandList = commands.map(cmd => {
            return `\`${cmd.name}\` - ${cmd.description}`;
        }).join('\n');

        if (commandList) {
            helpEmbed.addFields({ name: 'Commands', value: commandList });
        } else {
            helpEmbed.addFields({ name: 'Commands', value: 'Tidak ada prefix command yang tersedia saat ini.' });
        }

        message.channel.send({ embeds: [helpEmbed] });
    }
};