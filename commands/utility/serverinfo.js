const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Menampilkan informasi tentang server ini.'),
    async execute(interaction) {
        const { guild } = interaction;
        const owner = await guild.fetchOwner();

        const serverInfoEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Informasi Server: ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '👑 Pemilik', value: owner.user.tag, inline: true },
                { name: '🆔 ID Server', value: guild.id, inline: true },
                { name: '📅 Dibuat Pada', value: `<t:${parseInt(guild.createdTimestamp / 1000)}:D>`, inline: true },
                { name: '👥 Anggota', value: `${guild.memberCount} pengguna`, inline: true },
                { name: '💬 Channels', value: `${guild.channels.cache.size} channel`, inline: true },
                { name: '🎭 Roles', value: `${guild.roles.cache.size} role`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [serverInfoEmbed] });
    },
};