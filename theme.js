// theme.js – Dark / Light + Notifications
document.addEventListener("DOMContentLoaded", () => {
  const notificationBadge = document.getElementById('notificationBadge');
  const notificationsList = document.getElementById('notificationsList');
  const themeToggle = document.getElementById('themeToggle');

  let notifications = JSON.parse(localStorage.getItem('mytubeNotifications')) || [];

  function renderNotifications() {
    if (!notificationsList) return;
    if (notifications.length === 0) {
      notificationsList.innerHTML = '<p class="text-muted">No notifications.</p>';
      if (notificationBadge) notificationBadge.style.display = 'none';
      return;
    }
    notificationsList.innerHTML = notifications.map(n => `
      <div class="notification-item">
        <small>${n.text}</small>
        <div class="text-muted" style="font-size:10px;">${n.time}</div>
      </div>`).join('');
    if (notificationBadge) {
      notificationBadge.style.display = 'inline-block';
      notificationBadge.textContent = notifications.length;
    }
  }

  function addNotification(text) {
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    notifications.unshift({ text, time });
    if (notifications.length > 50) notifications.pop();
    localStorage.setItem('mytubeNotifications', JSON.stringify(notifications));
    renderNotifications();
  }

  renderNotifications();
  setInterval(() => {
    const events = [
      "New video uploaded: How to Learn JavaScript",
      "New comment on your video",
      "New video uploaded: CSS Tricks for Beginners",
      "New subscriber joined your channel"
    ];
    addNotification(events[Math.floor(Math.random() * events.length)]);
  }, 30000);

  // Theme
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggle) themeToggle.textContent = '☀️ Light Mode';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    });
  }
});
