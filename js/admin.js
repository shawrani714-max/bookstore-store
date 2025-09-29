// Hide sidebar by default on mobile after login
    // Removed forced sidebar-hidden addition here. Only setupSidebarToggle controls sidebar-hidden.
document.addEventListener('DOMContentLoaded', function() {
  // Hamburger menu toggle for mobile sidebar
  const setupSidebarToggle = () => {
  const sidebar = document.getElementById('admin-sidebar');
  const hamburgerBtn = document.getElementById('sidebar-toggle');
  const closeBtn = document.getElementById('sidebar-close');
    const isMobile = () => window.innerWidth <= 600;
  if (sidebar && hamburgerBtn) {
      // Only add sidebar-hidden if not already present
      if (isMobile() && !sidebar.classList.contains('sidebar-hidden')) {
        sidebar.classList.add('sidebar-hidden');
      }
      // Hamburger should always be visible when sidebar is hidden (handled by CSS)
      // Hamburger click opens sidebar (mobile only)
      hamburgerBtn.onclick = () => {
        if (isMobile()) {
          sidebar.classList.remove('sidebar-hidden');
        }
      };
      // Close button click closes sidebar (mobile only)
      if (closeBtn) {
        closeBtn.onclick = () => {
          if (isMobile()) {
            sidebar.classList.add('sidebar-hidden');
          }
        };
      }
      // No need to manually toggle display, CSS now handles icon visibility
      window.addEventListener('resize', () => {
        if (!isMobile()) {
          sidebar.classList.remove('sidebar-hidden');
        }
      });
    }
  };
  setupSidebarToggle();
  // Sidebar keyboard navigation (ES6+)
  const menuLinks = document.querySelectorAll('.admin-menu a');
  menuLinks.forEach(link => {
    link.tabIndex = 0;
    link.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        link.click();
      }
    });
  });

  // Dashboard card accessibility (ES6+)
  const dashboardCards = document.querySelectorAll('.dashboard-card');
  dashboardCards.forEach(card => {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', card.querySelector('.dashboard-card-label')?.textContent || 'Dashboard stat');
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        card.classList.add('dashboard-card-active');
        setTimeout(() => card.classList.remove('dashboard-card-active'), 200);
      }
    });
  });
  // Custom file input logic for bulk import (declare first!)
  const excelFileInput = document.getElementById('excel-file');
  const fileChosenSpan = document.getElementById('file-chosen');
  // Bulk import Excel upload AJAX handler
  const excelUploadForm = document.getElementById('excel-upload-form');
  const excelUploadStatus = document.getElementById('excel-upload-status');
  if (excelFileInput && fileChosenSpan) {
    excelFileInput.addEventListener('change', function() {
      if (this.files && this.files.length > 0) {
        fileChosenSpan.textContent = this.files[0].name;
      } else {
        fileChosenSpan.textContent = 'No file chosen';
      }
    });
  }
  if (excelUploadForm && excelFileInput) {
    excelUploadForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (!excelFileInput.files || !excelFileInput.files[0]) {
        excelUploadStatus.textContent = 'Please choose a file.';
        return;
      }
      excelUploadStatus.textContent = 'Uploading...';
      const formData = new FormData();
      formData.append('excel', excelFileInput.files[0]); // <-- field name must match backend
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('/api/admin/books/import', {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formData
        });
        const data = await res.json();
        if (res.ok && data.success) {
          excelUploadStatus.textContent = 'Upload successful!';
          // Optionally reload books list
          if (typeof loadBooks === 'function') loadBooks();
        } else {
          excelUploadStatus.textContent = data.message || 'Upload failed.';
        }
      } catch (err) {
        excelUploadStatus.textContent = 'Error uploading file.';
      }
      setTimeout(() => { excelUploadStatus.textContent = ''; }, 3000);
    });
  }
  // Always declare themeForm at the very top
  const themeForm = document.getElementById('theme-settings-form');
  // Declare themeForm at the top so it's available everywhere
  // Token and authFetch helpers (must be at top)
  const setToken = (t) => localStorage.setItem('adminToken', t);
  const clearToken = () => localStorage.removeItem('adminToken');
  const authFetch = (url, options = {}) => {
    const token = getToken();
    const headers = Object.assign(
      { 'Content-Type': 'application/json' },
      options.headers || {}
    );
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, Object.assign({}, options, { headers }));
  };
  // Declare themeForm at the top so it's available everywhere
  // Improved: Only show login form if not authenticated
  var panelContainer = document.getElementById('admin-panel');
  var loginContainer = document.getElementById('admin-login-container');
  var sections = document.querySelectorAll('#admin-main > section');
  const getToken = () => localStorage.getItem('adminToken');
  function showOnlyLogin() {
    // Hide admin panel and all sections
    if (panelContainer) panelContainer.style.display = 'none';
    if (loginContainer) loginContainer.style.display = 'block';
    if (sections && sections.length) {
      sections.forEach(sec => { sec.style.display = 'none'; });
    }
  }
  function showOnlyPanel() {
    // Show admin panel, hide login
    if (loginContainer) loginContainer.style.display = 'none';
    if (panelContainer) panelContainer.style.display = 'block';
    // Show hamburger button on mobile when admin panel is visible
    var hamburgerBtn = document.getElementById('sidebar-toggle');
    if (hamburgerBtn) {
      if (window.innerWidth <= 600) {
        hamburgerBtn.style.display = 'flex';
      } else {
        hamburgerBtn.style.display = 'none';
      }
    }
    // Hide all sections, then show dashboard only
    const allSections = document.querySelectorAll('#admin-main > section');
    allSections.forEach(sec => { sec.style.display = 'none'; });
    var dashboard = document.getElementById('dashboard');
    if (dashboard) dashboard.style.display = 'block';
    
    // Attach sidebar menu event listeners (excluding settings link)
    const menuLinks = document.querySelectorAll('.admin-menu a:not(#settings-link)');
  // ...removed console.log...
    if (menuLinks.length) {
      menuLinks.forEach(link => {
  // ...removed console.log...
        link.onclick = function(e) {
          e.preventDefault();
          const target = this.getAttribute('href').replace('#', '');
          // ...removed console.log...
          showSectionWithData(target);
        };
      });
    }
    
    // Attach settings submenu event listeners
    const settingsLink = document.getElementById('settings-link');
    const settingsSubmenu = document.querySelector('.settings-submenu');
    const settingsMenu = document.querySelector('.settings-menu');
    
    if (settingsMenu && settingsLink && settingsSubmenu) {
      // Expand/collapse on click
      settingsLink.addEventListener('click', function(e) {
        e.preventDefault();
  // ...removed console.log...
        settingsSubmenu.style.display = settingsSubmenu.style.display === 'none' ? 'block' : 'none';
        // Don't navigate to a section, just expand/collapse the submenu
      });
      
      // Expand on hover
      settingsMenu.addEventListener('mouseenter', function() {
        settingsSubmenu.style.display = 'block';
      });
      settingsMenu.addEventListener('mouseleave', function() {
        settingsSubmenu.style.display = 'none';
      });
      
      // Show correct section on sub-link click
      const subLinks = document.querySelectorAll('.settings-sub-link');
  // ...removed console.log...
      subLinks.forEach(link => {
  // ...removed console.log...
        link.onclick = function(e) {
          e.preventDefault();
          const target = this.getAttribute('href').replace('#', '');
          // ...removed console.log...
          showSectionWithData(target);
        };
      });
    }
  }
  // On page load, always show only login first and do NOT auto-show admin panel if token exists
  showOnlyLogin();
  // Remove any auto-login logic. Only show admin panel after successful login event.
  // Load audit log
  // Dashboard functions (ES6+ refactor)
