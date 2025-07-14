const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Melihat level dan XP Anda atau pengguna lain.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Pengguna yang ingin dilihat peringkatnya.')),
    execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const guildId = interaction.guild.id;
        const userId = targetUser.id;

        const userLevel = db.prepare('SELECT * FROM levels WHERE guild_id = ? AND user_id = ?').get(guildId, userId);

        if (!userLevel) {
            return interaction.reply({ content: `${targetUser.username} belum memiliki XP.`, ephemeral: true });
        }

        const nextLevelXp = userLevel.level * 300;

        const rankEmbed = new EmbedBuilder()
            .setColor('Gold')
            .setAuthor({ name: `Peringkat untuk ${targetUser.username}`, iconURL: targetUser.displayAvatarURL() })
            .addFields(
                { name: 'Level', value: `**${userLevel.level}**`, inline: true },
                { name: 'XP', value: `**${userLevel.xp} / ${nextLevelXp}**`, inline: true }
            );

        interaction.reply({ embeds: [rankEmbed] });
    }
};