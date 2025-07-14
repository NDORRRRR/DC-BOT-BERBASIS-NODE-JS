const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms'); // Kamu perlu install: npm install ms

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Memberikan timeout (mute) pada anggota.')
        .addUserOption(option => option.setName('target').setDescription('Anggota yang akan di-mute').setRequired(true))
        .addStringOption(option => option.setName('duration').setDescription('Durasi mute (e.g., 10m, 1h, 1d)').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Alasan mute')),
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'Tidak ada alasan diberikan.';

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: 'Kamu tidak punya izin untuk melakukan ini!', ephemeral: true });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: 'Aku tidak punya izin untuk melakukan ini!', ephemeral: true });
        }
        
        const durationMs = ms(durationStr);
        if (!durationMs) {
            return interaction.reply({ content: 'Format durasi tidak valid! Contoh: 10m, 1h, 1d', ephemeral: true});
        }
        
        // Batas timeout adalah 28 hari
        if (durationMs > 2419200000) {
            return interaction.reply({ content: 'Durasi timeout tidak bisa lebih dari 28 hari.', ephemeral: true });
        }

        if (!target.moderatable) {
            return interaction.reply({ content: 'Aku tidak bisa me-mute anggota ini!', ephemeral: true });
        }

        await target.timeout(durationMs, reason);
        await interaction.reply(`**${target.user.tag}** telah di-mute selama ${durationStr}. Alasan: ${reason}`);
    },
};