const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Mengetes kecepatan respon bot.'),
    async execute(interaction) {
        // Mengirim balasan awal dan menunggu pesan tersebut terkirim
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        
        // Menghitung latensi
        const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        // Mengedit balasan awal dengan hasil latensi
        interaction.editReply(`🏓 **Pong!**\nLatensi Roundtrip: **${roundtripLatency}ms**\nLatensi API: **${apiLatency}ms**`);
    },
};