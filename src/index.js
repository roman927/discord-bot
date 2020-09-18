require('dotenv').config();
const Discord = require('discord.js');
const musicController = require('./musicController');

const PREFIX = "!";
const watchUrl = "https://www.youtube.com/watch?v=";
const client = new Discord.Client();

var songs;

client.login(process.env.TOKEN);

client.on("ready", () => {
  console.log("Bot's ready");
  songs = new Array();
});

// Event listener on messages
client.on('message', async message => {

  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.substring(PREFIX.length).split(" ");

  if (message.content.startsWith(`${PREFIX}commands`)) {
    return message.channel.send("Commands are: resume, skip, add, play, clear and stop");
  }

  else if (message.content.startsWith(`${PREFIX}qresume`)) {
    let command = message.content;
    if (!commandIsValid(command)) {
      return message.channel.send('Wrong command or use of command, to see the commands type !commands');
    }
    // Check if posible to resume queue
    else if (songs === undefined || songs.length === 0) {
      message.channel.send("Error: The queue is empty");
      return musicController.stopSong(message);
    }
    musicController.resumeQueue(message, songs);
    return;
  }

  else if (message.content.startsWith(`${PREFIX}skip`)) {
    let command = message.content;
    if (!commandIsValid(command)) {
      return message.channel.send('Wrong command or use of command, to see the commands type !commands');
    }
    // Look if there's a song to skip to
    else if (songs.length >= 0 && songs.length <= 1) { 
      return message.channel.send(`Unable to skip, not enough songs. Type !stop if you want to end the stream`);
    }
    songs = musicController.skipQueue(message, songs);
    return;
  }

  else if (message.content.startsWith(`${PREFIX}add`)) {

    let command = message.content;
    if (!commandIsValid(command)) {
      return message.channel.send('Wrong command or use of command, to see the commands type !commands');
    }

    else if (args.length === 2 && args[1].startsWith(watchUrl)) {
      songs.push(args[1]);
      return message.channel.send("Succesfuly added new song");
    } else {
      // Validate vc and continue/stop
      if (!musicController.validateVoiceChannel(message)) return undefined;

      let songName = args.slice(1).join('%20');
      let song = await musicController.searchSong(songName);
      
      // Check for errors/Add the song
      if (song === undefined) { 
        return message.channel.send("Reached api's quote limit");
      } else {
        songs.push(song.url);
        return message.channel.send(`Succesfuly added song ${song.title}`);
      }
    }
  }

  else if (message.content.startsWith(`${PREFIX}play`)) {
    
    let command = message.content;
    if (!commandIsValid(command))
        return message.channel.send('Wrong command or use of command, to see the commands type !commands');

    if (args.length === 2 && args[1].startsWith(watchUrl)) {
      // TODO: validate url
      dispatcher = musicController.playSingle(message, args[1]);
    } else {
      if (!musicController.validateVoiceChannel(message)) return undefined;

      let songName = args.slice(1).join('%20');
      let song = await musicController.searchSong(songName);

      if (song === undefined || song === false) { 
        return message.channel.send("Reached api's quote limit");
      } else {
        let songUrl = song.url;
        dispatcher = musicController.playSingle(message, songUrl);
        message.channel.send(`Now playing: ${song.title}\nSong url:    ${song.url}`);
      }
    }
  }

  else if (message.content.startsWith(`${PREFIX}clear`)) {
    let command = message.content;
    if (!commandIsValid(command))
      return message.channel.send('Wrong command or use of command, to see the commands type !commands');

    else if (songs === undefined || songs.length < 1) return message.channel.send("Can't clear queue, it's already clear");
    songs = []
    musicController.stopSong(message);
    return message.channel.send(`Playlist has been cleared`);
  }

  else if (message.content.startsWith(`${PREFIX}stop`)) {
    let command = message.content;
    if (!commandIsValid(command)) 
      return message.channel.send('Wrong command or use of command, to see the commands type !commands');
    musicController.stopSong(message, args[1]);
    return;
  }
});

function commandIsValid(command) {
  let order = command.slice(1).split(" ");
  console.log(order);
  if (order[0] === "play" || order[0] === "add") {

      if (order[1].startsWith(watchUrl) && order.length > 2) return false;
      else if (order.length === 1) return false;
      return true;
  } else {

      if (order.length > 1) return false;
      return true;
  }
}
