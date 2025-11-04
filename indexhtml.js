/* mytube.js - single file for all pages */

/* ===================== HELPERS / UTILS ===================== */
function toEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

async function fetchVideos() {
  try {
    const res = await fetch('https://mimic-server-api.vercel.app/videos');
    const data = await res.json();
    return Array.isArray(data) ? data : data.videos || [];
  } catch (err) {
    console.error('Error fetching videos:', err);
    return [];
  }
}

function safeGet(id) { return document.getElementById(id); }


// ====== SEARCH FILTER ======
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

function filterVideos() {
  const term = searchInput.value.toLowerCase();
  const filtered = videos.filter(v => v.title.toLowerCase().includes(term));
  renderVideos(filtered);
}

searchBtn.addEventListener('click', filterVideos);
searchInput.addEventListener('keyup', e => {
  if (e.key === 'Enter') filterVideos();
}); 


/* ===================== THEME & NOTIFICATIONS ===================== */
function initThemeAndNotifications() {
  const themeToggle = safeGet('themeToggle');
  const notificationBadge = safeGet('notificationBadge');
  const notificationsList = safeGet('notificationsList');

  // Theme
  if (themeToggle) {
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggle.textContent = '☀️ Light Mode';
    } else {
      themeToggle.textContent = '🌙 Dark Mode';
    }

    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    });
  }

  // Notifications (simple localStorage-backed)
  let notifications = JSON.parse(localStorage.getItem('mytubeNotifications')) || [];
  function renderNotifications() {
    if (!notificationsList) return;
    if (notifications.length === 0) {
      notificationsList.innerHTML = '<p class="text-muted">No notifications.</p>';
      if (notificationBadge) notificationBadge.style.display = 'none';
      return;
    }
    notificationsList.innerHTML = notifications.map(n => `
      <div class="notification-item mb-2">
        <div>${n.text}</div>
        <div class="text-muted" style="font-size:11px;">${n.time}</div>
      </div>
    `).join('');
    if (notificationBadge) {
      notificationBadge.style.display = 'inline-block';
      notificationBadge.textContent = notifications.length;
    }
  }
  function addNotification(text) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    notifications.unshift({ text, time });
    if (notifications.length > 50) notifications.pop();
    localStorage.setItem('mytubeNotifications', JSON.stringify(notifications));
    renderNotifications();
  }

  renderNotifications();
  // sample periodic fake notifications (only if user sees notificationsList)
  if (notificationsList) {
    setInterval(() => {
      const events = [
        "New video uploaded: How to Learn JavaScript",
        "New comment on your video",
        "New video uploaded: CSS Tricks for Beginners",
        "New subscriber joined your channel"
      ];
      addNotification(events[Math.floor(Math.random() * events.length)]);
    }, 30000);
  }
}

/* ===================== SIDEBAR TOGGLE (GLOBAL) ===================== */
function initSidebarToggle() {
  const toggleBtn = safeGet('toggleSidebar');
  const sidebar = safeGet('sidebar');
  const content = safeGet('content') || safeGet('mainContent') || document.body;

  if (!toggleBtn || !sidebar || !content) return;

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    content.classList.toggle('expanded');
  });

  // collapse on small screens initially
  if (window.innerWidth < 992) {
    sidebar.classList.add('collapsed');
    content.classList.add('expanded');
  }
}

