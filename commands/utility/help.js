const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Menampilkan semua command yang tersedia.'),
    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Bantuan Command Bot')
            .setDescription('Berikut adalah daftar semua command yang bisa kamu gunakan. Bot ini mendukung dua jenis command: Slash (/) dan Prefix (default: !).');

        // Mengambil Slash Commands dari folder /commands
        const slashCommandsList = [];
        const commandFolders = fs.readdirSync(path.join(__dirname, '../../commands'));
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(path.join(__dirname, `../../commands/${folder}`)).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`);
                slashCommandsList.push(`\`/${command.data.name}\` - ${command.data.description}`);
            }
        }
        if (slashCommandsList.length > 0) {
            helpEmbed.addFields({ name: 'Slash Commands (/)', value: slashCommandsList.join('\n') });
        }


        // Mengambil Prefix Commands dari folder /prefix_commands
        const prefixCommandsList = [];
        const prefixCommandsPath = path.join(__dirname, '../../prefix_commands');
        if (fs.existsSync(prefixCommandsPath)) {
            const prefixCommandFolders = fs.readdirSync(prefixCommandsPath);
            for (const folder of prefixCommandFolders) {
                const commandFiles = fs.readdirSync(path.join(prefixCommandsPath, folder)).filter(file => file.endsWith('.js'));
                for (const file of commandFiles) {
                    const command = require(`../../prefix_commands/${folder}/${file}`);
                    if (command.name && command.description) {
                        prefixCommandsList.push(`\`<prefix>${command.name}\` - ${command.description}`);
                    }
                }
            }
        }
        if (prefixCommandsList.length > 0) {
            helpEmbed.addFields({ name: 'Prefix Commands', value: prefixCommandsList.join('\n') });
        }

        helpEmbed.setFooter({ text: 'Gunakan /setprefix untuk mengubah prefix server ini.' });
        
        await interaction.reply({ embeds: [helpEmbed] });
    },
};