const { PermissionsBitField } = require('discord.js');
const ms = require('ms');
module.exports = {
    name: 'mute',
    description: 'Memberikan timeout (mute) pada anggota.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return message.reply('Kamu tidak punya izin untuk melakukan ini!');
        const target = message.mentions.members.first();
        if (!target) return message.reply('Kamu harus mention anggota yang akan di-mute.');
        const durationStr = args[1];
        if (!durationStr) return message.reply('Kamu harus memberikan durasi mute (e.g., 10m, 1h, 1d).');
        const durationMs = ms(durationStr);
        if (!durationMs) return message.reply('Format durasi tidak valid!');
        const reason = args.slice(2).join(' ') || 'Tidak ada alasan.';
        await target.timeout(durationMs, reason);
        message.channel.send(`**${target.user.tag}** telah di-mute selama ${durationStr}.`);
    }
};