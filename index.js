const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const sqlite3 = require('better-sqlite3');
const { token } = require('dotenv').config().parsed;

const db = require('./database.js');

function getPrefix(guildId) {
    const stmt = db.prepare('SELECT prefix FROM prefixes WHERE guild_id = ?');
    const result = stmt.get(guildId);
    return result ? result.prefix : '!';
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates // Penting untuk fitur musik!
    ]
});

// Membuat collection untuk menyimpan commands
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
        } else {
            console.log(`[WARNING] Command di ${filePath} tidak memiliki properti "data" atau "execute".`);
        }
    }
}

client.prefixCommands = new Collection();
const prefixCommandsPath = path.join(__dirname, 'prefix_commands');

// Cek jika folder prefix_commands ada
if (fs.existsSync(prefixCommandsPath)) {
    const prefixCommandFolders = fs.readdirSync(prefixCommandsPath);

    for (const folder of prefixCommandFolders) {
        const prefixFolderPath = path.join(prefixCommandsPath, folder);
        const prefixCommandFiles = fs.readdirSync(prefixFolderPath).filter(file => file.endsWith('.js'));
        for (const file of prefixCommandFiles) {
            const filePath = path.join(prefixFolderPath, file);
            const command = require(filePath);
            // Set command ke koleksi dengan key nama command
            if ('name' in command && 'execute' in command) {
                client.prefixCommands.set(command.name, command);
            } else {
                console.log(`[WARNING] Prefix command di ${filePath} tidak memiliki properti "name" atau "execute".`);
            }
        }
    }
}

client.once('ready', () => {
    console.log(`Bot siap! Login sebagai ${client.user.tag}`);
});

// Listener untuk menangani slash command
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`Command ${interaction.commandName} tidak ditemukan.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Terjadi error saat menjalankan command ini!', ephemeral: true });
    }
});

client.on('messsageCreate', async message => {
    if (message.author.bot || !message.guild) return;
    const prefix = getPrefix(message.guild.id);

    console.log('Server: ${message.guild.name} | Prefix dari DB: "${prefix}" | Pesan: "${message.content}"');
    
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!command) return;
    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('Terjadi error saat menjalankan command ini!');
    }

    if (commandName === 'ping') {
        const latency = Date.now() - message.createdTimestamp;
        message.channel.send(`🏓 Pong! Latensi pesan: **${latency}ms**.`);
    }    
});

client.login(token);