/* ===================== HOME / INDEX - VIDEOS GRID ===================== */
async function renderHomeVideos() {
  const videoContainer = safeGet('videoContainer');
  if (!videoContainer) return;

  try {
    const videos = await fetchVideos();
    if (videos.length === 0) {
      videoContainer.innerHTML = '<p class="text-muted">No videos found.</p>';
      return;
    }

    // save a copy locally for watch page quick load (optional)
    localStorage.setItem('mytubeFetchedVideos', JSON.stringify(videos));

    videoContainer.innerHTML = videos.map(video => {
      const thumb =
        video.thumbnail?.maxres ||
        video.thumbnail?.fallback ||
        'https://via.placeholder.com/300x180?text=No+Thumbnail';
      const title = video.videoTitle || video.title || 'Untitled';
      const views = video.views || 0;
      return `
        <div class="col-12 col-md-6 col-lg-4 mb-3">
          <div class="card video-card">
            <a href="video.html?id=${video.id}" class="text-decoration-none text-dark">
              <img src="${thumb}" class="card-img-top" alt="${title}" style="height:180px;object-fit:cover;">
            </a>
            <div class="card-body">
              <h6 class="card-title">${title}</h6>
              <p class="card-text text-muted">MyTube Channel • ${views} views</p>
              <button class="btn btn-sm btn-outline-primary add-watch-later"
                      data-id="${video.id}"
                      data-title="${title}"
                      data-thumb="${thumb}"
                      data-views="${views}">
                + Watch Later
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error rendering home videos:', err);
    if (videoContainer) videoContainer.innerHTML = `<p class="text-danger">Error loading videos.</p>`;
  }
}


/* ===================== HISTORY PAGE ===================== */
function renderHistoryPage() {
  const historyContainer = safeGet('historyContainer');
  if (!historyContainer) return;
  const history = JSON.parse(localStorage.getItem('mytubeHistory')) || [];
  if (history.length === 0) {
    historyContainer.innerHTML = '<p class="text-muted">No videos watched yet.</p>';
    return;
  }
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
    </div>
  `).join('');
}

/* ===================== PLAYLIST PAGE ===================== */
async function renderPlaylistPage() {
  const playlistVideos = safeGet('playlistVideos');
  const playlistTitle = safeGet('playlistTitle');
  if (!playlistVideos) return;

  const urlParams = new URLSearchParams(window.location.search);
  const playlistId = parseInt(urlParams.get('id')) || 0;

  try {
    let videos = await fetchVideos();
    // fallback to previously fetched
    if (!videos || videos.length === 0) videos = JSON.parse(localStorage.getItem('mytubeFetchedVideos')) || [];

    // make playlists of 15 each
    const playlists = [];
    for (let i = 0; i < videos.length; i += 15) playlists.push(videos.slice(i, i + 15));

    const selected = playlists[playlistId];
    if (!selected) {
      playlistVideos.innerHTML = `<p class="text-danger">Playlist not found.</p>`;
      return;
    }

    if (playlistTitle) playlistTitle.textContent = `Playlist ${playlistId + 1}`;

    playlistVideos.innerHTML = selected.map(video => `
      <div class="col-12 col-md-6 col-lg-4 mb-3">
        <div class="card video-card">
          <a href="video.html?id=${video.id}">
            <img src="${video.thumbnail?.fallback || 'https://via.placeholder.com/300x180'}" class="card-img-top" alt="${video.videoTitle}">
          </a>
          <div class="card-body">
            <h6 class="card-title">${video.videoTitle}</h6>
            <p class="card-text text-muted">MyTube Channel • ${video.views} views</p>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading playlist:', err);
    playlistVideos.innerHTML = `<p class="text-danger">Error loading playlist.</p>`;
  }
}

/* ===================== WATCH LATER PAGE ===================== */
function renderWatchLaterPage() {
  const watchLaterContainer = safeGet('watchLaterContainer');
  if (!watchLaterContainer) return;
  const watchLater = JSON.parse(localStorage.getItem('mytubeWatchLater')) || [];
  if (watchLater.length === 0) {
    watchLaterContainer.innerHTML = '<p class="text-muted">No videos saved for later.</p>';
    return;
  }
  watchLaterContainer.innerHTML = watchLater.map(video => `
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
    </div>
  `).join('');
}

/* ===================== DESCRIPTION TOGGLE (WATCH PAGE) ===================== */
function initDescriptionToggle() {
  const descriptionContainer = safeGet('descriptionContainer') || safeGet('videoDescription');
  const toggleDescriptionBtn = safeGet('toggleDescriptionBtn');
  if (!descriptionContainer || !toggleDescriptionBtn) return;

  // set initial text according to collapsed state
  toggleDescriptionBtn.textContent = descriptionContainer.classList.contains('collapsed-description') ? 'Show more' : 'Show less';

  toggleDescriptionBtn.addEventListener('click', () => {
    const isCollapsed = descriptionContainer.classList.contains('collapsed-description');
    if (isCollapsed) {
      descriptionContainer.classList.remove('collapsed-description');
      descriptionContainer.classList.add('expanded-description');
      toggleDescriptionBtn.textContent = 'Show less';
    } else {
      descriptionContainer.classList.remove('expanded-description');
      descriptionContainer.classList.add('collapsed-description');
      toggleDescriptionBtn.textContent = 'Show more';
    }
  });
}

/* ===================== COMMENTS (WATCH PAGE) ===================== */
function initComments() {
  const commentInput = safeGet('commentInput');
  const postCommentBtn = safeGet('postCommentBtn');
  const commentsList = safeGet('commentsList');

  if (!commentInput || !postCommentBtn || !commentsList) return;

  // load from localStorage per video? For simplicity, use memory per page (could be enhanced)
  let comments = [
    { author: 'Alice', avatar: 'https://via.placeholder.com/40', text: 'This is awesome!', time: '2 hours ago' },
    { author: 'Bob', avatar: 'https://via.placeholder.com/40', text: 'Loved it!', time: '1 hour ago' }
  ];

  function renderComments() {
    commentsList.innerHTML = comments.map(c => `
      <div class="comment d-flex mb-2">
        <img src="${c.avatar}" alt="${c.author}" width="40" height="40" class="me-2 rounded-circle">
        <div>
          <strong>${c.author}</strong> <small class="text-muted">• ${c.time}</small>
          <div>${c.text}</div>
        </div>
      </div>
    `).join('');
  }

  postCommentBtn.addEventListener('click', () => {
    const text = commentInput.value.trim();
    if (!text) return;
    comments.unshift({
      author: 'You',
      avatar: 'https://via.placeholder.com/40',
      text,
      time: 'Just now'
    });
    commentInput.value = '';
    renderComments();
  });

  renderComments();
}

/* ===================== RECOMMENDED VIDEOS (WATCH PAGE) ===================== */
let recommendedList = [];
let currentIndex = 0;
const pageSize = 10;

function renderRecommended(recommendedContainer, viewMoreBtn) {
  if (!recommendedContainer) return;
  const visibleVideos = recommendedList.slice(0, currentIndex);
  recommendedContainer.innerHTML = visibleVideos.map(video => {
    const thumb = video.thumbnail?.fallback || 'https://via.placeholder.com/168x94';
    const title = video.videoTitle || video.title || 'Untitled';
    return `
      <div class="card mb-2 video-card">
        <a href="video.html?id=${video.id}" class="d-flex text-decoration-none text-dark">
          <img src="${thumb}" alt="${title}" style="width:168px;height:94px;object-fit:cover;">
          <div class="p-2">
            <h6 class="mb-1" style="font-size:14px;">${title}</h6>
            <small class="text-muted">MyTube Channel • ${video.views || 0} views</small>
          </div>
        </a>
      </div>
    `;
  }).join('');

  if (viewMoreBtn) viewMoreBtn.style.display = currentIndex >= recommendedList.length ? 'none' : 'block';
}

/* ===================== WATCH LATER HANDLER (GLOBAL) ===================== */
function addToWatchLater(video) {
  let watchLater = JSON.parse(localStorage.getItem('mytubeWatchLater')) || [];
  if (!watchLater.some(v => String(v.id) === String(video.id))) {
    watchLater.unshift(video);
    localStorage.setItem('mytubeWatchLater', JSON.stringify(watchLater));
    // simple feedback - replace with a toast if you want
    alert(`Added "${video.title}" to Watch Later`);
  } else {
    alert('Already in Watch Later');
  }
}

// delegate add-watch-later buttons across pages
document.addEventListener('click', function (e) {
  const target = e.target;
  if (!target) return;
  // supports clicking the button or an inner element
  const btn = target.closest && target.closest('.add-watch-later');
  if (btn) {
    e.preventDefault();
    const video = {
      id: btn.dataset.id,
      title: btn.dataset.title,
      thumbnail: btn.dataset.thumb,
      views: btn.dataset.views
    };
    addToWatchLater(video);
  }
});

/* ===================== VIDEO PAGE LOADER ===================== */
async function loadVideoPage() {
  const videoPlayer = safeGet('videoPlayer');
  const videoTitle = safeGet('videoTitle');
  const videoViews = safeGet('videoViews');
  const recommendedContainer = safeGet('recommendedVideos');
  const viewMoreBtn = safeGet('viewMoreBtn');
  const descEl = safeGet('videoDescription') || safeGet('descriptionContainer');

  if (!videoPlayer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const currentVideoId = urlParams.get('id');

  try {
    const videos = await fetchVideos();
    const currentVideo = videos.find(v => String(v.id) === String(currentVideoId)) || videos[0] || {};

    // Player & meta
    videoPlayer.src = toEmbedUrl(currentVideo.link || currentVideo.videoUrl || currentVideo.url || '');
    if (videoTitle) videoTitle.textContent = currentVideo.videoTitle || currentVideo.title || 'Untitled';
    if (videoViews) videoViews.textContent = `${currentVideo.views || 0} views`;
    if (descEl) descEl.textContent = currentVideo.description || 'No description available.';

    // Save to watch history (localStorage)
    try {
      const historyKey = 'mytubeHistory';
      const history = JSON.parse(localStorage.getItem(historyKey)) || [];
      const videoObj = {
        id: currentVideo.id,
        title: currentVideo.videoTitle || currentVideo.title || 'Untitled',
        thumbnail: currentVideo.thumbnail?.fallback || currentVideo.thumbnail || '',
        views: currentVideo.views || 0,
        time: new Date().toISOString()
      };
      // Remove any existing (same id) then unshift
      const existingIndex = history.findIndex(h => String(h.id) === String(videoObj.id));
      if (existingIndex !== -1) history.splice(existingIndex, 1);
      history.unshift(videoObj);
      // keep limited history
      if (history.length > 200) history.length = 200;
      localStorage.setItem(historyKey, JSON.stringify(history));
    } catch (err) { console.warn('Failed to write history', err); }

    // Recommended
    recommendedList = (videos || []).filter(v => String(v.id) !== String(currentVideo.id));
    currentIndex = pageSize;
    renderRecommended(recommendedContainer, viewMoreBtn);

    if (viewMoreBtn) {
      viewMoreBtn.addEventListener('click', () => {
        currentIndex += pageSize;
        renderRecommended(recommendedContainer, viewMoreBtn);
      });
    }
  } catch (err) {
    console.error('Error loading video page:', err);
    if (recommendedContainer) recommendedContainer.innerHTML = `<p class="text-danger">Error loading recommended videos.</p>`;
  }
}

/* ===================== ROUTING - RUN ONLY NECESSARY PARTS ===================== */
document.addEventListener('DOMContentLoaded', () => {
  // global UI
  initSidebarToggle();
  initThemeAndNotifications();

  // page-specific
  const path = window.location.pathname.toLowerCase();

  // index/home pages
  if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
    renderHomeVideos();
  }

  // history page
  if (path.includes('history.html')) {
    renderHistoryPage();
  }

  // playlist page
  if (path.includes('playlist.html')) {
    renderPlaylistPage();
  }

  // watch later page
  if (path.includes('watchlater.html')) {
    renderWatchLaterPage();
  }

  // watch/video page
  if (path.includes('video.html') || path.includes('watch.html') || path.includes('watch')) {
    initDescriptionToggle();
    initComments();
    loadVideoPage();
  }
});
