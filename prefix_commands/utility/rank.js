const { EmbedBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    name: 'rank',
    description: 'Melihat level dan XP Anda atau pengguna lain.',
    execute(message, args) {
        // Cek jika ada mention, jika tidak, gunakan author pesan
        const targetUser = message.mentions.users.first() || message.author;
        const guildId = message.guild.id;
        const userId = targetUser.id;

        const userLevel = db.prepare('SELECT * FROM levels WHERE guild_id = ? AND user_id = ?').get(guildId, userId);

        if (!userLevel) {
            return message.reply(`${targetUser.username} belum memiliki XP di server ini.`);
        }

        const nextLevelXp = userLevel.level * 300;

        const rankEmbed = new EmbedBuilder()
            .setColor('Gold')
            .setAuthor({ name: `Peringkat untuk ${targetUser.username}`, iconURL: targetUser.displayAvatarURL() })
            .addFields(
                { name: 'Level', value: `**${userLevel.level}**`, inline: true },
                { name: 'XP', value: `**${userLevel.xp} / ${nextLevelXp}**`, inline: true }
            );

        message.channel.send({ embeds: [rankEmbed] });
    }
};