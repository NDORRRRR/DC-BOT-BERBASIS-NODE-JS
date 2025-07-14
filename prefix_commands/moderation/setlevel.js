const { PermissionsBitField } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    name: 'setlevel',
    description: 'Mengatur level pengguna secara instan dan memberikan semua peran hadiah yang sesuai.',
    async execute(message, args) {
        // 1. Cek izin admin
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply('Anda tidak punya izin "Manage Server" untuk command ini!');
        }

        // 2. Validasi input
        const targetUser = message.mentions.users.first();
        const newLevel = parseInt(args[1]);

        if (!targetUser || isNaN(newLevel) || newLevel < 1) {
            return message.reply('Format salah! Gunakan: `<prefix>setlevel @user <level>`\nContoh: `!setlevel @Donatur 20`');
        }

        const guildId = message.guild.id;
        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            return message.reply('Member tidak ditemukan di server ini.');
        }

        // 3. Update level dan reset XP pengguna di database
        // Perintah ini akan membuat entri baru jika belum ada, atau update jika sudah ada
        const stmt = db.prepare(`
            INSERT INTO levels (guild_id, user_id, xp, level) VALUES (?, ?, 0, ?)
            ON CONFLICT(guild_id, user_id) DO UPDATE SET level = excluded.level, xp = 0
        `);
        stmt.run(guildId, targetUser.id, newLevel);

        // 4. Logika untuk memberikan semua peran hadiah secara kumulatif
        const rolesToGive = [];
        // Ambil semua aturan hadiah peran dari level 1 s/d level baru pengguna
        const roleRewards = db.prepare('SELECT role_id FROM level_roles WHERE guild_id = ? AND level <= ?').all(guildId, newLevel);

        if (roleRewards.length > 0) {
            for (const reward of roleRewards) {
                try {
                    // Cek apakah peran ada dan apakah bot bisa memberikannya
                    const role = await message.guild.roles.fetch(reward.role_id);
                    if (role && role.position < message.guild.members.me.roles.highest.position) {
                        rolesToGive.push(role);
                    }
                } catch (err) {
                    console.error(`Peran hadiah dengan ID ${reward.role_id} tidak ditemukan.`);
                }
            }
        }
        
        // Berikan semua peran yang terkumpul sekaligus
        if (rolesToGive.length > 0) {
            await targetMember.roles.add(rolesToGive);
        }

        // 5. Kirim pesan konfirmasi
        message.channel.send(`✅ Berhasil! ${targetUser} telah diatur ke **Level ${newLevel}** dan mendapatkan ${rolesToGive.length} peran hadiah yang sesuai.`);
    }
};