const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

// Objek untuk menyimpan antrian lagu per server
const queue = require('../../queue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Memutar lagu dari YouTube.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Judul lagu atau URL YouTube')
                .setRequired(true)),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: 'Kamu harus berada di voice channel untuk memutar musik!', ephemeral: true });
        }

        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return interaction.reply({ content: 'Aku butuh izin untuk bergabung dan berbicara di voice channel ini!', ephemeral: true });
        }

        const serverQueue = queue.get(interaction.guild.id);
        const query = interaction.options.getString('query');

        await interaction.deferReply(); // Menunda balasan karena pencarian bisa memakan waktu

        let song = {};

        // Cari video berdasarkan query
        const videoResult = await ytSearch(query);
        const video = videoResult.videos.length > 1 ? videoResult.videos[0] : null;

        if (video) {
            song = { title: video.title, url: video.url };
        } else {
            return interaction.editReply('Tidak bisa menemukan lagu itu.');
        }

        if (!serverQueue) {
            const queueContruct = {
                textChannel: interaction.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                player: createAudioPlayer(),
                playing: true,
            };

            queue.set(interaction.guild.id, queueContruct);
            queueContruct.songs.push(song);

            try {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });
                queueContruct.connection = connection;
                play(interaction.guild, queueContruct.songs[0]);
                interaction.editReply(`▶️ Mulai memutar: **${song.title}**`);
            } catch (err) {
                console.log(err);
                queue.delete(interaction.guild.id);
                return interaction.editReply('Gagal bergabung ke voice channel.');
            }
        } else {
            serverQueue.songs.push(song);
            return interaction.editReply(`👍 Ditambahkan ke antrian: **${song.title}**`);
        }
    },
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