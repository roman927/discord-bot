const axios = require('axios');
const api_key = process.env.API_KEY;
const {VoiceChannel} = require('discord.js');
const ytdl = require('ytdl-core');


async function playSong(message, songUrl) {
  checkVoiceChannel(message);
  const connection = await message.member.voice.channel.join();
  const dispatcher = connection.play(ytdl(songUrl, {filter: 'audioonly'}));
  dispatcher.setVolume(0.4);
}

async function stopSong(message) {
  const voiceChannel = message.member.voice.channel;
  checkVoiceChannel(message);
  voiceChannel.leave();
  console.log("leaving channel by order");
  return undefined;
}

async function resumeQueue(message, songs) {
  const connection = await message.member.voice.channel.join();
  console.log(`Now playing ${songs[0]}`);
  connection.play(ytdl(songs[0]), {filter: 'audioonly'})
    .on('finish', () => {
      songs.shift();
      resumeQueue(message, songs);
    });
}

async function skipQueue(message, songs) {
  songs.shift();
  console.log(`Songs state: ${songs}`);
  resumeQueue(message, songs);
  return message.channel.send(`Succesfuly skiped song`);
}

function checkVideoId(videoId) {
  // TODO: validate video urls
  if (videoId === valid) return true;
  return false;
}

function checkVoiceChannel(message) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return message.channel.send("You need to join a voice channel first");

  const permissions = voiceChannel.permissionsFor(voiceChannel.client.user);
  if (!permissions.has('CONNECT')) return message.channel.send("I don't have permissions to join that channel");
  if (!permissions.has('SPEAK')) return message.channel.send("I don't have permissions to speak in that channel");
  return voiceChannel;
}

async function createConnection(message) {
  // TODO: get to use this function or delete it
  const voiceChannel = message.member.voice.channel;
  checkVoiceChannel(message);
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
  let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${keywords}&key=${api_key}`
  let data = '';
  let watch_url = "https://www.youtube.com/watch?v=";
  let song = {"title": '', "url": ''};
  let resp = await axios.get(url);
  let songId = resp.data.items[0].id.videoId;
  song.title = resp.data.items[0].snippet.title;
  song.url = watch_url.concat(songId);
  return song;
}


async function muteVolume(message, volumeDirection) {
  // TODO: set the volume down by 0.2 points

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
module.exports = {playSong, stopSong, resumeQueue, skipQueue, searchSong};
