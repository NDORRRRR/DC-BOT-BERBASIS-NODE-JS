const queue = require('../../queue');
module.exports = {
    name: 'skip',
    description: 'Melewatkan lagu yang sedang diputar.',
    execute(message, args) {
        const serverQueue = queue.get(message.guild.id);
        if (!message.member.voice.channel) return message.reply('Kamu harus berada di voice channel!');
        if (!serverQueue) return message.reply('Tidak ada lagu yang bisa dilewati!');
        serverQueue.player.stop();
        message.channel.send('Lagu telah dilewati!');
    }
};