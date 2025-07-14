const { PermissionsBitField } = require('discord.js');
module.exports = {
    name: 'kick',
    description: 'Mengeluarkan anggota dari server.',
    execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return message.reply('Kamu tidak punya izin untuk melakukan ini!');
        const target = message.mentions.members.first();
        if (!target) return message.reply('Kamu harus mention anggota yang akan di-kick.');
        if (!target.kickable) return message.reply('Aku tidak bisa meng-kick anggota ini!');
        const reason = args.slice(1).join(' ') || 'Tidak ada alasan.';
        target.kick(reason);
        message.channel.send(`**${target.user.tag}** telah di-kick. Alasan: ${reason}`);
    }
};