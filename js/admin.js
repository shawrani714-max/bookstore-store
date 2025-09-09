document.addEventListener('DOMContentLoaded', function() {
  // Example: Load dashboard stats
  fetch('/api/admin/stats')
    .then(res => res.json())
    .then(data => {
      document.getElementById('stats').innerText = JSON.stringify(data, null, 2);
    });
  // TODO: Add logic for books, users, orders, analytics, settings
});
