require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const play = require('play-dl');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!play')) {
        const args = message.content.split(' ').slice(1);
        if (!args[0]) return message.reply('Please provide a song name or link.');

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('You need to join a voice channel first!');

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        const query = args.join(' ');
        const searchResult = await play.search(query, { limit: 1 });
        const stream = await play.stream(searchResult[0].url);

        const resource = createAudioResource(stream.stream, { inputType: stream.type });
        const player = createAudioPlayer();

        player.play(resource);
        connection.subscribe(player);

        message.reply(`Now playing: ${searchResult[0].title}`);
    }
});

client.login(process.env.TOKEN);
