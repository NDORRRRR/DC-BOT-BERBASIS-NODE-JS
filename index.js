const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token } = require('dotenv').config().parsed;

// Mengimpor koneksi database terpusat
const db = require('./database.js');

// --- KUMPULAN FUNGSI HELPER ---

function getPrefix(guildId) {
    // Mengambil data dari tabel server_settings
    const stmt = db.prepare('SELECT prefix FROM server_settings WHERE guild_id = ?');
    const result = stmt.get(guildId);
    // Jika tidak ada prefix di DB, gunakan '!' sebagai default
    return (result && result.prefix) ? result.prefix : '!';
}

function getLogChannel(guildId) {
    const stmt = db.prepare('SELECT log_channel_id FROM server_settings WHERE guild_id = ?');
    const result = stmt.get(guildId);
    return result ? result.log_channel_id : null;
}

// --- INISIALISASI CLIENT ---

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// --- MEMUAT SLASH COMMANDS ---

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}

// --- MEMUAT PREFIX COMMANDS ---

client.prefixCommands = new Collection();
const prefixCommandsPath = path.join(__dirname, 'prefix_commands');
if (fs.existsSync(prefixCommandsPath)) {
    const prefixCommandFolders = fs.readdirSync(prefixCommandsPath);
    for (const folder of prefixCommandFolders) {
        const prefixFolderPath = path.join(prefixCommandsPath, folder);
        const prefixCommandFiles = fs.readdirSync(prefixFolderPath).filter(file => file.endsWith('.js'));
        for (const file of prefixCommandFiles) {
            const filePath = path.join(prefixFolderPath, file);
            const command = require(filePath);
            if ('name' in command && 'execute' in command) {
                client.prefixCommands.set(command.name, command);
            }
        }
    }
}


// --- EVENT LISTENER UTAMA ---

client.once('ready', () => {
    console.log(`Bot siap! Login sebagai ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Terjadi error saat menjalankan command ini!', ephemeral: true });
    }
});

// Cooldown untuk sistem XP
const xpCooldown = new Set();

// --- SATU-SATUNYA EVENT MESSAGE CREATE ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    const guildId = message.guild.id;
    const userId = message.author.id;

    // --- BAGIAN 1: LOGIKA LEVELING ---
    const cooldownKey = `${guildId}-${userId}`;
    if (!xpCooldown.has(cooldownKey)) {
        let userLevel = db.prepare('SELECT * FROM levels WHERE guild_id = ? AND user_id = ?').get(guildId, userId);

        if (!userLevel) {
            db.prepare('INSERT INTO levels (guild_id, user_id, xp, level) VALUES (?, ?, ?, ?)').run(guildId, userId, 0, 1);
            userLevel = { xp: 0, level: 1 };
        }

        const gainedXp = Math.floor(Math.random() * 11) + 15;
        userLevel.xp += gainedXp;
        const nextLevelXp = userLevel.level * 300;

        if (userLevel.xp >= nextLevelXp) {
            userLevel.level++;
            userLevel.xp -= nextLevelXp;
            
            let levelUpMessage = `🎉 Selamat ${message.author}, Anda telah naik ke **Level ${userLevel.level}**!`;
            const roleReward = db.prepare('SELECT role_id FROM level_roles WHERE guild_id = ? AND level = ?').get(guildId, userLevel.level);

            if (roleReward) {
                try {
                    const roleToGive = await message.guild.roles.fetch(roleReward.role_id);
                    if (roleToGive) {
                        await message.member.roles.add(roleToGive);
                        levelUpMessage += `\nAnda mendapatkan peran **${roleToGive.name}**!`;
                    }
                } catch (err) {
                    console.error(`Gagal memberikan peran level-up: ${err}`);
                }
            }
            message.channel.send(levelUpMessage);
        }

        db.prepare('UPDATE levels SET xp = ?, level = ? WHERE guild_id = ? AND user_id = ?').run(userLevel.xp, userLevel.level, guildId, userId);
        xpCooldown.add(cooldownKey);
        setTimeout(() => { xpCooldown.delete(cooldownKey); }, 60000);
    }

    // --- BAGIAN 2: LOGIKA PREFIX COMMAND ---
    const prefix = getPrefix(guildId);
    if (!message.content.startsWith(prefix)) return;

    console.log(`Server: ${message.guild.name} | Prefix dari DB: "${prefix}" | Pesan: "${message.content}"`);

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.prefixCommands.get(commandName);

    if (!command) return;

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('Terjadi error saat menjalankan command ini!');
    }
});


// --- EVENT LAINNYA (LOGGING) ---
client.on('messageDelete', async message => {
    if (!message.guild || message.author.bot) return;
    const logChannelId = getLogChannel(message.guild.id);
    if (!logChannelId) return;

    const logChannel = await message.guild.channels.fetch(logChannelId).catch(() => null);
    if (!logChannel) return;

    const deleteEmbed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('Pesan Dihapus')
        .setDescription(`Sebuah pesan oleh ${message.author} telah dihapus di channel ${message.channel}.`)
        .addFields({ name: 'Isi Pesan', value: message.content || 'Tidak ada teks (mungkin gambar/embed).' })
        .setTimestamp();
    logChannel.send({ embeds: [deleteEmbed] });
});

client.on('guildMemberAdd', async member => {
    const logChannelId = getLogChannel(member.guild.id);
    if (!logChannelId) return;

    const logChannel = await member.guild.channels.fetch(logChannelId).catch(() => null);
    if (!logChannel) return;

    const joinEmbed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('Anggota Bergabung')
        .setDescription(`${member.user} (${member.user.tag}) telah bergabung ke server.`)
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();
    logChannel.send({ embeds: [joinEmbed] });
});

// --- LOGIN BOT ---
client.login(token);