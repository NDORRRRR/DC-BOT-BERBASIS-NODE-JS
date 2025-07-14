const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Menampilkan informasi tentang pengguna.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Pengguna yang ingin dilihat infonya')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const userInfoEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Informasi Pengguna: ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤 Username', value: user.tag, inline: true },
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '📅 Akun Dibuat', value: `<t:${parseInt(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '🗓️ Bergabung ke Server', value: `<t:${parseInt(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '🎭 Roles', value: member.roles.cache.map(r => r).join(' ') || 'Tidak ada', inline: false }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [userInfoEmbed] });
    },
};