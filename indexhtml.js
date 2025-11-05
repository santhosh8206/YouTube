


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

/* ===================== GLOBALS / PAGINATION ===================== */
let allVideos = [];
let currentPage = 1;
const videosPerPage = 12;
let recommendedList = [];
let recommendedIndex = 0;
const recommendedPageSize = 6;

/* ===================== THEME & NOTIFICATIONS ===================== */
function initThemeAndNotifications() {
  const themeToggle = safeGet('themeToggle');
  const notificationBadge = safeGet('notificationBadge');
  const notificationsList = safeGet('notificationsList');

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
    const time = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    notifications.unshift({ text, time });
    if (notifications.length > 50) notifications.pop();
    localStorage.setItem('mytubeNotifications', JSON.stringify(notifications));
    renderNotifications();
  }

  renderNotifications();
  if (notificationsList) {
    setInterval(() => {
      const events = [
        "New video uploaded: How to Learn JavaScript",
        "New comment on your video",
        "New video uploaded: CSS Tricks for Beginners",
        "New subscriber joined your channel"
      ];
      addNotification(events[Math.floor(Math.random()*events.length)]);
    }, 30000);
  }
}

/* ===================== SIDEBAR TOGGLE ===================== */
function initSidebarToggle() {
  const toggleBtn = safeGet('toggleSidebar');
  const sidebar = safeGet('sidebar');
  const content = safeGet('content') || safeGet('mainContent') || document.body;

  if (!toggleBtn || !sidebar || !content) return;
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    content.classList.toggle('expanded');
  });
  if (window.innerWidth < 992) {
    sidebar.classList.add('collapsed');
    content.classList.add('expanded');
  }
  document.addEventListener('click', (e) => {
    if (window.innerWidth < 992 && !sidebar.classList.contains('collapsed')) {
      const inside = sidebar.contains(e.target);
      const isToggle = toggleBtn.contains(e.target);
      if (!inside && !isToggle) {
        sidebar.classList.add('collapsed');
        content.classList.add('expanded');
      }
    }
  });
}

