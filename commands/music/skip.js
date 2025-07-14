const { SlashCommandBuilder } = require('discord.js');
const queue = require('../../queue'); // Impor antrian bersama

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Melewatkan lagu yang sedang diputar.'),
    async execute(interaction) {
        const serverQueue = queue.get(interaction.guild.id);

        if (!interaction.member.voice.channel) {
            return interaction.reply({ content: 'Kamu harus berada di voice channel untuk melewati musik!', ephemeral: true });
        }

        if (!serverQueue) {
            return interaction.reply({ content: 'Tidak ada lagu yang bisa dilewati!', ephemeral: true });
        }

        // Menghentikan player akan memicu event 'idle', yang kemudian akan memutar lagu berikutnya
        serverQueue.player.stop();
        await interaction.reply('Lagu telah dilewati!');
    },
};