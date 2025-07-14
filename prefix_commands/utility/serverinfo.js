const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'serverinfo',
    description: 'Menampilkan informasi tentang server.',
    async execute(message, args) {
        const { guild } = message;
        const owner = await guild.fetchOwner();
        const serverInfoEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Informasi Server: ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '👑 Pemilik', value: owner.user.tag, inline: true },
                { name: '👥 Anggota', value: `${guild.memberCount} pengguna`, inline: true },
                { name: '📅 Dibuat Pada', value: `<t:${parseInt(guild.createdTimestamp / 1000)}:D>`, inline: true }
            );
        message.channel.send({ embeds: [serverInfoEmbed] });
    }
};