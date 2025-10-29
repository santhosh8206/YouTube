// watchLater.js – Add to Watch Later
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('add-watch-later')) {
    e.preventDefault();
    const video = {
      id: e.target.dataset.id,
      title: e.target.dataset.title,
      thumbnail: e.target.dataset.thumb,
      views: e.target.dataset.views
    };
    addToWatchLater(video);
  }
});

function addToWatchLater(video) {
  let watchLater = JSON.parse(localStorage.getItem('mytubeWatchLater')) || [];
  if (!watchLater.some(v => v.id === video.id)) {
    watchLater.unshift(video);
    localStorage.setItem('mytubeWatchLater', JSON.stringify(watchLater));
    alert(`Added "${video.title}" to Watch Later`);
  } else {
    alert('Already in Watch Later');
  }
}
