const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'userinfo',
    description: 'Menampilkan informasi tentang pengguna.',
    async execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const member = await message.guild.members.fetch(user.id);
        const userInfoEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Informasi Pengguna: ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤 Username', value: user.tag, inline: true },
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '📅 Akun Dibuat', value: `<t:${parseInt(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '🗓️ Bergabung', value: `<t:${parseInt(member.joinedTimestamp / 1000)}:R>`, inline: true }
            );
        message.channel.send({ embeds: [userInfoEmbed] });
    }
};