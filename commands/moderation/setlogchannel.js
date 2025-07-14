const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlogchannel')
        .setDescription('Mengatur channel untuk log server.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel yang akan digunakan untuk log.')
                .addChannelTypes(ChannelType.GuildText) // Hanya channel teks
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),
    execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const guildId = interaction.guild.id;

        // Simpan ke database (menggunakan INSERT OR REPLACE untuk simpelnya)
        const stmt = db.prepare('INSERT INTO server_settings (guild_id, log_channel_id) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET log_channel_id = excluded.log_channel_id');
        stmt.run(guildId, channel.id);

        interaction.reply({ content: `Channel log telah diatur ke ${channel}.`, ephemeral: true });
    }
};