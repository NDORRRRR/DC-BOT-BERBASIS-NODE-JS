const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Mem-ban anggota dari server.')
        .addUserOption(option => option.setName('target').setDescription('Anggota yang akan di-ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Alasan ban')),
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'Tidak ada alasan diberikan.';

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: 'Kamu tidak punya izin untuk melakukan ini!', ephemeral: true });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: 'Aku tidak punya izin untuk melakukan ini!', ephemeral: true });
        }

        if (!target.bannable) {
            return interaction.reply({ content: 'Aku tidak bisa mem-ban anggota ini!', ephemeral: true });
        }

        await target.ban({ reason: reason });
        await interaction.reply(`**${target.user.tag}** telah di-ban. Alasan: ${reason}`);
    },
};