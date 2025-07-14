const queue = require('../../queue');
module.exports = {
    name: 'stop',
    description: 'Menghentikan musik dan membersihkan antrian.',
    execute(message, args) {
        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue) return message.reply('Tidak ada musik yang sedang diputar!');
        serverQueue.songs = [];
        serverQueue.connection.destroy();
        queue.delete(message.guild.id);
        message.channel.send('Musik telah dihentikan.');
    }
};