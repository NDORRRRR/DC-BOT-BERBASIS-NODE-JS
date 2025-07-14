module.exports = {
    name: 'ping',
    description: 'Mengecek latensi bot dengan prefix command.',
    execute(message, args) {
        const latency = Date.now() - message.createdTimestamp;
        message.channel.send(`🏓 Pong! Latensi pesan: **${latency}ms**.`);
    }
};