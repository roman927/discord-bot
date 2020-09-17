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
    if (args.slice(1).length > 0) return message.channel.send('No need to use arguments, just use !resume to resume the queue');
    else if (songs === undefined || songs.length === 0) {
      message.channel.send("Error: The queue is empty");
      return musicController.stopSong(message);
    }
    musicController.resumeQueue(message, songs);
    return;
  }

  else if (message.content.startsWith(`${PREFIX}skip`)) {
    if (args.slice(1).length > 0) return message.channel.send('No need to use arguments, just use !skip to skip the song');
    else if (songs.length >= 0 && songs.length <= 1) { 
      return message.channel.send(`Unable to skip, not enough songs. Type !stop if you want to end the stream`);
    }
    songs = musicController.skipQueue(message, songs);
    return;
  }

  else if (message.content.startsWith(`${PREFIX}add`)) {
    if (args.slice(1).length === 0) return message.channel.send('Missing arguments after command');
    else if (args.length === 2 && args[1].startsWith(watchUrl)) {
      songs.push(args[1]);
      return message.channel.send("Succesfuly added new song");
    } else {
      if (!musicController.validateVoiceChannel(message)) return undefined;
      let songName = args.slice(1).join('%20');
      let song = await musicController.searchSong(songName);
      if (song === undefined) return message.channel.send("Reached api's quote limit");
      songs.push(song.url);
      return message.channel.send(`Succesfuly added song ${song.title}`);
    }
  }

  else if (message.content.startsWith(`${PREFIX}play`)) {
    if (args.slice(1).length === 0) return message.channel.send('Missing arguments after command');

    if (args.length === 2 && args[1].startsWith(watchUrl)) {
      // TODO: validate url
      musicController.playSingle(message, args[1]);
    } else {
      if (!musicController.validateVoiceChannel(message)) return undefined;
      let songName = args.slice(1).join('%20');
      let song = await musicController.searchSong(songName);
      if (song === undefined || song === false) { 
        return message.channel.send("Reached api's quote limit");
      } else {
        let songUrl = song.url;
        musicController.playSingle(message, songUrl);
        message.channel.send(`Now playing: ${song.title}\nSong url:    ${song.url}`);
      }
    }
  }

  else if (message.content.startsWith(`${PREFIX}clear`)) {
    if (args.slice(1).length > 0) return message.channel.send('No need to use arguments, just use !clear to clear the queue');

    else if (songs === undefined || songs.length < 1) return message.channel.send("Can't clear queue, it's already clear");
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