const loadAuditLog = async () => {
  const logList = document.getElementById('audit-log-list');
  if (!logList) return;
  logList.innerHTML = '<li>Loading...</li>';
  try {
    const res = await authFetch('/api/admin/audit-log');
    const logs = await res.json();
    if (Array.isArray(logs) && logs.length) {
      logList.innerHTML = logs.map(log => `<li style="padding:8px 12px;border-bottom:1px solid #eee;font-size:0.98em;"><b>${log.action}</b> <span style="color:#666;">${log.details}</span> <span style="float:right;color:#aaa;">${new Date(log.timestamp).toLocaleString()}</span></li>`).join('');
    } else {
      logList.innerHTML = '<li>No recent admin actions.</li>';
    }
  } catch {
    logList.innerHTML = '<li>Error loading audit log.</li>';
  }
};

let pages = [];
const loadPages = async () => {
  try {
    const res = await authFetch('/api/admin/pages');
    const data = await res.json();
    if (Array.isArray(data)) {
      pages = data;
      renderPages();
    }
  } catch (e) {
    pageStatus.textContent = 'Error loading pages.';
  }
};

const renderPages = () => {
  pagesListEl.innerHTML = '';
  pages.forEach((page, idx) => {
    const li = document.createElement('li');
    li.setAttribute('draggable', 'true');
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.justifyContent = 'space-between';
    li.style.padding = '8px 12px';
    li.style.borderBottom = '1px solid #eee';
    li.style.background = page.visible ? '#fff' : '#f9f9f9';
    li.innerHTML = `
      <span style="flex:1;">
        <input type="text" value="${page.name}" style="border:none;background:transparent;font-size:1em;width:70%;" onchange="this.blur()">
      </span>
      <button class="rename-page-btn" style="background:#ffb6c1;color:#fff;border:none;border-radius:6px;padding:4px 10px;margin-right:6px;cursor:pointer;">Rename</button>
      <button class="hide-page-btn" style="background:${page.visible ? '#e94e77' : '#aaa'};color:#fff;border:none;border-radius:6px;padding:4px 10px;margin-right:6px;cursor:pointer;">${page.visible ? 'Hide' : 'Show'}</button>
      <button class="delete-page-btn" style="background:#333;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;">Delete</button>
      <span class="drag-handle" style="cursor:grab;margin-left:8px;">&#9776;</span>
    `;
    // Rename
    li.querySelector('.rename-page-btn').onclick = async () => {
      const newName = li.querySelector('input').value.trim();
      if (newName && newName !== page.name) {
        try {
          const res = await authFetch(`/api/admin/pages/${page._id}/rename`, {
            method: 'PUT',
            body: JSON.stringify({ name: newName })
          });
          const data = await res.json();
          if (data.success) {
            pageStatus.textContent = 'Page renamed.';
            loadPages();
          } else {
            pageStatus.textContent = data.message || 'Rename failed.';
          }
        } catch {
          pageStatus.textContent = 'Rename failed.';
        }
        setTimeout(() => { pageStatus.textContent = ''; }, 1500);
      }
    };
    // Hide/Show
    li.querySelector('.hide-page-btn').onclick = async () => {
      try {
        const res = await authFetch(`/api/admin/pages/${page._id}/visible`, {
          method: 'PUT',
          body: JSON.stringify({ visible: !page.visible })
        });
        const data = await res.json();
        if (data.success) {
          pageStatus.textContent = data.page.visible ? 'Page shown.' : 'Page hidden.';
          loadPages();
        } else {
          pageStatus.textContent = data.message || 'Update failed.';
        }
      } catch {
        pageStatus.textContent = 'Update failed.';
      }
      setTimeout(() => { pageStatus.textContent = ''; }, 1500);
    };
    // Delete
    li.querySelector('.delete-page-btn').onclick = async () => {
      if (confirm('Delete this page?')) {
        try {
          const res = await authFetch(`/api/admin/pages/${page._id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            pageStatus.textContent = 'Page deleted.';
            loadPages();
          } else {
            pageStatus.textContent = data.message || 'Delete failed.';
          }
        } catch {
          pageStatus.textContent = 'Delete failed.';
        }
        setTimeout(() => { pageStatus.textContent = ''; }, 1500);
      }
    };
    // Drag-and-drop
    li.ondragstart = e => {
      e.dataTransfer.setData('text/plain', idx);
      li.style.opacity = '0.5';
    };
    li.ondragend = () => {
      li.style.opacity = '1';
    };
    li.ondragover = e => {
      e.preventDefault();
      li.style.background = '#ffe4ec';
    };
    li.ondragleave = () => {
      li.style.background = page.visible ? '#fff' : '#f9f9f9';
    };
    li.ondrop = async e => {
      e.preventDefault();
      const fromIdx = Number(e.dataTransfer.getData('text/plain'));
      const toIdx = idx;
      if (fromIdx !== toIdx) {
        const moved = pages.splice(fromIdx, 1)[0];
        pages.splice(toIdx, 0, moved);
        // Update order in backend
        try {
          const orderArr = pages.map((p, i) => ({ id: p._id, order: i }));
          await authFetch('/api/admin/pages/reorder', {
            method: 'PUT',
            body: JSON.stringify({ order: orderArr })
          });
          loadPages();
        } catch {
          pageStatus.textContent = 'Reorder failed.';
        }
        setTimeout(() => { pageStatus.textContent = ''; }, 1500);
      }
    };
    pagesListEl.appendChild(li);
  });
}

  // Dashboard/page management DOM elements (ES6+)
const pagesListEl = document.getElementById('pages-list');
const addPageBtn = document.getElementById('add-page-btn');
const newPageNameInput = document.getElementById('new-page-name');
const pageStatus = document.getElementById('page-management-status');

if (addPageBtn && newPageNameInput && pagesListEl) {
  addPageBtn.onclick = async () => {
    const name = newPageNameInput.value.trim();
    if (!name) {
      pageStatus.textContent = 'Page name required.';
      newPageNameInput.classList.add('input-error');
      setTimeout(() => { newPageNameInput.classList.remove('input-error'); }, 1500);
      return;
    }
    try {
      const res = await authFetch('/api/admin/pages', {
        method: 'POST',
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (data.success) {
        pageStatus.textContent = 'Page added.';
        newPageNameInput.value = '';
        loadPages();
      } else {
        pageStatus.textContent = data.message || 'Add failed.';
      }
    } catch {
      pageStatus.textContent = 'Add failed.';
    }
    setTimeout(() => { pageStatus.textContent = ''; }, 1500);
  };
}
  // Theme preset logic
  const themePresets = {
    light: {
      primaryColor: '#e94e77',
      accentColor: '#ff6b9d',
      bgColor: '#ffffff',
      cardColor: '#fff'
    },
    dark: {
      primaryColor: '#22223b',
      accentColor: '#4a4e69',
      bgColor: '#232323',
      cardColor: '#2c2c2c'
    },
    pastel: {
      primaryColor: '#eec9d2',
      accentColor: '#ffe4ec',
      bgColor: '#f9f7f7',
      cardColor: '#fff0f6'
    }
  };
  const presetBtns = document.querySelectorAll('.theme-preset-btn');
  if (presetBtns.length && themeForm) {
    presetBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const preset = btn.getAttribute('data-preset');
        const colors = themePresets[preset];
        if (colors) {
          themeForm.primaryColor.value = colors.primaryColor;
          themeForm.accentColor.value = colors.accentColor;
          themeForm.bgColor.value = colors.bgColor;
          themeForm.cardColor.value = colors.cardColor;
        }
      });
    });
  }
  // Font customization logic
  const fontForm = document.getElementById('font-customization-form');
  const fontSaveStatus = document.getElementById('font-save-status');

  function applyFontSettings(fontSettings) {
    if (!fontSettings) return;
    document.documentElement.style.setProperty('--header-font', fontSettings.headerFont || 'Poppins');
    document.documentElement.style.setProperty('--content-font', fontSettings.contentFont || 'Poppins');
    document.documentElement.style.setProperty('--sidebar-font', fontSettings.sidebarFont || 'Poppins');
  }

  async function saveFontSettingsToDB(fontSettings) {
    try {
      const res = await authFetch('/api/admin/theme', {
        method: 'POST',
        body: JSON.stringify({ fontSettings })
      });
      if (!res.ok) throw new Error('Failed to save font');
      fontSaveStatus.textContent = 'Font settings saved!';
      applyFontSettings(fontSettings);
      setTimeout(() => { fontSaveStatus.textContent = ''; }, 2000);
    } catch (e) {
      fontSaveStatus.textContent = 'Error saving font settings.';
    }
  }

  if (fontForm) {
    fontForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const statusEl = document.getElementById('font-save-status');
      const headerFont = fontForm.headerFont.value;
      const contentFont = fontForm.contentFont.value;
      const sidebarFont = fontForm.sidebarFont.value;
      if (!headerFont || !contentFont || !sidebarFont) {
        statusEl.textContent = 'All font selections are required.';
        return;
      }
      const fontSettings = { headerFont, contentFont, sidebarFont };
      saveFontSettingsToDB(fontSettings);
  });
  // Live font preview
    const previewHeader = document.getElementById('preview-header');
    const previewContent = document.getElementById('preview-content');
    const previewSidebar = document.getElementById('preview-sidebar');
    function updateFontPreview() {
      previewHeader.style.fontFamily = fontForm.headerFont.value;
      previewContent.style.fontFamily = fontForm.contentFont.value;
      previewSidebar.style.fontFamily = fontForm.sidebarFont.value;
    }
    fontForm.headerFont.addEventListener('change', updateFontPreview);
    fontForm.contentFont.addEventListener('change', updateFontPreview);
    fontForm.sidebarFont.addEventListener('change', updateFontPreview);
    updateFontPreview();
  }

  // Load font settings from backend on page load
  async function loadFontSettings() {
    try {
      const res = await authFetch('/api/admin/theme');
      if (!res.ok) throw new Error('Failed to load font settings');
      const data = await res.json();
      if (data && data.fontSettings) {
        applyFontSettings(data.fontSettings);
        // Set form values
        if (fontForm) {
          fontForm.headerFont.value = data.fontSettings.headerFont || 'Poppins';
          fontForm.contentFont.value = data.fontSettings.contentFont || 'Poppins';
          fontForm.sidebarFont.value = data.fontSettings.sidebarFont || 'Poppins';
        }
      }
    } catch (e) {
      // fallback: do nothing
    }
  }
  loadFontSettings();
  // Theme customization logic
  function applyThemeSettings(settings) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.primaryColor);
    root.style.setProperty('--accent-color', settings.accentColor);
    root.style.setProperty('--bg-color', settings.bgColor);
    root.style.setProperty('--card-color', settings.cardColor);
  }

  function loadThemeSettings() {
    const saved = localStorage.getItem('adminThemeSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      applyThemeSettings(settings);
      // Set form values
      const form = document.getElementById('theme-settings-form');
      if (form) {
        if (form.primaryColor) form.primaryColor.value = settings.primaryColor;
        if (form.accentColor) form.accentColor.value = settings.accentColor;
        if (form.backgroundColor) form.backgroundColor.value = settings.bgColor;
        if (form.bgColor) form.bgColor.value = settings.bgColor;
        if (form.cardColor) form.cardColor.value = settings.cardColor;
        if (form.buttonColor) form.buttonColor.value = settings.buttonColor || getComputedStyle(document.documentElement).getPropertyValue('--button-color').trim();
        if (form.headingColor) form.headingColor.value = settings.headingColor || getComputedStyle(document.documentElement).getPropertyValue('--heading-color').trim();
      }
    }
  }

  document.addEventListener('DOMContentLoaded', loadThemeSettings);

  // Theme customization logic (DB sync)
  async function fetchThemeSettingsFromDB() {
    try {
      const res = await fetch('/api/admin/theme');
      if (!res.ok) throw new Error('Failed to load theme');
      const settings = await res.json();
      applyThemeSettings(settings);
      // Set form values
      const form = document.getElementById('theme-settings-form');
      if (form) {
        form.primaryColor.value = settings.primaryColor;
        form.accentColor.value = settings.accentColor;
        form.bgColor.value = settings.bgColor;
        form.cardColor.value = settings.cardColor;
      }
    } catch (e) {
      // fallback to localStorage or defaults
      loadThemeSettings();
    }
  }

  async function saveThemeSettingsToDB(settings) {
    try {
      const res = await authFetch('/api/admin/theme', {
        method: 'POST',
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to save theme');
      document.getElementById('theme-save-status').textContent = 'Theme saved!';
    } catch (e) {
      document.getElementById('theme-save-status').textContent = 'Error saving theme.';
    }
  }

  // Replace localStorage logic with DB sync
  if (themeForm) {
    const resetThemeBtn = document.getElementById('reset-theme-btn');
    if (resetThemeBtn) {
      resetThemeBtn.onclick = function() {
        themeForm.primaryColor.value = '#e94e77';
        themeForm.accentColor.value = '#ff6b9d';
        themeForm.bgColor.value = '#ffffff';
        themeForm.cardColor.value = '#fff';
        document.getElementById('theme-save-status').textContent = 'Theme reset to default.';
        setTimeout(() => { document.getElementById('theme-save-status').textContent = ''; }, 1500);
      };
    }
    const resetFontBtn = document.getElementById('reset-font-btn');
    if (resetFontBtn) {
      resetFontBtn.onclick = function() {
        fontForm.headerFont.value = 'Poppins';
        fontForm.contentFont.value = 'Poppins';
        fontForm.sidebarFont.value = 'Poppins';
        document.getElementById('font-save-status').textContent = 'Fonts reset to default.';
        // Update preview
        const previewHeader = document.getElementById('preview-header');
        const previewContent = document.getElementById('preview-content');
        const previewSidebar = document.getElementById('preview-sidebar');
        previewHeader.style.fontFamily = 'Poppins';
        previewContent.style.fontFamily = 'Poppins';
        previewSidebar.style.fontFamily = 'Poppins';
        setTimeout(() => { document.getElementById('font-save-status').textContent = ''; }, 1500);
      };
    }
    themeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const statusEl = document.getElementById('theme-save-status');
      const settings = {
        primaryColor: themeForm.primaryColor.value,
        accentColor: themeForm.accentColor.value,
        bgColor: themeForm.bgColor.value,
        cardColor: themeForm.cardColor.value
      };
      // Validation
      if (!settings.primaryColor || !settings.accentColor || !settings.bgColor || !settings.cardColor) {
        statusEl.textContent = 'All colors are required.';
        return;
      }
      saveThemeSettingsToDB(settings);
      applyThemeSettings(settings);
    });
    fetchThemeSettingsFromDB();
  }
  // Load analytics data
  async function loadAnalytics() {
  // Update summary cards
  document.getElementById('analytics-revenue-value').textContent = '₹0';
  document.getElementById('analytics-orders-today-value').textContent = '0';
  document.getElementById('analytics-orders-week-value').textContent = '0';
  document.getElementById('analytics-orders-month-value').textContent = '0';
    try {
      const res = await authFetch('/api/admin/analytics');
      if (!res.ok) throw new Error('Failed to load analytics');
      const data = await res.json();
      // Update summary cards with real data (including zero)
      document.getElementById('analytics-revenue-value').textContent = `₹${data.totalRevenue ?? 0}`;
      document.getElementById('analytics-orders-today-value').textContent = data.dailyOrders ?? 0;
      document.getElementById('analytics-orders-week-value').textContent = data.weeklyOrders ?? 0;
      document.getElementById('analytics-orders-month-value').textContent = data.monthlyOrders ?? 0;

      // Top-selling books
      const topBooksList = document.getElementById('analytics-top-books-list');
      topBooksList.innerHTML = '';
      if (Array.isArray(data.topBooks) && data.topBooks.length) {
        data.topBooks.forEach(book => {
          const li = document.createElement('li');
          li.textContent = `${book.title} by ${book.author}`;
          topBooksList.appendChild(li);
        });
      } else {
        topBooksList.innerHTML = '<li>No top-selling books</li>';
      }

      // User Growth Chart
      const userGrowthCtx = document.getElementById('userGrowthChart').getContext('2d');
      new Chart(userGrowthCtx, {
        type: 'line',
        data: {
          labels: Array.isArray(data.userGrowth) && data.userGrowth.length ? data.userGrowth.map(day => day._id) : ['No Data'],
          datasets: [{
            label: 'New Users',
            data: Array.isArray(data.userGrowth) && data.userGrowth.length ? data.userGrowth.map(day => day.count) : [0],
            backgroundColor: 'rgba(233,78,119,0.2)',
            borderColor: 'rgba(233,78,119,1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });

      // Order Status Chart
      const orderStatusCtx = document.getElementById('orderStatusChart').getContext('2d');
      new Chart(orderStatusCtx, {
        type: 'doughnut',
        data: {
          labels: Array.isArray(data.orderStatus) && data.orderStatus.length ? data.orderStatus.map(stat => stat._id) : ['No Data'],
          datasets: [{
            label: 'Orders',
            data: Array.isArray(data.orderStatus) && data.orderStatus.length ? data.orderStatus.map(stat => stat.count) : [0],
            backgroundColor: [
              'rgba(233,78,119,0.7)',
              'rgba(255,107,157,0.7)',
              'rgba(34,34,59,0.7)',
              'rgba(238,201,210,0.7)'
            ]
          }]
        },
        options: {
          plugins: { legend: { position: 'bottom' } }
        }
      });

      // Revenue Trend Chart
      const revenueTrendCtx = document.getElementById('revenueTrendChart').getContext('2d');
      new Chart(revenueTrendCtx, {
        type: 'bar',
        data: {
          labels: Array.isArray(data.revenueTrend) && data.revenueTrend.length ? data.revenueTrend.map(day => day._id) : ['No Data'],
          datasets: [{
            label: 'Revenue',
            data: Array.isArray(data.revenueTrend) && data.revenueTrend.length ? data.revenueTrend.map(day => day.total) : [0],
            backgroundColor: 'rgba(233,78,119,0.5)',
            borderColor: 'rgba(233,78,119,1)',
            borderWidth: 1
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });

      // Geographic Distribution Chart
      const geoDistributionCtx = document.getElementById('geoDistributionChart').getContext('2d');
      new Chart(geoDistributionCtx, {
        type: 'pie',
        data: {
          labels: Array.isArray(data.geoDistribution) && data.geoDistribution.length ? data.geoDistribution.map(city => city._id || 'Unknown') : ['No Data'],
          datasets: [{
            label: 'Orders',
            data: Array.isArray(data.geoDistribution) && data.geoDistribution.length ? data.geoDistribution.map(city => city.count) : [0],
            backgroundColor: [
              'rgba(233,78,119,0.7)',
              'rgba(255,107,157,0.7)',
              'rgba(34,34,59,0.7)',
              'rgba(238,201,210,0.7)',
              'rgba(255,255,255,0.7)'
            ]
          }]
        },
        options: {
          plugins: { legend: { position: 'bottom' } }
        }
      });
    } catch (e) {
      // Only show error if API call fails
      document.getElementById('analytics-revenue-value').textContent = 'Error';
      document.getElementById('analytics-orders-today-value').textContent = 'Error';
      document.getElementById('analytics-orders-week-value').textContent = 'Error';
      document.getElementById('analytics-orders-month-value').textContent = 'Error';
      document.getElementById('analytics-top-books-list').innerHTML = '<li>Error loading data</li>';
    }
  }
  // CRUD functions (ES6+ refactor)
const loadBooks = async () => {
  const booksList = document.getElementById('books-list');
  if (!booksList) return;
  booksList.innerHTML = '<div>Loading books...</div>';
  try {
    const res = await authFetch('/api/admin/books');
    if (!res.ok) throw new Error('Failed to load books');
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      booksList.innerHTML = `<div class="table-responsive"><table class="admin-table modern-table"><thead><tr>
        <th>ISBN</th><th>Title</th><th>Author</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead><tbody>
        ${data.map((book, idx) => `
          <tr data-id="${book._id}" class="${idx % 2 === 0 ? 'even-row' : 'odd-row'}">
            <td>${book.isbn || book.ISBN || ''}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>₹${book.price}</td>
            <td>
              ${typeof book.stock === 'number' ? 
                (book.stock > 0 ? `<span class='badge badge-success'>${book.stock}</span>` : `<span class='badge badge-danger'>Out of Stock</span>`) : 
                `<span class='badge badge-secondary'>N/A</span>`}
            </td>
            <td><button class="delete-book-btn modern-delete-btn">Delete</button></td>
          </tr>
        `).join('')}
      </tbody></table></div>`;
      // Add delete event listeners with custom modal
      booksList.querySelectorAll('.delete-book-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
          const row = this.closest('tr');
          const bookId = row.getAttribute('data-id');
          const confirmed = await customConfirm();
          if (confirmed) {
            btn.disabled = true;
            btn.textContent = 'Deleting...';
            try {
              const delRes = await authFetch(`/api/admin/books/${bookId}`, { method: 'DELETE' });
              const delData = await delRes.json();
              if (delRes.ok && delData.success) {
                row.remove();
              } else {
                btn.disabled = false;
                btn.textContent = 'Delete';
              }
            } catch (err) {
              btn.disabled = false;
              btn.textContent = 'Delete';
            }
          }
        });
      });
    } else {
      booksList.innerHTML = '<div>No books found.</div>';
    }
  } catch (e) {
    booksList.innerHTML = '<div>Error loading books.</div>';
  }
};

const loadUsers = async (page = 1, search = '') => {
  const usersList = document.getElementById('users-list');
  const pagination = document.getElementById('users-pagination');
  const searchInput = document.getElementById('user-search');
  if (!usersList) return;
  usersList.innerHTML = '<div>Loading users...</div>';
  try {
    const res = await authFetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`);
    if (!res.ok) throw new Error('Failed to load users');
    const data = await res.json();
    if (Array.isArray(data.users) && data.users.length) {
      usersList.innerHTML = `<div class="table-responsive"><table class="admin-table modern-table"><thead><tr>
        <th>Name</th><th>Email</th><th>Phone</th><th>Password</th><th>Status</th></tr></thead><tbody>
        ${data.users.map((user, idx) => `
          <tr class="${idx % 2 === 0 ? 'even-row' : 'odd-row'}">
            <td>${user.firstName || ''} ${user.lastName || ''}</td>
            <td>${user.email}</td>
            <td>${user.phone || ''}</td>
            <td>${user.password || ''}</td>
            <td>${user.isActive ? `<span class='badge badge-success'>Active</span>` : `<span class='badge badge-danger'>Inactive</span>`}</td>
          </tr>
        `).join('')}
      </tbody></table></div>`;
      // Pagination
      if (pagination) {
        let pagHtml = '';
        for (let i = 1; i <= data.totalPages; i++) {
          pagHtml += `<button class="user-page-btn" style="margin:0 2px;${i===page?`background:#e94e77;color:#fff;`:''}">${i}</button>`;
        }
        pagination.innerHTML = pagHtml;
        pagination.querySelectorAll('.user-page-btn').forEach((btn, idx) => {
          btn.onclick = () => loadUsers(idx+1, searchInput.value);
        });
      }
    } else {
      usersList.innerHTML = '<div>No users found.</div>';
      if (pagination) pagination.innerHTML = '';
    }
  } catch (e) {
    usersList.innerHTML = '<div>Error loading users.</div>';
    if (pagination) pagination.innerHTML = '';
  }
  // Search event
  if (searchInput && !searchInput._listenerAdded) {
    searchInput.addEventListener('input', () => loadUsers(1, searchInput.value));
    searchInput._listenerAdded = true;
  }
};

const loadOrders = async (page = 1, search = '') => {
  const ordersList = document.getElementById('orders-list');
  const pagination = document.getElementById('orders-pagination');
  const searchInput = document.getElementById('order-search');
  if (!ordersList) return;
  ordersList.innerHTML = '<div>Loading orders...</div>';
  try {
    const res = await authFetch(`/api/admin/orders?page=${page}&search=${encodeURIComponent(search)}`);
    if (!res.ok) throw new Error('Failed to load orders');
    const data = await res.json();
    if (Array.isArray(data.orders) && data.orders.length) {
      ordersList.innerHTML = `<div class="table-responsive"><table class="admin-table modern-table"><thead><tr>
        <th>Order ID</th><th>User</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th><th>Address</th></tr></thead><tbody>
        ${data.orders.map((order, idx) => `
          <tr class="${idx % 2 === 0 ? 'even-row' : 'odd-row'}">
            <td>${order._id}</td>
            <td>${order.userName || order.user?.email || order.user}</td>
            <td>${Array.isArray(order.items) ? order.items.map(item => item.title || item.name).join(', ') : ''}</td>
            <td>₹${order.total}</td>
            <td>${order.status ? `<span class='badge badge-${order.status === 'delivered' ? 'success' : (order.status === 'pending' ? 'secondary' : 'danger')}'>${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>` : ''}</td>
            <td>${order.paymentMethod || ''}</td>
            <td>${order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</td>
            <td>${order.shippingAddress ? [order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zip].filter(Boolean).join(', ') : ''}</td>
          </tr>
        `).join('')}
      </tbody></table></div>`;
      // Pagination
      if (pagination) {
        let pagHtml = '';
        for (let i = 1; i <= data.totalPages; i++) {
          pagHtml += `<button class="order-page-btn" style="margin:0 2px;${i===page?`background:#e94e77;color:#fff;`:''}">${i}</button>`;
        }
        pagination.innerHTML = pagHtml;
        pagination.querySelectorAll('.order-page-btn').forEach((btn, idx) => {
          btn.onclick = () => loadOrders(idx+1, searchInput.value);
        });
      }
    } else {
      ordersList.innerHTML = '<div>No orders found.</div>';
      if (pagination) pagination.innerHTML = '';
    }
  } catch (e) {
    ordersList.innerHTML = '<div>Error loading orders.</div>';
    if (pagination) pagination.innerHTML = '';
  }
  // Search event
  if (searchInput && !searchInput._listenerAdded) {
    searchInput.addEventListener('input', () => loadOrders(1, searchInput.value));
    searchInput._listenerAdded = true;
  }
};
// Sidebar navigation logic

  // Show correct section and load data when navigating
  function showSectionWithData(sectionId) {
  // ...removed console.log...
    // Hide all sections first
    const sections = document.querySelectorAll('#admin-main > section');
  // ...removed console.log...
    sections.forEach(sec => { 
      sec.style.display = 'none';
  // ...removed console.log...
    });
    // Show the selected section
    const targetSection = document.getElementById(sectionId);
  // ...removed console.log...
    if (targetSection) {
      targetSection.style.display = 'block';
  // ...removed console.log...
    } else {
  // ...removed console.error...
    }
    // Load data for the selected section
    if (sectionId === 'books') {
  // ...removed console.log...
      loadBooks();
    }
    if (sectionId === 'users') {
  // ...removed console.log...
      loadUsers();
    }
    if (sectionId === 'orders') {
  // ...removed console.log...
      loadOrders();
    }
    if (sectionId === 'analytics') {
  // ...removed console.log...
      loadAuditLog();
    }
    if (sectionId === 'theme-settings' || sectionId === 'font-settings' || sectionId === 'page-management') {
  // ...removed console.log...
    }
  }

  // Attach click listeners to sidebar menu
  // Sidebar event listeners will be attached after login only
  // Already declared at the top
  const loginForm = document.getElementById('admin-login-form');
  const emailInput = document.getElementById('admin-email');
  const passwordInput = document.getElementById('admin-password');
  const loginError = document.getElementById('admin-login-error');
  // Password show/hide toggle for admin login
  (function() {
    var passwordInput = document.getElementById('admin-password');
    var togglePassword = document.getElementById('toggle-password');
    if (passwordInput && togglePassword) {
      // Hide icon initially
      togglePassword.style.display = 'none';
      // Show icon on focus or if value exists
      function updateIconVisibility() {
        if (passwordInput === document.activeElement || passwordInput.value.length > 0) {
          togglePassword.style.display = 'inline';
        } else {
          togglePassword.style.display = 'none';
        }
      }
      passwordInput.addEventListener('focus', updateIconVisibility);
      passwordInput.addEventListener('input', updateIconVisibility);
      passwordInput.addEventListener('blur', function() {
        setTimeout(updateIconVisibility, 150);
      });
      // Initial check in case autofill
      updateIconVisibility();
      // Eye icon logic
      function setEyeIcon(type) {
        if (type === 'password') {
          // Slashed eye SVG
          togglePassword.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e94e77" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1l22 22"/><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-11-7.5a11.05 11.05 0 0 1 5.17-5.17"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/><path d="M14.47 14.47L9.53 9.53"/><path d="M22.54 6.42A11.05 11.05 0 0 0 12 5c-2.61 0-5.01.84-7.04 2.25"/></svg>';
        } else {
          // Eye SVG
          togglePassword.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e94e77" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12C3.73 7.11 8.1 4 12 4s8.27 3.11 11 8c-2.73 4.89-7.1 8-11 8s-8.27-3.11-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
        }
      }
      setEyeIcon('password');
      togglePassword.addEventListener('click', function() {
        var type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
        setEyeIcon(type);
      });
      togglePassword.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          togglePassword.click();
        }
      });
    }
  })();
  // ...existing code...

  const showPanel = () => {
    if (loginContainer) loginContainer.style.display = 'none';
    if (panelContainer) panelContainer.style.display = 'block';
    // Show only dashboard section after login
    var sections = document.querySelectorAll('#admin-main > section');
    sections.forEach(sec => { sec.style.display = 'none'; });
    document.getElementById('dashboard').style.display = 'block';
    // Event listeners are now set up in showOnlyPanel() function
  };

  const showLogin = () => {
  if (panelContainer) panelContainer.style.display = 'none';
  if (loginContainer) loginContainer.style.display = 'block';
  // Force-hide all admin sections after logout
  var sections = document.querySelectorAll('#admin-main > section');
  sections.forEach(sec => { sec.style.display = 'none'; });
  };

  const loadStats = async () => {
    try {
      const res = await authFetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to load stats');
      const data = await res.json();
      // Update stat cards
      if (data) {
        document.querySelector('#stat-users .dashboard-card-value').textContent = data.users ?? 0;
        document.querySelector('#stat-books .dashboard-card-value').textContent = data.books ?? 0;
        document.querySelector('#stat-orders .dashboard-card-value').textContent = data.orders ?? 0;
        document.querySelector('#stat-revenue .dashboard-card-value').textContent = data.revenue ?? 0;
      }
    } catch (e) {
      // Show error in cards
      ['stat-users','stat-books','stat-orders','stat-revenue'].forEach(id => {
        const el = document.querySelector(`#${id} .dashboard-card-value`);
        if (el) el.textContent = '-';
      });
    }
  };

  // Remove auto-auth logic. Only show login page until user logs in.

  // Handle login submit
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  // ...removed console.log...
      loginError.textContent = '';
      try {
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailInput.value.trim(), password: passwordInput.value })
        });
  // ...removed console.log...
        const data = await res.json();
        console.log('Login API data:', data);
        if (!res.ok || !data.success) {
          loginError.textContent = data.message || 'Login failed';
          throw new Error(data.message || 'Login failed');
        }
        setToken(data.token);
        // Show admin panel with proper navigation setup
        showOnlyPanel();
        await loadStats();
        console.log('Login successful, admin panel should be visible');
      } catch (err) {
        console.error('Login error:', err);
        loginError.textContent = err.message || 'Login failed';
      } finally {
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Settings menu event listeners are now set up in showOnlyPanel() function
});

