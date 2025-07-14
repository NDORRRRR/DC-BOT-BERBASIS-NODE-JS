const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const queue = require('../../queue'); // Impor antrian bersama

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Menampilkan daftar antrian lagu.'),
    async execute(interaction) {
        const serverQueue = queue.get(interaction.guild.id);

        if (!serverQueue || serverQueue.songs.length === 0) {
            return interaction.reply({ content: 'Antrian kosong!', ephemeral: true });
        }

        const queueEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Antrian Lagu')
            .setDescription(
                serverQueue.songs.map((song, i) => {
                    if (i === 0) {
                        return `**▶️ Sedang Diputar:** ${song.title}`;
                    }
                    return `**${i}.** ${song.title}`;
                }).join('\n')
            )
            .setTimestamp();

        await interaction.reply({ embeds: [queueEmbed] });
    },
};