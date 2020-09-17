const axios = require('axios');
const {VoiceChannel} = require('discord.js');
const ytdl = require('ytdl-core');
const API_KEY = process.env.API_KEY;

async function playSingle(message, songUrl) {
  const connection = await createConnection(message);
  if (connection === undefined) return message.channel.send('You need to be in a voice channel before using commands');
  const dispatcher = connection.play(ytdl(songUrl, {filter: 'audioonly', highWaterMark: 1<<25}))
  .on('finish', () => {
    console.log('Song finished');
  });
  dispatcher.setVolume(0.4);
}

async function stopSong(message) {
  const voiceChannel = message.member.voice.channel;
  if(!validateVoiceChannel(message)) return undefined;
  voiceChannel.leave();
  console.log("leaving channel by order");
  return undefined;
}

async function resumeQueue(message, songs) {
  const connection = await createConnection(message);
  console.log(`Now playing ${songs[0]}`);
  connection.play(ytdl(songs[0]), {filter: 'audioonly'})
    .on('finish', () => {
      songs.shift();
      resumeQueue(message, songs);
    });
}

async function skipQueue(message, songs) {
  if (!validateVoiceChannel(message)) return undefined;
  songs.shift();
  console.log(`Songs state: ${songs}`);
  resumeQueue(message, songs);
  message.channel.send(`Succesfuly skiped song`);
  return songs;
}

function checkVideoId(videoId) {
  // TODO: validate video urls
  if (videoId === valid) return true;
  return false;
}

function validateVoiceChannel(message) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    message.channel.send("You need to join a voice channel first");
    return false;  
  }

  const permissions = voiceChannel.permissionsFor(voiceChannel.client.user);
  if (!permissions.has('CONNECT')) return message.channel.send("I don't have permissions to join that channel");
  if (!permissions.has('SPEAK')) return message.channel.send("I don't have permissions to speak in that channel");
  return voiceChannel;
}

async function createConnection(message) {
  // TODO: get to use this function or delete it
  const voiceChannel = message.member.voice.channel;
  if (!validateVoiceChannel(message)) return undefined;
  try {
    var connection = await voiceChannel.join();
  } catch (err) {
    console.log(`There was an error while connecting: ${err}`);
    return message.channel.send("There was an error while connecting");
  }
  console.log(connection);
  return connection;
}

async function searchSong(keywords) {
  // TODO: Display message if api quote has been reached
  let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${keywords}&key=${API_KEY}`
  let watch_url = "https://www.youtube.com/watch?v=";
  let song = {"title": '', "url": ''};
  let resp = undefined;
  try {
    resp = await axios.get(url);
  } catch (err) {
    return undefined;
  }
  console.log(resp.data);
  let songId = resp.data.items[0].id.videoId;
  song.title = resp.data.items[0].snippet.title;
  song.url = watch_url.concat(songId);
  return song;
}

async function muteVolume(message, volumeDirection) {
  // TODO: - set the volume down by 0.2 points
  //       - get to receive the dispatcher
  return;
}

async function downVolume(message, volumeDirection) {
  // TODO: set the volume down by 0.2 points

}

async function upVolume(message, volumeDirection) {
  // TODO: set the volume up by 0.2 points

}

async function addPlaylist(queue, plUrl) {
  // TODO: get a playlist url and add every song to the queue

  return queue;
}
module.exports = {playSingle, stopSong, resumeQueue, skipQueue, searchSong, validateVoiceChannel};
