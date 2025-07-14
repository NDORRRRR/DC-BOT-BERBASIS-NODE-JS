const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const queue = require('../../queue'); // Impor antrian bersama

module.exports = {
    name: 'play',
    description: 'Memutar lagu dari YouTube.',
    async execute(message, args) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('Kamu harus berada di voice channel untuk memutar musik!');
        }

        if (args.length === 0) {
            return message.reply('Kamu harus memberikan judul lagu atau URL YouTube!');
        }

        const serverQueue = queue.get(message.guild.id);
        const query = args.join(' ');

        const videoResult = await ytSearch(query);
        const video = videoResult.videos.length > 1 ? videoResult.videos[0] : null;

        if (!video) {
            return message.channel.send('Tidak bisa menemukan lagu itu.');
        }

        const song = { title: video.title, url: video.url };

        if (!serverQueue) {
            const queueContruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [song],
                player: createAudioPlayer(),
                playing: true,
            };
            queue.set(message.guild.id, queueContruct);

            try {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                });
                queueContruct.connection = connection;
                play(message.guild, queueContruct.songs[0]);
                message.channel.send(`▶️ Mulai memutar: **${song.title}**`);
            } catch (err) {
                console.log(err);
                queue.delete(message.guild.id);
                return message.channel.send('Gagal bergabung ke voice channel.');
            }
        } else {
            serverQueue.songs.push(song);
            return message.channel.send(`👍 Ditambahkan ke antrian: **${song.title}**`);
        }
    }
};

const play = (guild, song) => {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.connection.disconnect();
        queue.delete(guild.id);
        return;
    }
    const stream = ytdl(song.url, { filter: 'audioonly' });
    const resource = createAudioResource(stream);
    serverQueue.player.play(resource);
    serverQueue.connection.subscribe(serverQueue.player);
    serverQueue.player.on(AudioPlayerStatus.Idle, () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
    });
};