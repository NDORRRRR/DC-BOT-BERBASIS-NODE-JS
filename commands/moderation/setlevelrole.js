const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlevelrole')
        .setDescription('Mengatur hadiah peran untuk level tertentu.')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Level yang akan memberikan hadiah peran.')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Peran yang akan diberikan sebagai hadiah.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild), // Hanya untuk admin

    async execute(interaction) {
        const level = interaction.options.getInteger('level');
        const role = interaction.options.getRole('role');
        const guildId = interaction.guild.id;

        // PENTING: Cek hierarki peran bot
        // Bot tidak bisa memberikan peran yang posisinya lebih tinggi dari perannya sendiri
        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({
                content: `Aku tidak bisa memberikan peran **${role.name}** karena posisinya lebih tinggi dari peranku. Pindahkan peran bot di atas peran tersebut.`,
                ephemeral: true
            });
        }

        // Simpan ke database menggunakan ON CONFLICT untuk update jika level sudah ada
        const stmt = db.prepare(`
            INSERT INTO level_roles (guild_id, level, role_id) 
            VALUES (?, ?, ?) 
            ON CONFLICT(guild_id, level) 
            DO UPDATE SET role_id = excluded.role_id
        `);
        stmt.run(guildId, level, role.id);

        interaction.reply({
            content: `Hadiah peran untuk **Level ${level}** telah diatur menjadi **${role.name}**.`,
            ephemeral: true
        });
    }
};