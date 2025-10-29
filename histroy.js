// historyPage.js
document.addEventListener("DOMContentLoaded", () => {
  const historyContainer = document.getElementById('historyContainer');
  if (!historyContainer) return;

  const history = JSON.parse(localStorage.getItem('mytubeHistory')) || [];
  if (history.length === 0) {
    historyContainer.innerHTML = '<p class="text-muted">No videos watched yet.</p>';
  } else {
    historyContainer.innerHTML = history.map(video => `
      <div class="col-12 col-md-6 col-lg-4 mb-3">
        <div class="card video-card">
          <a href="video.html?id=${video.id}">
            <img src="${video.thumbnail}" class="card-img-top" alt="${video.title}">
          </a>
          <div class="card-body">
            <h6 class="card-title">${video.title}</h6>
            <p class="card-text text-muted">MyTube Channel • ${video.views} views</p>
          </div>
        </div>
      </div>`).join('');
  }
});
