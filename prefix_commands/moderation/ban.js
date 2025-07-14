const { PermissionsBitField } = require('discord.js');
module.exports = {
    name: 'ban',
    description: 'Mem-ban anggota dari server.',
    execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return message.reply('Kamu tidak punya izin untuk melakukan ini!');
        const target = message.mentions.members.first();
        if (!target) return message.reply('Kamu harus mention anggota yang akan di-ban.');
        if (!target.bannable) return message.reply('Aku tidak bisa mem-ban anggota ini!');
        const reason = args.slice(1).join(' ') || 'Tidak ada alasan.';
        target.ban({ reason: reason });
        message.channel.send(`**${target.user.tag}** telah di-ban. Alasan: ${reason}`);
    }
};