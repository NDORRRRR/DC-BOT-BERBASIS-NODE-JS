const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setprefix')
        .setDescription('Mengatur prefix command untuk server ini.')
        .addStringOption(option =>
            option.setName('prefix')
                .setDescription('Prefix baru yang ingin digunakan (maks. 5 karakter).')
                .setRequired(true)
                .setMaxLength(5))
        // Hanya user dengan izin "Manage Server" yang bisa menggunakan command ini
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

    async execute(interaction) {
        const newPrefix = interaction.options.getString('prefix');
        const guildId = interaction.guild.id;

        try {
            // Cek apakah server sudah punya prefix
            const checkStmt = db.prepare('SELECT prefix FROM prefixes WHERE guild_id = ?');
            const result = checkStmt.get(guildId);

            if (result) {
                // Jika sudah ada, update
                const updateStmt = db.prepare('UPDATE prefixes SET prefix = ? WHERE guild_id = ?');
                updateStmt.run(newPrefix, guildId);
            } else {
                // Jika belum ada, insert baru
                const insertStmt = db.prepare('INSERT INTO prefixes (guild_id, prefix) VALUES (?, ?)');
                insertStmt.run(guildId, newPrefix);
            }
            
            await interaction.reply(`Prefix untuk server ini telah diubah menjadi: \`${newPrefix}\``);

        } catch (error) {
            console.error('Error saat menyimpan prefix:', error);
            await interaction.reply({ content: 'Terjadi kesalahan saat menyimpan prefix.', ephemeral: true });
        }
    },
};