// Custom confirmation modal HTML (add to body if not present)
if (!document.getElementById('custom-confirm-modal')) {
  const modalHtml = `
    <div id="custom-confirm-modal" class="custom-modal-overlay" style="display:none;">
      <div class="custom-modal-box">
        <div class="custom-modal-title">Confirm Delete</div>
        <div class="custom-modal-message">Are you sure you want to delete this book?</div>
        <div class="custom-modal-actions">
          <button id="custom-modal-cancel" class="custom-modal-btn cancel">Cancel</button>
          <button id="custom-modal-confirm" class="custom-modal-btn delete">Delete</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Custom confirm function
const customConfirm = () => {
  return new Promise(resolve => {
    const modal = document.getElementById('custom-confirm-modal');
    const cancelBtn = document.getElementById('custom-modal-cancel');
    const confirmBtn = document.getElementById('custom-modal-confirm');
    modal.style.display = 'flex';
    const cleanup = () => {
      modal.style.display = 'none';
      cancelBtn.removeEventListener('click', onCancel);
      confirmBtn.removeEventListener('click', onConfirm);
    };
    const onCancel = () => { cleanup(); resolve(false); };
    const onConfirm = () => { cleanup(); resolve(true); };
    cancelBtn.addEventListener('click', onCancel);
    confirmBtn.addEventListener('click', onConfirm);
  });
};

// Update book delete logic to use customConfirm
const booksList = document.getElementById('books-list');
if (booksList) {
  booksList.querySelectorAll('.delete-book-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const row = this.closest('tr');
      const bookId = row.getAttribute('data-id');
      const confirmed = await customConfirm();
      if (confirmed) {
        btn.disabled = true;
        btn.textContent = 'Deleting...';
        try {
          const delRes = await authFetch(`/api/admin/books/${bookId}`, { method: 'DELETE' });
          const delData = await delRes.json();
          if (delRes.ok && delData.success) {
            row.remove();
          } else {
            btn.disabled = false;
            btn.textContent = 'Delete';
          }
        } catch (err) {
          btn.disabled = false;
          btn.textContent = 'Delete';
        }
      }
    });
  });
}

// Custom confirm modal for theme save (with Yes/No buttons and custom title)
async function customThemeConfirm() {
  return new Promise(resolve => {
    let modal = document.getElementById('custom-theme-confirm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'custom-theme-confirm-modal';
      modal.className = 'custom-modal-overlay';
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="custom-modal-box">
          <div class="custom-modal-title" style="color:#e94e77;font-size:1.3em;font-weight:600;margin-bottom:8px;">Save Theme</div>
          <div class="custom-modal-message" style="margin-bottom:18px;font-size:1.08em;">Are you sure you want to save this theme?</div>
          <div class="custom-modal-actions" style="display:flex;gap:16px;justify-content:center;">
            <button id="custom-theme-cancel" class="custom-modal-btn cancel" style="background:#aaa;color:#fff;min-width:80px;">No</button>
            <button id="custom-theme-confirm" class="custom-modal-btn delete" style="background:#e94e77;color:#fff;min-width:80px;">Yes</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    const cancelBtn = modal.querySelector('#custom-theme-cancel');
    const confirmBtn = modal.querySelector('#custom-theme-confirm');
    const cleanup = () => {
      modal.style.display = 'none';
      cancelBtn.removeEventListener('click', onCancel);
      confirmBtn.removeEventListener('click', onConfirm);
    };
    const onCancel = () => { cleanup(); resolve(false); };
    const onConfirm = () => { cleanup(); resolve(true); };
    cancelBtn.addEventListener('click', onCancel);
    confirmBtn.addEventListener('click', onConfirm);
  });
}

// Extend theme customization to support button and heading color
// ...existing code...

// REMOVE Live Theme Preview logic and references
// Delete or comment out all code related to:
// - theme-preview-bar
// - theme-preview-card
// - theme-preview-bg
// - updatePreview function for preview only
function applySavedThemeSettings() {
  const saved = localStorage.getItem('adminThemeSettings');
  if (saved) {
    const settings = JSON.parse(saved);
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    document.documentElement.style.setProperty('--bg-color', settings.bgColor);
    document.documentElement.style.setProperty('--card-color', settings.cardColor);
    document.documentElement.style.setProperty('--button-color', settings.buttonColor);
    document.documentElement.style.setProperty('--heading-color', settings.headingColor);
  }
}
document.addEventListener('DOMContentLoaded', applySavedThemeSettings);
(function() {
  var themeForm = document.getElementById('theme-settings-form');
  if (!themeForm) return;
  // Add button and heading color pickers if not present
  if (!document.getElementById('buttonColor')) {
    var btnLabel = document.createElement('label');
    btnLabel.htmlFor = 'buttonColor';
    btnLabel.textContent = 'Button Color:';
    var btnInput = document.createElement('input');
    btnInput.type = 'color';
    btnInput.id = 'buttonColor';
    btnInput.name = 'buttonColor';
    btnInput.value = getComputedStyle(document.documentElement).getPropertyValue('--button-color').trim() || '#e94e77';
    btnInput.style = 'margin-bottom:10px;width:100%;border:2px solid #e94e77;border-radius:8px;height:40px;';
    themeForm.insertBefore(btnLabel, themeForm.querySelector('div'));
    themeForm.insertBefore(btnInput, themeForm.querySelector('div'));
  }
  if (!document.getElementById('headingColor')) {
    var headingLabel = document.createElement('label');
    headingLabel.htmlFor = 'headingColor';
    headingLabel.textContent = 'Heading Color:';
    var headingInput = document.createElement('input');
    headingInput.type = 'color';
    headingInput.id = 'headingColor';
    headingInput.name = 'headingColor';
    headingInput.value = getComputedStyle(document.documentElement).getPropertyValue('--heading-color').trim() || '#e94e77';
    headingInput.style = 'margin-bottom:10px;width:100%;border:2px solid #e94e77;border-radius:8px;height:40px;';
    themeForm.insertBefore(headingLabel, themeForm.querySelector('div'));
    themeForm.insertBefore(headingInput, themeForm.querySelector('div'));
  }
    // Set color pickers to saved values on page load
  const saved = localStorage.getItem('adminThemeSettings');
  if (saved) {
    const settings = JSON.parse(saved);
    if (themeForm.primaryColor) themeForm.primaryColor.value = settings.primaryColor;
    if (themeForm.accentColor) themeForm.accentColor.value = settings.accentColor;
    if (themeForm.backgroundColor) themeForm.backgroundColor.value = settings.bgColor;
    if (themeForm.bgColor) themeForm.bgColor.value = settings.bgColor;
    if (themeForm.cardColor) themeForm.cardColor.value = settings.cardColor;
    if (themeForm.buttonColor) themeForm.buttonColor.value = settings.buttonColor || '#e94e77';
    if (themeForm.headingColor) themeForm.headingColor.value = settings.headingColor || '#e94e77';
  }

  // REMOVE updatePreview and previewBar/previewCard/previewBg logic
  // Only apply theme on save/confirm
  themeForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    var statusEl = document.getElementById('theme-save-status');
    var btnInput = document.getElementById('buttonColor');
    var headingInput = document.getElementById('headingColor');
    var settings = {
      primaryColor: themeForm.primaryColor.value,
      accentColor: themeForm.accentColor.value,
      bgColor: themeForm.backgroundColor ? themeForm.backgroundColor.value : themeForm.bgColor.value,
      cardColor: themeForm.cardColor.value,
      buttonColor: btnInput.value,
      headingColor: headingInput.value
    };
    if (!settings.primaryColor || !settings.accentColor || !settings.bgColor || !settings.cardColor || !settings.buttonColor || !settings.headingColor) {
      statusEl.textContent = 'All colors are required.';
      return;
    }
    // Show custom confirm modal
    const confirmed = await customThemeConfirm();
    if (!confirmed) {
      statusEl.textContent = 'Theme save cancelled.';
      setTimeout(function() { statusEl.textContent = ''; }, 2000);
      return;
    }
    // Save to localStorage and apply
    localStorage.setItem('adminThemeSettings', JSON.stringify(settings));
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    document.documentElement.style.setProperty('--bg-color', settings.bgColor);
    document.documentElement.style.setProperty('--card-color', settings.cardColor);
    document.documentElement.style.setProperty('--button-color', settings.buttonColor);
    document.documentElement.style.setProperty('--heading-color', settings.headingColor);
    statusEl.textContent = 'Theme saved!';
    setTimeout(function() { statusEl.textContent = ''; }, 2000);
  });
})();

// Banner Management
async function adminFetchBanners() {
  try {
    const res = await authFetch('/api/admin/banners');
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
}
function renderBannerRow(b) {
  return `
    <div class="banner-row" data-id="${b._id}" style="display:flex;gap:10px;align-items:center;padding:8px;border-bottom:1px solid #eee;">
      <img src="${b.imageUrl}" alt="banner" style="width:80px;height:48px;object-fit:cover;border-radius:6px;"/>
      <div class="drag-handle" style="cursor:grab;">☰</div>
      <div style="flex:1;">
        <div><strong>${b.title||''}</strong></div>
        <div style="font-size:12px;color:#666;">${b.subtitle||''}</div>
      </div>
      <input type="number" class="banner-order" value="${b.order||0}" style="width:70px;" />
      <label style="display:flex;align-items:center;gap:6px;">
        <input type="checkbox" class="banner-active" ${b.active ? 'checked' : ''}/> Active
      </label>
      <button class="btn banner-save" style="min-width:70px;">Save</button>
      <button class="btn banner-delete" style="min-width:70px;background:#dc3545;color:#fff;">Delete</button>
    </div>`;
}
async function renderBannersAdminList() {
  const list = document.getElementById('banners-list');
  if (!list) return;
  const banners = await adminFetchBanners();
  list.innerHTML = banners.map(renderBannerRow).join('');
  // Enable drag reorder (simple mouse-based)
  let dragEl=null; let startIdx=null;
  const rows = Array.from(list.querySelectorAll('.banner-row'));
  rows.forEach((row, i)=>{
    const handle = row.querySelector('.drag-handle');
    handle.addEventListener('mousedown', ()=>{ dragEl=row; startIdx=i; row.style.opacity='0.6'; });
  });
  document.addEventListener('mouseup', async ()=>{
    if (!dragEl) return;
    dragEl.style.opacity='1';
    dragEl=null;
    // Persist order according to DOM order
    const newOrder = Array.from(list.querySelectorAll('.banner-row')).map((r,idx)=>({ id: r.getAttribute('data-id'), order: idx }));
    try { await authFetch('/api/admin/banners/reorder', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ order: newOrder }) }); } catch {}
  });
  list.addEventListener('mousemove', (e)=>{
    if (!dragEl) return;
    const rows = Array.from(list.querySelectorAll('.banner-row'));
    const over = rows.find(r=>{
      const rect = r.getBoundingClientRect();
      return e.clientY > rect.top && e.clientY < rect.bottom;
    });
    if (over && over !== dragEl) {
      if (dragEl.compareDocumentPosition(over) & Node.DOCUMENT_POSITION_FOLLOWING) {
        list.insertBefore(over, dragEl);
      } else {
        list.insertBefore(dragEl, over);
      }
    }
  });
}

const adminBannerForm = document.getElementById('banner-form');
if (adminBannerForm) {
  const previewEl = document.getElementById('banner-preview');
  const updatePreview = () => {
    if (!previewEl) return;
    const title = document.getElementById('banner-title').value;
    const subtitle = document.getElementById('banner-subtitle').value;
    const ctaText = document.getElementById('banner-cta-text').value;
    const imgInput = document.getElementById('banner-image');
    const urlInput = document.getElementById('banner-image-url');
    const overlay = document.getElementById('banner-overlay').checked;
    const textColor = document.getElementById('banner-text-color').value || '#ffffff';
    const ctaColor = (document.getElementById('banner-cta-color') && document.getElementById('banner-cta-color').value) || '#ffffff';
    const ctaBg = (document.getElementById('banner-cta-bg') && document.getElementById('banner-cta-bg').value) || '#e94e77';
    const src = (urlInput && urlInput.value) ? urlInput.value.trim() : (imgInput && imgInput.files[0] ? URL.createObjectURL(imgInput.files[0]) : '');
    previewEl.innerHTML = `
      <div class="preview-card" style="background-image:url('${src}'); background-size:cover; background-position:center;">
        <div class="overlay" style="display:${overlay?'block':'none'}"></div>
        <div class="content" style="color:${textColor}">
          ${title ? `<h3 style="margin:0 0 6px 0;">${title}</h3>` : ''}
          ${subtitle ? `<p style="margin:0 0 10px 0;">${subtitle}</p>` : ''}
          ${ctaText ? `<span class=\"btn\" style=\"padding:6px 12px;color:${ctaColor};background:${ctaBg};\">${ctaText}</span>` : ''}
        </div>
      </div>`;
  };
  ['banner-title','banner-subtitle','banner-cta-text','banner-image','banner-image-url','banner-overlay','banner-text-color','banner-cta-color','banner-cta-bg'].forEach(id=>{
    const el = document.getElementById(id);
    if (el) el.addEventListener(el.type==='file'?'change':'input', updatePreview);
  });
  updatePreview();
  adminBannerForm.addEventListener('submit', async function(e){
    e.preventDefault();
    const statusEl = document.getElementById('banner-status');
    statusEl.textContent = 'Saving...';
    // Validation
    const imageFile = document.getElementById('banner-image').files[0];
    const imageUrlInput = document.getElementById('banner-image-url');
    if (!imageFile && !imageUrlInput.value.trim()) {
      statusEl.textContent = 'Please select an image file or provide an image URL.';
      return;
    }
    if (imageUrlInput.value && !/^https?:\/\//i.test(imageUrlInput.value)) {
      statusEl.textContent = 'Please enter a valid image URL (http/https).';
      return;
    }
    try {
      const formData = new FormData();
      const imageUrl = imageUrlInput.value.trim();
      if (imageFile) formData.append('image', imageFile);
      if (imageUrl) formData.append('imageUrl', imageUrl);
      formData.append('title', document.getElementById('banner-title').value);
      formData.append('subtitle', document.getElementById('banner-subtitle').value);
      formData.append('ctaText', document.getElementById('banner-cta-text').value);
      formData.append('ctaLink', document.getElementById('banner-cta-link').value);
      formData.append('overlay', document.getElementById('banner-overlay').checked);
      formData.append('textColor', document.getElementById('banner-text-color').value);
      formData.append('order', document.getElementById('banner-order').value);
      formData.append('active', document.getElementById('banner-active').checked);
      // Upload with progress
      const progress = document.getElementById('banner-progress');
      progress.style.display = 'block';
      progress.value = 0;
      const token = localStorage.getItem('adminToken');
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/admin/banners');
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            progress.value = Math.round((e.loaded / e.total) * 100);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText); else reject(new Error('Upload failed'));
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });
      progress.style.display = 'none';
      statusEl.textContent = 'Banner added';
      adminBannerForm.reset();
      renderBannersAdminList();
    } catch(err) {
      document.getElementById('banner-progress').style.display = 'none';
      statusEl.textContent = 'Error: ' + (err.message || 'Failed');
    }
  });
}

document.addEventListener('click', async function(e){
  const row = e.target.closest('.banner-row');
  if (!row) return;
  const id = row.getAttribute('data-id');
  if (e.target.classList.contains('banner-save')) {
    const order = row.querySelector('.banner-order').value;
    const active = row.querySelector('.banner-active').checked;
    const res = await authFetch(`/api/admin/banners/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: Number(order), active })
    });
    if (res.ok) renderBannersAdminList();
  }
  if (e.target.classList.contains('banner-delete')) {
    if (!confirm('Delete this banner?')) return;
    const res = await authFetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
    if (res.ok) row.remove();
  }
});

window.addEventListener('hashchange', function(){
  if (location.hash === '#banner-management') renderBannersAdminList();
});
if (location.hash === '#banner-management') renderBannersAdminList();
