const { PermissionsBitField } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    name: 'removexp',
    description: 'Mengurangi XP pengguna secara manual.',
    execute(message, args) {
        // 1. Cek izin
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply('Kamu tidak punya izin "Manage Server" untuk menggunakan command ini!');
        }

        // 2. Cek argumen
        const targetUser = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!targetUser || isNaN(amount) || amount <= 0) {
            return message.reply('Format salah! Gunakan: `<prefix>removexp @user <jumlah>`\nContoh: `!removexp @Andi 100`');
        }

        const guildId = message.guild.id;
        const userId = targetUser.id;

        // 3. Ambil data pengguna
        let userLevel = db.prepare('SELECT * FROM levels WHERE guild_id = ? AND user_id = ?').get(guildId, userId);

        if (!userLevel) {
            return message.reply('Pengguna tersebut belum memiliki XP.');
        }

        // 4. Kurangi XP dan update DB
        userLevel.xp -= amount;
        if (userLevel.xp < 0) {
            userLevel.xp = 0; // Pastikan XP tidak menjadi minus
        }
        
        db.prepare('UPDATE levels SET xp = ? WHERE guild_id = ? AND user_id = ?').run(userLevel.xp, guildId, userId);

        message.channel.send(`✅ Berhasil mengurangi **${amount} XP** dari ${targetUser}.`);
    }
};