
  // ===================== DESCRIPTION TOGGLE =====================
  const descriptionContainer = document.getElementById('videoDescription');
  const toggleDescriptionBtn = document.getElementById('toggleDescriptionBtn');
  console.log(descriptionContainer);
  console.log(toggleDescriptionBtn);
  
  
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
  

  // ===================== COMMENTS =====================
  let comments = [
    {
      author: 'Alice',
      avatar: 'https://via.placeholder.com/40',
      text: 'This is awesome!',
      time: '2 hours ago'
    },
    {
      author: 'Bob',
      avatar: 'https://via.placeholder.com/40',
      text: 'Loved it!',
      time: '1 hour ago'
    }
  ];
  
  const commentInput = document.getElementById('commentInput');
  const postCommentBtn = document.getElementById('postCommentBtn');
  const commentsList = document.getElementById('commentsList');
  
  function renderComments() {
    commentsList.innerHTML = comments.map(c => `
      <div class="comment">
        <img src="${c.avatar}" alt="${c.author}" width="40" height="40">
        <div>
          <div><strong>${c.author}</strong> <span class="text-muted">• ${c.time}</span></div>
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
      text: text,
      time: 'Just now'
    });
    commentInput.value = '';
    renderComments();
  });
  
  renderComments();

// ======= Convert YouTube URL to Embed URL =======
function toEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return url;
}

// ======= DOM Elements =======
const videoPlayer = document.getElementById('videoPlayer');   // <iframe>
const videoTitle = document.getElementById('videoTitle');     // <h4>
const videoViews = document.getElementById('videoViews');     // <p>
const recommended = document.getElementById('recommendedVideos');
const viewMoreBtn = document.getElementById('viewMoreBtn');
console.log(videoPlayer);
console.log(videoTitle);
console.log(videoViews);

// ======= Get Current Video ID =======
const urlParams = new URLSearchParams(window.location.search);
const currentVideoId = urlParams.get('id');

// ======= Recommended Videos Logic =======
let recommendedList = [];
let currentIndex = 0;
const pageSize = 10;

function renderRecommended() {
  const visibleVideos = recommendedList.slice(0, currentIndex);
  recommended.innerHTML = visibleVideos.map(video => {
    const thumb = video.thumbnail?.fallback || 'https://via.placeholder.com/168x94';
    return `
      <div class="card mb-2 video-card">
        <a href="video.html?id=${video.id}" class="d-flex text-decoration-none text-dark">
          <img src="${thumb}" alt="${video.videoTitle}" style="width:168px;height:94px;object-fit:cover;">
          <div class="p-2">
            <h6 class="mb-1" style="font-size:14px;">${video.videoTitle}</h6>
            <small class="text-muted">MyTube Channel • ${video.views || 0} views</small>
          </div>
        </a>
      </div>
    `;
  }).join('');

  viewMoreBtn.style.display = currentIndex >= recommendedList.length ? 'none' : 'block';
}

async function loadPage() {
  try {
    const res = await fetch('https://mimic-server-api.vercel.app/videos');
    const data = await res.json();
    const videos = Array.isArray(data) ? data : data.videos;

    // 1. Find current video
    const currentVideo = videos.find(v => String(v.id) === String(currentVideoId)) || videos[0];

    // 2. Load the iframe player
    videoPlayer.src = toEmbedUrl(currentVideo.link);
    videoTitle.textContent = currentVideo.videoTitle;
    videoViews.textContent = `${currentVideo.views || 0} views`;
    
    const descEl = document.getElementById('videoDescription');
    descEl.textContent = currentVideo.description || 'No description available.';


    // 3. Prepare recommended list
    recommendedList = videos.filter(v => String(v.id) !== String(currentVideo.id));
    currentIndex = pageSize;
    renderRecommended();

  } catch (err) {
    console.error('Error fetching videos:', err);
    recommended.innerHTML = `<p class="text-danger">Error loading recommended videos.</p>`;
  }
}

// Handle “View More” button
viewMoreBtn.addEventListener('click', () => {
  currentIndex += pageSize;
  renderRecommended();
});

// ======= Load everything =======
loadPage();