/* ===================== HOME / INDEX - VIDEOS GRID ===================== */
async function renderHomeVideos() {
  const videoContainer = safeGet('videoContainer');
  const loadMoreBtn = safeGet('loadMoreBtn');
  const searchInput = safeGet('searchInput');
  const searchBtn = safeGet('searchBtn');

  if (!videoContainer) return;

  if (allVideos.length === 0) {
    videoContainer.innerHTML = `<div class="text-center my-4"><div class="spinner-border" role="status"></div></div>`;
    allVideos = await fetchVideos();
  }

  function render(list, page) {
    const start = 0;
    const end = page * videosPerPage;
    const visible = list.slice(start, end);

    if (!visible.length) {
      videoContainer.innerHTML = `<p class="text-center text-muted mt-4">No results found.</p>`;
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    videoContainer.innerHTML = visible.map(video => {
      const thumb = video.thumbnail?.maxres || video.thumbnail?.fallback || 'https://via.placeholder.com/300x180?text=No+Thumbnail';
      const title = video.videoTitle || video.title || 'Untitled';
      const views = video.views || 0;
      const darkClass = document.body.classList.contains('dark-mode') ? 'text-light' : 'text-dark';
      return `
        <div class="col-12 col-md-6 col-lg-4 mb-3">
          <div class="card video-card h-100">
            <a href="video.html?id=${video.id}" class="text-decoration-none ${darkClass}">
              <img src="${thumb}" class="card-img-top" alt="${title}" style="height:180px;object-fit:cover;">
            </a>
            <div class="card-body">
              <h6 class="card-title">${title}</h6>
              <p class="card-text text-muted">MyTube Channel • ${views} views</p>
              <button class="add-watch-later btn btn-sm btn-outline-primary "
                data-id="${video.id}"
                data-title="${title}"
                data-thumb="${thumb}"
                data-views="${views}">
                + Watch Later
              </button>
               <button class="add-playlist btn btn-sm btn-primary" 
        data-id="${video.id}" 
        data-title="${video.title}"
        data-thumb="${video.thumbnail}"
        data-channel="${video.channel}"
        data-views="${video.views}">
        ➕ Playlist
</button>
            </div>
          </div>
        </div>`;
    }).join('');

    if (loadMoreBtn) loadMoreBtn.style.display = list.length > end ? 'block' : 'none';
  }

  render(allVideos, currentPage);

  if (loadMoreBtn) {
    loadMoreBtn.onclick = () => {
      currentPage++;
      render(allVideos, currentPage);
    };
  }

  function filterVideos() {
    const term = (searchInput.value || '').toLowerCase();
    const filtered = allVideos.filter(v => (v.videoTitle || v.title || '').toLowerCase().includes(term));
    currentPage = 1;
    render(filtered, currentPage);
  }

  if (searchBtn) searchBtn.addEventListener('click', filterVideos);
  if (searchInput) searchInput.addEventListener('keyup', e => { if (e.key==='Enter') filterVideos(); });
}
/* ===================== 🕒 WATCH LATER HANDLER ===================== */
function addToWatchLater(video) {
  if (!video || !video.id) return;

  let watchLater = JSON.parse(localStorage.getItem('mytubeWatchLater')) || [];

  // prevent duplicates
  if (watchLater.some(v => String(v.id) === String(video.id))) {
    showToast('⚠️ Already in Watch Later');
    return;
  }

  // add new video at the top
  watchLater.unshift(video);
  localStorage.setItem('mytubeWatchLater', JSON.stringify(watchLater));

  showToast(`✅ Added "${video.title}" to Watch Later`);
}

// Event delegation for Watch Later button clicks
document.addEventListener('click', e => {
  const btn = e.target.closest('.add-watch-later');
  if (!btn) return;
  e.preventDefault();

  // Get video details from data attributes
  const video = {
    id: btn.dataset.id,
    title: btn.dataset.title,
    thumbnail: btn.dataset.thumb,
    views: btn.dataset.views,
    channel: btn.dataset.channel || "Unknown Channel"
  };

  addToWatchLater(video);
});
/* ===================== PLAYLIST HANDLER ===================== */
function addToPlaylist(video, playlistName = "My Favorites") {
  try {
    let playlists = JSON.parse(localStorage.getItem("mytubePlaylists")) || {};

    // Ensure structure
    if (!playlists[playlistName]) playlists[playlistName] = [];

    // Avoid duplicates
    const alreadyExists = playlists[playlistName].some(v => String(v.id) === String(video.id));

    if (!alreadyExists) {
      playlists[playlistName].unshift(video);
      localStorage.setItem("mytubePlaylists", JSON.stringify(playlists));
      console.log(`✅ Added "${video.title}" to "${playlistName}"`);
      alert(`Added "${video.title}" to ${playlistName}`);
    } else {
      alert(`"${video.title}" already in ${playlistName}`);
    }

  } catch (error) {
    console.error("❌ Playlist save failed:", error);
    alert("Error saving to playlist. Check console for details.");
  }
}

// Listen for clicks on "Add to Playlist" buttons
document.addEventListener("click", e => {
  const btn = e.target.closest(".add-playlist");
  if (!btn) return;

  e.preventDefault();

  const video = {
    id: btn.dataset.id,
    title: btn.dataset.title,
    thumbnail: btn.dataset.thumb,
    channel: btn.dataset.channel || "Unknown Channel",
    views: btn.dataset.views || "0 views"
  };

  const playlistName = prompt("Enter playlist name:", "My Favorites");
  if (!playlistName) return;

  addToPlaylist(video, playlistName.trim());
});


/* ===================== 🔔 TOAST MESSAGE ===================== */
function showToast(message) {
  let toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.textContent = message;
  document.body.appendChild(toast);

  // animate and remove
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
function renderVideos(videos) {
  const videoGrid = document.getElementById("videoGrid");
  if (!videoGrid) return console.error("❗ videoGrid not found in DOM");

  videoGrid.innerHTML = videos.map(v => `
    <div class="video-card" data-id="${v.id}">
      <img src="${v.thumbnail}" alt="${v.title}">
      <div class="info">
        <h6>${v.title}</h6>
        <small>${v.channel}</small>
      </div>
      <div class="video-actions">
        <button 
          class="add-watch-later"
          data-id="${v.id}"
          data-title="${v.title}"
          data-thumb="${v.thumbnail}"
          data-views="${v.views}"
          data-channel="${v.channel}"
        >⏰ Watch Later</button>
        <button class="add-playlist" 
        data-id="${video.id}" 
        data-title="${video.title}"
        data-thumb="${video.thumbnail}"
        data-channel="${video.channel}"
        data-views="${video.views}">
        ➕ Playlist
</button>

      </div>
    </div>
  `).join("");
}

/* ===================== DESCRIPTION TOGGLE (WATCH PAGE) ===================== */
function initDescriptionToggle() {
  const desc = safeGet('descriptionContainer') || safeGet('videoDescription');
  const toggleBtn = safeGet('toggleDescriptionBtn');
  if (!desc || !toggleBtn) return;

  if (!desc.classList.contains('expanded-description')) {
    desc.classList.add('collapsed-description');
  }
  toggleBtn.textContent = desc.classList.contains('collapsed-description') ? 'Show more' : 'Show less';
  toggleBtn.addEventListener('click', () => {
    const isCollapsed = desc.classList.contains('collapsed-description');
    if (isCollapsed) {
      desc.classList.remove('collapsed-description');
      desc.classList.add('expanded-description');
      toggleBtn.textContent = 'Show less';
    } else {
      desc.classList.remove('expanded-description');
      desc.classList.add('collapsed-description');
      toggleBtn.textContent = 'Show more';
    }
  });
}

/* ===================== COMMENTS (WATCH PAGE) ===================== */
function initComments(videoId) {
  const commentInput = safeGet('commentInput');
  const postCommentBtn = safeGet('postCommentBtn');
  const commentsList = safeGet('commentsList');
  if (!commentInput || !postCommentBtn || !commentsList) return;

  const storageKey = videoId ? `comments_${videoId}` : 'comments_global';
  let comments = JSON.parse(localStorage.getItem(storageKey)) || [
    { author:'Alice', avatar:'https://via.placeholder.com/40', text:'This is awesome!', time:'2 hours ago' },
    { author:'Bob',   avatar:'https://via.placeholder.com/40', text:'Loved it!',      time:'1 hour ago' }
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
    const newC = { author:'You', avatar:'https://via.placeholder.com/40', text, time:'Just now' };
    comments.unshift(newC);
    if (comments.length > 200) comments.length = 200;
    localStorage.setItem(storageKey, JSON.stringify(comments));
    commentInput.value = '';
    renderComments();
  });

  renderComments();
}

/* ===================== RECOMMENDED VIDEOS (WATCH PAGE) ===================== */
function renderRecommended(recommendedContainer, viewMoreBtn) {
  if (!recommendedContainer) return;
  const visible = recommendedList.slice(0, recommendedIndex);
  recommendedContainer.innerHTML = visible.map(video => {
    const thumb = video.thumbnail?.fallback || 'https://via.placeholder.com/168x94';
    const title = video.videoTitle || video.title || 'Untitled';
    const darkClass = document.body.classList.contains('dark-mode') ? 'text-light' : 'text-dark';
    return `
      <div class="card mb-2 video-card h-100">
        <a href="video.html?id=${video.id}" class="d-flex text-decoration-none ${darkClass}">
          <img src="${thumb}" alt="${title}" style="width:168px;height:94px;object-fit:cover;">
          <div class="p-2">
            <h6 class="mb-1" style="font-size:14px;">${title}</h6>
            <small class="text-muted">MyTube Channel • ${video.views || 0} views</small>
          </div>
        </a>
      </div>`;
  }).join('');

  if (viewMoreBtn) viewMoreBtn.style.display = recommendedIndex >= recommendedList.length ? 'none' : 'block';
}

/* ===================== VIDEO PAGE LOADER ===================== */
async function loadVideoPage() {
  const videoPlayer = safeGet('videoPlayer');
  const videoTitle = safeGet('videoTitle');
  const videoViews = safeGet('videoViews');
  const descriptionContainer = safeGet('videoDescription') || safeGet('descriptionContainer');
  const recommendedContainer = safeGet('recommendedVideos');
  const viewMoreBtn = safeGet('viewMoreBtn');

  if (!videoPlayer) return;

  videoTitle && (videoTitle.textContent = 'Loading...');
  const params = new URLSearchParams(window.location.search);
  const currentVideoId = params.get('id');

  try {
    const videos = await fetchVideos();
    if (!allVideos.length) allVideos = videos;

    const currentVideo = videos.find(v => String(v.id) === String(currentVideoId)) || videos[0] || {};

    if (videoPlayer.tagName.toLowerCase() === 'iframe') {
      videoPlayer.src = toEmbedUrl(currentVideo.link || currentVideo.videoUrl || currentVideo.url || '');
    } else {
      videoPlayer.innerHTML = `<iframe src="${toEmbedUrl(currentVideo.link || currentVideo.videoUrl || currentVideo.url || '')}" allowfullscreen style="width:100%;height:100%;border:none;"></iframe>`;
    }

    videoTitle && (videoTitle.textContent = currentVideo.videoTitle || currentVideo.title || 'Untitled');
    videoViews && (videoViews.textContent = `${currentVideo.views || 0} views`);
    descriptionContainer && (descriptionContainer.textContent = currentVideo.description || 'No description available.');

    // Save history
    try {
      const historyKey = 'mytubeHistory';
      const history = JSON.parse(localStorage.getItem(historyKey)) || [];
      const obj = {
        id: currentVideo.id,
        title: currentVideo.videoTitle || currentVideo.title || 'Untitled',
        thumbnail: currentVideo.thumbnail?.fallback || currentVideo.thumbnail || '',
        views: currentVideo.views || 0,
        time: new Date().toISOString()
      };
      const exi = history.findIndex(h => String(h.id) === String(obj.id));
      if (exi >= 0) history.splice(exi,1);
      history.unshift(obj);
      if (history.length > 200) history.length = 200;
      localStorage.setItem(historyKey, JSON.stringify(history));
    } catch(err) {
      console.warn('History save failed', err);
    }

    // Recommended
    recommendedList = videos.filter(v => String(v.id) !== String(currentVideo.id));
    recommendedIndex = recommendedPageSize;
    renderRecommended(recommendedContainer, viewMoreBtn);
    if (viewMoreBtn) viewMoreBtn.onclick = () => {
      recommendedIndex += recommendedPageSize;
      renderRecommended(recommendedContainer, viewMoreBtn);
    };

    initDescriptionToggle();
    initComments(currentVideo.id);

  } catch (err) {
    console.error('Error loading video page:', err);
    if (videoTitle) videoTitle.textContent = 'Error loading video';
    if (recommendedContainer) recommendedContainer.innerHTML = '<p class="text-danger">Error loading recommended videos.</p>';
  }
}

/* ===================== ROUTING ===================== */
document.addEventListener('DOMContentLoaded', () => {
  initSidebarToggle();
  initThemeAndNotifications();

  const path = window.location.pathname.toLowerCase();
  if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
    renderHomeVideos();
  }
  if (path.includes('video.html') || path.includes('watch.html')) {
    loadVideoPage();
  }
});

