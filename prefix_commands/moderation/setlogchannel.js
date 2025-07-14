const { PermissionsBitField } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    name: 'setlogchannel',
    description: 'Mengatur channel untuk log server.',
    execute(message, args) {
        // PENTING: Cek izin pengguna secara manual
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply('Kamu tidak punya izin "Manage Server" untuk menggunakan command ini!');
        }

        const channel = message.mentions.channels.first();

        if (!channel) {
            return message.reply('Kamu harus menyebutkan channel yang akan digunakan! Contoh: `!setlogchannel #nama-channel`');
        }

        const guildId = message.guild.id;

        // Menggunakan ON CONFLICT untuk update atau insert
        const stmt = db.prepare(`
            INSERT INTO server_settings (guild_id, log_channel_id) 
            VALUES (?, ?) 
            ON CONFLICT(guild_id) 
            DO UPDATE SET log_channel_id = excluded.log_channel_id
        `);
        stmt.run(guildId, channel.id);

        message.channel.send(`Channel log telah diatur ke ${channel}.`);
    }
};