// utils.js
// import { chunkArray, toEmbedUrl } from 'https://mimic-server-api.vercel.app/videos';

// fetch("https://mimic-server-api.vercel.app/videos")
//   .then(res => res.json())
//   .then(data => {
//     const videos = data.videos;
    
//     // Split into playlists of 15
//     const playlists = chunkArray(videos, 15);

//     playlists.forEach((playlist, index) => {
//       console.log(`Playlist ${index+1}`, playlist);
//     });

//     // Convert first video's URL to embed
//     if (videos[0]) {
//       const embedUrl = toEmbedUrl(videos[0].url); 
//       console.log("Embed URL:", embedUrl);
//     }
//   });

