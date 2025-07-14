const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Menampilkan avatar pengguna.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Pengguna yang avatarnya ingin ditampilkan')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;

        const avatarEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Avatar milik ${user.username}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 512 }));

        await interaction.reply({ embeds: [avatarEmbed] });
    },
};