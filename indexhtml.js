// ===== Sidebar Toggle =====
const toggleBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
const content = document.getElementById('mainContent');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  content.classList.toggle('expanded');
});

if (window.innerWidth < 992) {
  sidebar.classList.add('collapsed');
  content.classList.add('expanded');
}

// ===== Convert YouTube URL to Embed URL =====
function toEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const match = url.match(/v=([a-zA-Z0-9_-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return url;
}

// ===== Videos Grid (THUMBNAILS) =====
const videoContainer = document.getElementById('videoContainer');

fetch('https://mimic-server-api.vercel.app/videos')
  .then(res => res.json())
  .then(data => {
    const videos = Array.isArray(data) ? data : (data.videos || []);
    if (videos.length === 0) {
      videoContainer.innerHTML = '<p>No videos found.</p>';
      return;
    }

    videoContainer.innerHTML = videos.map(video => {
      // Fallback to placeholder if no thumbnail
      const thumb =
        video.thumbnail?.maxres ||
        video.thumbnail?.fallback ||
        'https://via.placeholder.com/300x180?text=No+Thumbnail';
      return `
        <div class="col-12 col-md-6 col-lg-4 mb-3">
          <div class="card video-card">
            <a href="video.html?id=${video.id}">
              <img src="${thumb}" class="card-img-top" alt="${video.videoTitle}" style="height:180px;object-fit:cover;">
            </a>
            <div class="card-body">
              <h6 class="card-title">${video.videoTitle}</h6>
              <p class="card-text text-muted">MyTube Channel • ${video.views} views</p>
            </div>
          </div>
        </div>
      `;
    }).join('');
  })
  .catch(err => {
    console.error('Error fetching videos:', err);
    videoContainer.innerHTML = `<p class="text-danger">Error loading videos.</p>`;
  });
