const { EmbedBuilder } = require('discord.js');
const queue = require('../../queue');
module.exports = {
    name: 'queue',
    description: 'Menampilkan daftar antrian lagu.',
    execute(message, args) {
        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue || serverQueue.songs.length === 0) return message.reply('Antrian kosong!');
        const queueEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Antrian Lagu')
            .setDescription(serverQueue.songs.map((song, i) => i === 0 ? `**▶️ Sedang Diputar:** ${song.title}` : `**${i}.** ${song.title}`).join('\n'));
        message.channel.send({ embeds: [queueEmbed] });
    }
};