const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Mengeluarkan anggota dari server.')
        .addUserOption(option => option.setName('target').setDescription('Anggota yang akan di-kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Alasan kick')),
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'Tidak ada alasan diberikan.';

        // Cek permission pengguna
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: 'Kamu tidak punya izin untuk melakukan ini!', ephemeral: true });
        }

        // Cek permission bot
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: 'Aku tidak punya izin untuk melakukan ini!', ephemeral: true });
        }

        // Cek apakah target bisa di-kick
        if (!target.kickable) {
            return interaction.reply({ content: 'Aku tidak bisa meng-kick anggota ini!', ephemeral: true });
        }

        await target.kick(reason);
        await interaction.reply(`**${target.user.tag}** telah di-kick. Alasan: ${reason}`);
    },
};