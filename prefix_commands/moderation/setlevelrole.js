const { PermissionsBitField } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    name: 'setlevelrole',
    description: 'Mengatur hadiah peran untuk level tertentu.',
    execute(message, args) {
        // 1. Cek Izin Pengguna
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply('Kamu tidak punya izin "Manage Server" untuk menggunakan command ini!');
        }

        // 2. Cek Argumen
        const level = parseInt(args[0]);
        const role = message.mentions.roles.first();

        if (isNaN(level) || !role) {
            return message.reply('Format command salah! Gunakan: `<prefix>setlevelrole <level> @<role>`\nContoh: `!setlevelrole 10 @Veteran`');
        }
        
        const guildId = message.guild.id;

        // 3. Cek Hierarki Peran Bot
        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply(`Aku tidak bisa memberikan peran **${role.name}** karena posisinya lebih tinggi dari peranku. Pindahkan peran bot di atas peran tersebut.`);
        }

        // 4. Simpan ke Database
        const stmt = db.prepare(`
            INSERT INTO level_roles (guild_id, level, role_id) 
            VALUES (?, ?, ?) 
            ON CONFLICT(guild_id, level) 
            DO UPDATE SET role_id = excluded.role_id
        `);
        stmt.run(guildId, level, role.id);

        message.channel.send(`Hadiah peran untuk **Level ${level}** telah diatur menjadi **${role.name}**.`);
    }
};