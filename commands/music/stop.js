const { SlashCommandBuilder } = require('discord.js');
const queue = require('../../queue'); // Impor antrian bersama

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Menghentikan musik dan membersihkan antrian.'),
    async execute(interaction) {
        const serverQueue = queue.get(interaction.guild.id);

        if (!serverQueue) {
            return interaction.reply({ content: 'Tidak ada musik yang sedang diputar!', ephemeral: true });
        }

        serverQueue.songs = []; // Kosongkan array lagu
        serverQueue.connection.destroy(); // Hancurkan koneksi voice
        queue.delete(interaction.guild.id); // Hapus antrian dari map

        await interaction.reply('Musik telah dihentikan dan bot keluar dari channel.');
    },
};