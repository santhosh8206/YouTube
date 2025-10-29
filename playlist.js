// playlistPage.js – For playlists/playlistX.html
document.addEventListener("DOMContentLoaded", async () => {
  const playlistVideos = document.getElementById('playlistVideos');
  const playlistTitle = document.getElementById('playlistTitle');
  if (!playlistVideos) return;

  const urlParams = new URLSearchParams(window.location.search);
  const playlistId = parseInt(urlParams.get('id'));

  try {
    const res = await fetch('https://mimic-server-api.vercel.app/videos');
    let videos = await res.json();
    if (videos && videos.videos) videos = videos.videos;

    const playlists = [];
    for (let i = 0; i < videos.length; i += 15) {
      playlists.push(videos.slice(i, i + 15));
    }

    const selectedPlaylist = playlists[playlistId];
    if (!selectedPlaylist) {
      playlistVideos.innerHTML = `<p class="text-danger">Playlist not found.</p>`;
      return;
    }

    playlistTitle.textContent = `Playlist ${playlistId + 1}`;
    playlistVideos.innerHTML = selectedPlaylist.map(video => `
      <div class="col-12 col-md-6 col-lg-4 mb-3">
        <div class="card video-card">
          <a href="../video.html?id=${video.id}">
            <img src="${video.thumbnail.fallback}" class="card-img-top" alt="${video.videoTitle}">
          </a>
          <div class="card-body">
            <h6 class="card-title">${video.videoTitle}</h6>
            <p class="card-text text-muted">MyTube Channel • ${video.views} views</p>
          </div>
        </div>
      </div>`).join('');
  } catch (err) {
    playlistVideos.innerHTML = `<p class="text-danger">Error loading playlist.</p>`;
  }
});
