const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'avatar',
    description: 'Menampilkan avatar pengguna.',
    execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const avatarEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Avatar milik ${user.username}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 512 }));
        message.channel.send({ embeds: [avatarEmbed] });
    }
};