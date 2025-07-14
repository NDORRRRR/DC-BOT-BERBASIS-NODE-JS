const { PermissionsBitField } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    name: 'addxp',
    description: 'Menambahkan XP ke pengguna secara manual dan menyesuaikan level.',
    execute(message, args) {
        // 1. Cek izin
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply('Kamu tidak punya izin "Manage Server" untuk menggunakan command ini!');
        }

        // 2. Cek argumen
        const targetUser = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!targetUser || isNaN(amount) || amount <= 0) {
            return message.reply('Format salah! Gunakan: `<prefix>addxp @user <jumlah>`');
        }

        const guildId = message.guild.id;
        const userId = targetUser.id;

        // 3. Ambil data pengguna
        let userLevel = db.prepare('SELECT * FROM levels WHERE guild_id = ? AND user_id = ?').get(guildId, userId);

        if (!userLevel) {
            db.prepare('INSERT INTO levels (guild_id, user_id, xp, level) VALUES (?, ?, ?, ?)').run(guildId, userId, 0, 1);
            userLevel = { guild_id: guildId, user_id: userId, xp: 0, level: 1 };
        }

        // 4. Tambahkan XP
        userLevel.xp += amount;
        
        let levelUpOccurred = false;
        let initialLevel = userLevel.level;

        // --- LOGIKA PENGECEKAN LEVEL UP (LOOP) ---
        // Loop ini akan terus berjalan jika pengguna naik beberapa level sekaligus
        let nextLevelXp = userLevel.level * 300;
        while (userLevel.xp >= nextLevelXp) {
            userLevel.level++;
            userLevel.xp -= nextLevelXp;
            levelUpOccurred = true;
            // Hitung ulang target XP untuk level berikutnya
            nextLevelXp = userLevel.level * 300;
        }

        // 5. Update database dengan level dan XP yang baru
        db.prepare('UPDATE levels SET xp = ?, level = ? WHERE guild_id = ? AND user_id = ?')
          .run(userLevel.xp, userLevel.level, guildId, userId);

        // 6. Kirim pesan konfirmasi
        let responseMessage = `✅ Berhasil menambahkan **${amount} XP** ke ${targetUser}.`;
        if (levelUpOccurred) {
            responseMessage += `\nPengguna tersebut naik dari **Level ${initialLevel}** ke **Level ${userLevel.level}**!`;
        }

        message.channel.send(responseMessage);
    }
};