require('dotenv').config();
const Discord = require('discord.js');
const musicController = require('./music/musicController');

const PREFIX = "!";
const watchUrl = "https://www.youtube.com/watch?v=";
const client = new Discord.Client();

client.login(process.env.TOKEN);

client.on("ready", () => {
  console.log("Bot's ready");
});

var songs = [];

// Event listener on messages
client.on('message', async message => {

  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.substring(PREFIX.length).split(" ");

  if (message.content.startsWith(`${PREFIX}commands`)) {
    return message.channel.send("Commands are: resume, skip, add, play and stop");
  }

  else if (message.content.startsWith(`${PREFIX}resume`)) {
    if (songs === undefined || songs.length === 0) {
      message.channel.send("I already played every song in the playlist");
      return musicController.stopSong(message);
    }
    musicController.resumeQueue(message, songs);
    return;
  }

  else if (message.content.startsWith(`${PREFIX}skip`)) {
    if (songs.length === 1) return message.channel.send(`Unable to skip, not enough songs. Type !stop if you want to end the stream`);
    musicController.skipQueue(message, songs);
    return;
  }

  else if (message.content.startsWith(`${PREFIX}add`)) {
    if (args.length === 2) {
      songs.push(args[1]);
      return message.channel.send("Succesfuly added new song");
    } else {
      let songName = args.slice(1).join('%20');
      let song = await musicController.searchSong(songName);
      songs.push(song.url);
      return message.channel.send(`Succesfuly added song ${song.title}`);
    }
  }

  else if (message.content.startsWith(`${PREFIX}play`)) {
    if (args.length === 2) {
      musicController.playSong(message, args[1]);
    } else {
      let songName = args.slice(1).join('%20');
      console.log(`Song name: ${songName}`);
      let song = await musicController.searchSong(songName);
      let songUrl = song.url;
      musicController.playSong(message, songUrl);
      message.channel.send(`Now playing: ${song.title}\nSong url:    ${song.url}`);
    }
  }

  else if (message.content.startsWith(`${PREFIX}clear`)) {
    if (songs === undefined || songs.length < 1) return message.channel.send("Can't clear queue, it's already clear");
    songs = []
    musicController.stopSong(message);
    return message.channel.send(`Playlist has been cleared`);
  }

  else if (message.content.startsWith(`${PREFIX}stop`)) {
    musicController.stopSong(message, args[1]);
    return;
  }
  else {
    message.reply("Wrong command, to see all comands type !commands");
  }
});
