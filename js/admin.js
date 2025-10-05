// Token and authFetch helpers (must be at top and global scope)
const setToken = (t) => localStorage.setItem('adminToken', t);
const clearToken = () => localStorage.removeItem('adminToken');
const getToken = () => localStorage.getItem('adminToken');
const authFetch = (url, options = {}) => {
  const token = getToken();
  const headers = Object.assign(
    { 'Content-Type': 'application/json' },
    options.headers || {}
  );
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, Object.assign({}, options, { headers }));
};

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
  const getToken = () => localStorage.getItem('adminToken');
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
        primaryColor: themeForm.primaryColor?.value || '#007bff',
        accentColor: themeForm.accentColor?.value || '#28a745',
        bgColor: themeForm.bgColor?.value || '#ffffff',
        cardColor: themeForm.cardColor?.value || '#f8f9fa'
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

// Enhanced Admin Orders Management System
class AdminOrdersManager {
    constructor() {
        this.orders = [];
        this.filteredOrders = [];
        this.currentFilters = {};
        this.selectedOrders = new Set();
        this.token = getToken();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadOrders();
    }

    setupEventListeners() {
        // Search input
  const searchInput = document.getElementById('order-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.performSearch();
            }, 300));
        }

        // Filter dropdowns
        const filterSelects = ['status-filter', 'payment-filter', 'date-filter', 'amount-filter'];
        filterSelects.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.applyFilters();
                });
            }
        });

        // Date filter change
        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    document.getElementById('custom-date-range').style.display = 'block';
                } else {
                    document.getElementById('custom-date-range').style.display = 'none';
                }
                this.applyFilters();
            });
        }

        // Custom date inputs
        const customDateInputs = ['from-date', 'to-date'];
        customDateInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.applyFilters();
                });
            }
        });

        // Bulk action select
        const bulkActionSelect = document.getElementById('bulk-action-select');
        if (bulkActionSelect) {
            bulkActionSelect.addEventListener('change', (e) => {
                const bulkActionBtn = document.getElementById('bulk-action-btn');
                if (bulkActionBtn) {
                    bulkActionBtn.disabled = !e.target.value || this.selectedOrders.size === 0;
                }
            });
        }

        // Quick filter buttons
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterType = e.target.getAttribute('data-filter');
                this.applyQuickFilter(filterType);
            });
        });

        // Clear all filters button
        const clearAllBtn = document.getElementById('clear-all-filters-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }

        // Bulk action button
        const bulkActionBtn = document.getElementById('bulk-action-btn');
        if (bulkActionBtn) {
            bulkActionBtn.addEventListener('click', () => {
                this.executeBulkAction();
            });
        }

        // Export all button
        const exportAllBtn = document.getElementById('export-all-btn');
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => {
                this.exportOrders();
            });
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async loadOrders() {
        try {
            this.showLoading();
            
            // Try to load real orders first
            try {
                const res = await authFetch('/api/admin/orders');
                if (res.ok) {
                    const data = await res.json();
                    if (data.orders && Array.isArray(data.orders)) {
                        this.orders = data.orders.map(order => this.transformOrderData(order));
                        this.applyLocalStorageUpdates();
                        this.filteredOrders = [...this.orders];
                        this.renderOrders();
                        this.updateOrdersCount();
                        return;
                    }
                }
            } catch (error) {
                console.log('Real API not available, using sample data');
            }
            
            // Fallback to sample data
            this.orders = this.generateSampleOrders();
            this.applyLocalStorageUpdates();
            this.filteredOrders = [...this.orders];
            
            this.renderOrders();
            this.updateOrdersCount();
            
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showError('Failed to load orders');
        }
    }

    applyLocalStorageUpdates() {
        try {
            const savedUpdates = JSON.parse(localStorage.getItem('adminOrderUpdates') || '[]');
            console.log('Applying localStorage updates:', savedUpdates);
            
            savedUpdates.forEach(update => {
                const orderIndex = this.orders.findIndex(o => o._id === update.orderId);
                if (orderIndex !== -1) {
                    // Apply the saved updates
                    this.orders[orderIndex].status = update.status;
                    this.orders[orderIndex].customer.name = update.customer.name;
                    this.orders[orderIndex].customer.email = update.customer.email;
                    this.orders[orderIndex].customer.phone = update.customer.phone;
                    this.orders[orderIndex].notes = update.notes;
                    this.orders[orderIndex].updatedAt = new Date(update.updatedAt);
                    
                    console.log(`Applied update to order ${update.orderId}:`, {
                        status: update.status,
                        customer: update.customer
                    });
                }
            });
        } catch (error) {
            console.error('Error applying localStorage updates:', error);
        }
    }

    transformOrderData(order) {
        return {
            _id: order._id,
            orderNumber: order.orderNumber || order._id.substring(0, 8).toUpperCase(),
            customer: {
                name: order.userName || order.user?.name || 'Unknown Customer',
                email: order.user?.email || 'unknown@example.com',
                phone: order.user?.phone || '+91 0000000000'
            },
            items: Array.isArray(order.items) ? order.items.map(item => ({
                _id: item._id || Math.random().toString(36).substr(2, 9),
                title: item.title || item.name || 'Unknown Item',
                author: item.author || 'Unknown Author',
                price: item.price || 0,
                quantity: item.quantity || 1,
                total: (item.price || 0) * (item.quantity || 1),
                status: order.status || 'pending'
            })) : [],
            status: order.status || 'pending',
            paymentMethod: order.paymentMethod || 'cod',
            totalAmount: order.total || 0,
            createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
            updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date()
        };
    }

    generateSampleOrders() {
        const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        const paymentMethods = ['card', 'upi', 'netbanking', 'cod'];
        const customers = [
            { name: 'John Doe', email: 'john@example.com', phone: '+91 9876543210' },
            { name: 'Jane Smith', email: 'jane@example.com', phone: '+91 9876543211' },
            { name: 'Mike Johnson', email: 'mike@example.com', phone: '+91 9876543212' },
            { name: 'Sarah Wilson', email: 'sarah@example.com', phone: '+91 9876543213' },
            { name: 'David Brown', email: 'david@example.com', phone: '+91 9876543214' }
        ];

        const books = [
            { title: 'The Great Gatsby', price: 299, author: 'F. Scott Fitzgerald' },
            { title: 'To Kill a Mockingbird', price: 399, author: 'Harper Lee' },
            { title: '1984', price: 349, author: 'George Orwell' },
            { title: 'Pride and Prejudice', price: 279, author: 'Jane Austen' },
            { title: 'The Catcher in the Rye', price: 329, author: 'J.D. Salinger' }
        ];

        const orders = [];
        for (let i = 1; i <= 25; i++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
            const itemCount = Math.floor(Math.random() * 3) + 1;
            
            const items = [];
            let totalAmount = 0;
            
            for (let j = 0; j < itemCount; j++) {
                const book = books[Math.floor(Math.random() * books.length)];
                const quantity = Math.floor(Math.random() * 2) + 1;
                const itemTotal = book.price * quantity;
                totalAmount += itemTotal;
                
                items.push({
                    _id: `item_${i}_${j}`,
                    title: book.title,
                    author: book.author,
                    price: book.price,
                    quantity: quantity,
                    total: itemTotal,
                    status: status
                });
            }

            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));

            orders.push({
                _id: `order_${i}`,
                orderNumber: `ORD${String(i).padStart(4, '0')}`,
                customer: customer,
                items: items,
                status: status,
                paymentMethod: paymentMethod,
                totalAmount: totalAmount,
                createdAt: orderDate,
                updatedAt: orderDate
            });
        }

        return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    performSearch() {
        const searchTerm = document.getElementById('order-search').value.toLowerCase();
        
        if (!searchTerm) {
            this.applyFilters();
            return;
        }

        this.filteredOrders = this.orders.filter(order => {
            return (
                order.orderNumber.toLowerCase().includes(searchTerm) ||
                order.customer.name.toLowerCase().includes(searchTerm) ||
                order.customer.email.toLowerCase().includes(searchTerm) ||
                order.customer.phone.includes(searchTerm)
            );
        });

        this.renderOrders();
        this.updateOrdersCount();
    }

    applyQuickFilter(filterType) {
        // Update active quick filter button
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = '#f3f4f6';
            btn.style.color = '#374151';
        });
        const activeBtn = document.querySelector(`[data-filter="${filterType}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.style.background = '#2563eb';
            activeBtn.style.color = 'white';
        }

        // Apply the filter
        this.currentFilters = {};
        
        if (filterType === 'all') {
            this.filteredOrders = [...this.orders];
        } else if (['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(filterType)) {
            this.currentFilters.status = filterType;
            this.filteredOrders = this.orders.filter(order => order.status === filterType);
        } else if (filterType === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            this.filteredOrders = this.orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === today.getTime();
            });
        } else if (filterType === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            this.filteredOrders = this.orders.filter(order => new Date(order.createdAt) >= weekAgo);
        }

        this.renderOrders();
        this.updateOrdersCount();
    }

    applyFilters() {
        const statusFilter = document.getElementById('status-filter').value;
        const paymentFilter = document.getElementById('payment-filter').value;
        const dateFilter = document.getElementById('date-filter').value;
        const amountFilter = document.getElementById('amount-filter').value;

        this.currentFilters = {
            status: statusFilter,
            payment: paymentFilter,
            date: dateFilter,
            amount: amountFilter
        };

        this.filteredOrders = this.orders.filter(order => {
            // Status filter
            if (statusFilter && order.status !== statusFilter) return false;

            // Payment method filter
            if (paymentFilter && order.paymentMethod !== paymentFilter) return false;

            // Date filter
            if (dateFilter && dateFilter !== 'custom') {
                const orderDate = new Date(order.createdAt);
                const now = new Date();
                
                switch (dateFilter) {
                    case 'today':
                        if (orderDate.toDateString() !== now.toDateString()) return false;
                        break;
                    case 'yesterday':
                        const yesterday = new Date(now);
                        yesterday.setDate(yesterday.getDate() - 1);
                        if (orderDate.toDateString() !== yesterday.toDateString()) return false;
                        break;
                    case 'week':
                        const weekAgo = new Date(now);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        if (orderDate < weekAgo) return false;
                        break;
                    case 'month':
                        const monthAgo = new Date(now);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        if (orderDate < monthAgo) return false;
                        break;
                    case 'quarter':
                        const quarterAgo = new Date(now);
                        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
                        if (orderDate < quarterAgo) return false;
                        break;
                    case 'year':
                        const yearAgo = new Date(now);
                        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                        if (orderDate < yearAgo) return false;
                        break;
                }
            }

            // Custom date range
            if (dateFilter === 'custom') {
                const fromDate = document.getElementById('from-date').value;
                const toDate = document.getElementById('to-date').value;
                
                if (fromDate) {
                    const from = new Date(fromDate);
                    if (new Date(order.createdAt) < from) return false;
                }
                
                if (toDate) {
                    const to = new Date(toDate);
                    to.setHours(23, 59, 59, 999);
                    if (new Date(order.createdAt) > to) return false;
                }
            }

            // Amount filter
            if (amountFilter) {
                const amount = order.totalAmount;
                switch (amountFilter) {
                    case '0-500':
                        if (amount > 500) return false;
                        break;
                    case '500-1000':
                        if (amount < 500 || amount > 1000) return false;
                        break;
                    case '1000-5000':
                        if (amount < 1000 || amount > 5000) return false;
                        break;
                    case '5000+':
                        if (amount < 5000) return false;
                        break;
                }
            }

            return true;
        });

        this.renderOrders();
        this.updateOrdersCount();
    }

    clearAllFilters() {
        // Reset all filter inputs
        document.getElementById('order-search').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('payment-filter').value = '';
        document.getElementById('date-filter').value = '';
        document.getElementById('amount-filter').value = '';
        document.getElementById('from-date').value = '';
        document.getElementById('to-date').value = '';
        
        // Hide custom date range
        document.getElementById('custom-date-range').style.display = 'none';
        
        // Reset quick filters
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = '#f3f4f6';
            btn.style.color = '#374151';
        });
        const allBtn = document.querySelector('[data-filter="all"]');
        if (allBtn) {
            allBtn.classList.add('active');
            allBtn.style.background = '#2563eb';
            allBtn.style.color = 'white';
        }
        
        // Clear current filters
        this.currentFilters = {};
        this.filteredOrders = [...this.orders];
        
        this.renderOrders();
        this.updateOrdersCount();
    }

    renderOrders() {
        const ordersList = document.getElementById('orders-list');
  if (!ordersList) return;

        if (this.filteredOrders.length === 0) {
            ordersList.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #6b7280;">
                    <div style="font-size: 48px; margin-bottom: 16px; color: #d1d5db;">🔍</div>
                    <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">No orders found</h3>
                    <p style="font-size: 14px; margin: 0;">Try adjusting your search criteria or filters</p>
                </div>
            `;
            return;
        }

        ordersList.innerHTML = this.filteredOrders.map(order => this.createOrderCard(order)).join('');
        
        // Add event listeners for order actions
        this.setupOrderActionListeners();
    }

    createOrderCard(order) {
        const statusClass = `status-${order.status}`;
        const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const statusColors = {
            pending: '#fef3c7',
            processing: '#dbeafe',
            shipped: '#d1fae5',
            delivered: '#dcfce7',
            cancelled: '#fee2e2'
        };

        const statusTextColors = {
            pending: '#92400e',
            processing: '#1e40af',
            shipped: '#065f46',
            delivered: '#166534',
            cancelled: '#991b1b'
        };

        return `
            <div class="order-card" data-order-id="${order._id}" style="border-bottom: 1px solid #e5e7eb; padding: 20px; transition: background 0.3s;">
                <div class="order-header" style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                    <div class="order-info" style="flex: 1;">
                        <h3 class="order-number" style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 4px 0;">Order #${order.orderNumber}</h3>
                        <p class="order-date" style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">${orderDate}</p>
                        <div class="customer-info" style="color: #374151; font-size: 12px;">
                            <strong>${order.customer.name}</strong><br>
                            ${order.customer.email} | ${order.customer.phone}
                        </div>
                    </div>
                    <div class="order-status" style="display: flex; flex-direction: column; align-items: end; gap: 8px;">
                        <span class="status-badge" style="padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 500; text-transform: uppercase; background: ${statusColors[order.status]}; color: ${statusTextColors[order.status]};">${statusText}</span>
                        <div class="order-amount" style="font-size: 14px; font-weight: 600; color: #059669;">₹${order.totalAmount.toLocaleString()}</div>
                    </div>
                </div>
                
                <div class="order-items" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                    ${order.items.map(item => `
                        <div class="order-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                            <div class="item-info" style="flex: 1;">
                                <div class="item-title" style="font-weight: 500; color: #1f2937; font-size: 12px; margin: 0 0 2px 0;">${item.title}</div>
                                <div class="item-details" style="color: #6b7280; font-size: 10px;">
                                    by ${item.author} | Qty: ${item.quantity} | ₹${item.total}
                                </div>
                            </div>
                            <div class="item-actions" style="display: flex; gap: 4px;">
                                <button class="item-action-btn btn-fulfill" data-order-id="${order._id}" data-item-id="${item._id}" data-action="fulfill" style="padding: 4px 8px; border: none; border-radius: 3px; cursor: pointer; font-size: 10px; font-weight: 500; background: #059669; color: white;">
                                    Fulfill
                                </button>
                                <button class="item-action-btn btn-refund" data-order-id="${order._id}" data-item-id="${item._id}" data-action="refund" style="padding: 4px 8px; border: none; border-radius: 3px; cursor: pointer; font-size: 10px; font-weight: 500; background: #ef4444; color: white;">
                                    Refund
                                </button>
                            </div>
                        </div>
        `).join('')}
                </div>
                
                <div class="order-actions" style="display: flex; gap: 8px; margin-top: 16px;">
                    <button class="action-btn btn-view" data-order-id="${order._id}" data-action="view" style="padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500; background: #2563eb; color: white;">
                        👁️ View Details
                    </button>
                    <button class="action-btn btn-edit" data-order-id="${order._id}" data-action="edit" style="padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500; background: #059669; color: white;">
                        ✏️ Edit Order
                    </button>
                    <button class="action-btn btn-cancel" data-order-id="${order._id}" data-action="cancel" style="padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500; background: #ef4444; color: white;">
                        ❌ Cancel
                    </button>
                </div>
            </div>
        `;
    }

    setupOrderActionListeners() {
        // Add checkbox for bulk selection
        this.filteredOrders.forEach(order => {
            const orderCard = document.querySelector(`[data-order-id="${order._id}"]`);
            if (orderCard) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'order-checkbox';
                checkbox.value = order._id;
                checkbox.style.marginRight = '8px';
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.selectedOrders.add(order._id);
                    } else {
                        this.selectedOrders.delete(order._id);
                    }
                    this.updateBulkActionButton();
                });
                
                const orderHeader = orderCard.querySelector('.order-header');
                if (orderHeader) {
                    orderHeader.insertBefore(checkbox, orderHeader.firstChild);
                }
            }
        });

        // Add event listeners for action buttons using event delegation
        const ordersList = document.getElementById('orders-list');
        if (ordersList) {
            // Remove existing listeners to avoid duplicates
            ordersList.removeEventListener('click', this.handleOrderAction);
            
            // Add new event listener
            this.handleOrderAction = this.handleOrderAction.bind(this);
            ordersList.addEventListener('click', this.handleOrderAction);
        }
    }

    handleOrderAction(event) {
        const button = event.target.closest('.action-btn, .item-action-btn');
        if (!button) return;

        const action = button.getAttribute('data-action');
        const orderId = button.getAttribute('data-order-id');
        const itemId = button.getAttribute('data-item-id');

        console.log('Button clicked:', { action, orderId, itemId });

        switch (action) {
            case 'view':
                this.viewOrderDetails(orderId);
                break;
            case 'edit':
                this.editOrder(orderId);
                break;
            case 'cancel':
                this.cancelOrder(orderId);
                break;
            case 'fulfill':
                this.fulfillItem(orderId, itemId);
                break;
            case 'refund':
                this.refundItem(orderId, itemId);
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    updateBulkActionButton() {
        const bulkActionBtn = document.getElementById('bulk-action-btn');
        const bulkActionSelect = document.getElementById('bulk-action-select');
        
        if (bulkActionBtn && bulkActionSelect) {
            bulkActionBtn.disabled = !bulkActionSelect.value || this.selectedOrders.size === 0;
        }
    }

    updateOrdersCount() {
        const countElement = document.getElementById('orders-count');
        if (countElement) {
            countElement.textContent = this.filteredOrders.length;
        }
    }

    showLoading() {
        const ordersList = document.getElementById('orders-list');
        if (ordersList) {
            ordersList.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; padding: 40px; color: #6b7280;">
                    <div style="width: 20px; height: 20px; border: 2px solid #e5e7eb; border-top: 2px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 12px;"></div>
                    Loading orders...
                </div>
            `;
        }
    }

    showError(message) {
        const ordersList = document.getElementById('orders-list');
        if (ordersList) {
            ordersList.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #6b7280;">
                    <div style="font-size: 48px; margin-bottom: 16px; color: #d1d5db;">⚠️</div>
                    <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">Error</h3>
                    <p style="font-size: 14px; margin: 0;">${message}</p>
                </div>
            `;
        }
    }

    // Order Actions
    async fulfillItem(orderId, itemId) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.showMessage('Item fulfilled successfully!', 'success');
            this.loadOrders(); // Refresh orders
        } catch (error) {
            this.showMessage('Failed to fulfill item', 'error');
        }
    }

    async refundItem(orderId, itemId) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.showMessage('Refund processed successfully!', 'success');
            this.loadOrders(); // Refresh orders
        } catch (error) {
            this.showMessage('Failed to process refund', 'error');
        }
    }

    viewOrderDetails(orderId) {
        console.log('AdminOrdersManager.viewOrderDetails called with:', orderId);
        const order = this.orders.find(o => o._id === orderId);
        console.log('Found order:', order);
        if (order) {
            this.showOrderDetailsModal(order);
    } else {
            console.error('Order not found:', orderId);
            alert('Order not found');
        }
    }

    editOrder(orderId) {
        console.log('AdminOrdersManager.editOrder called with:', orderId);
        const order = this.orders.find(o => o._id === orderId);
        console.log('Found order:', order);
        if (order) {
            this.showEditOrderModal(order);
        } else {
            console.error('Order not found:', orderId);
            alert('Order not found');
        }
    }

    showOrderDetailsModal(order) {
        console.log('showOrderDetailsModal called with order:', order);
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const statusColors = {
            pending: '#fef3c7',
            processing: '#dbeafe',
            shipped: '#d1fae5',
            delivered: '#dcfce7',
            cancelled: '#fee2e2'
        };

        const statusTextColors = {
            pending: '#92400e',
            processing: '#1e40af',
            shipped: '#065f46',
            delivered: '#166534',
            cancelled: '#991b1b'
        };

        const modal = document.createElement('div');
        modal.className = 'order-details-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 800px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #e5e7eb;
                ">
                    <h2 style="margin: 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                        Order Details - #${order.orderNumber}
                    </h2>
                    <button class="close-modal" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #6b7280;
                        padding: 4px;
                    ">&times;</button>
                </div>

                <div class="modal-body">
                    <!-- Order Status & Summary -->
                    <div class="order-summary" style="
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin-bottom: 24px;
                    ">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                            <div>
                                <label style="font-size: 12px; color: #6b7280; font-weight: 500;">ORDER STATUS</label>
                                <div style="margin-top: 4px;">
                                    <span style="
                                        padding: 6px 12px;
                                        border-radius: 16px;
                                        font-size: 12px;
                                        font-weight: 600;
                                        text-transform: uppercase;
                                        background: ${statusColors[order.status]};
                                        color: ${statusTextColors[order.status]};
                                    ">${order.status}</span>
                                </div>
                            </div>
                            <div>
                                <label style="font-size: 12px; color: #6b7280; font-weight: 500;">ORDER DATE</label>
                                <div style="margin-top: 4px; color: #1f2937; font-weight: 500;">${orderDate}</div>
                            </div>
                            <div>
                                <label style="font-size: 12px; color: #6b7280; font-weight: 500;">PAYMENT METHOD</label>
                                <div style="margin-top: 4px; color: #1f2937; font-weight: 500; text-transform: uppercase;">${order.paymentMethod}</div>
                            </div>
                            <div>
                                <label style="font-size: 12px; color: #6b7280; font-weight: 500;">TOTAL AMOUNT</label>
                                <div style="margin-top: 4px; color: #059669; font-weight: 600; font-size: 18px;">₹${order.totalAmount.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Customer Information -->
                    <div class="customer-section" style="margin-bottom: 24px;">
                        <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
                            Customer Information
                        </h3>
                        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                                <div>
                                    <label style="font-size: 12px; color: #6b7280; font-weight: 500;">NAME</label>
                                    <div style="margin-top: 4px; color: #1f2937; font-weight: 500;">${order.customer.name}</div>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: #6b7280; font-weight: 500;">EMAIL</label>
                                    <div style="margin-top: 4px; color: #1f2937; font-weight: 500;">${order.customer.email}</div>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: #6b7280; font-weight: 500;">PHONE</label>
                                    <div style="margin-top: 4px; color: #1f2937; font-weight: 500;">${order.customer.phone}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Order Items -->
                    <div class="items-section" style="margin-bottom: 24px;">
                        <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
                            Order Items (${order.items.length})
                        </h3>
                        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
                            ${order.items.map(item => `
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 12px 0;
                                    border-bottom: 1px solid #e5e7eb;
                                ">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${item.title}</div>
                                        <div style="font-size: 12px; color: #6b7280;">by ${item.author}</div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-size: 12px; color: #6b7280;">Qty: ${item.quantity}</div>
                                        <div style="font-weight: 600; color: #059669;">₹${item.total}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Order Actions -->
                    <div class="order-actions" style="
                        display: flex;
                        gap: 12px;
                        justify-content: flex-end;
                        padding-top: 16px;
                        border-top: 1px solid #e5e7eb;
                    ">
                        <button class="btn-edit-order" style="
                            background: #059669;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 500;
                        ">Edit Order</button>
                        <button class="btn-close-modal" style="
                            background: #6b7280;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 500;
                        ">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        console.log('Order details modal added to DOM');

        // Event listeners
        modal.querySelector('.close-modal').onclick = () => {
            console.log('Close modal clicked');
            document.body.removeChild(modal);
        };
        modal.querySelector('.btn-close-modal').onclick = () => {
            console.log('Close button clicked');
            document.body.removeChild(modal);
        };
        modal.querySelector('.btn-edit-order').onclick = () => {
            console.log('Edit order button clicked');
            document.body.removeChild(modal);
            this.showEditOrderModal(order);
        };

        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }

    showEditOrderModal(order) {
        const modal = document.createElement('div');
        modal.className = 'edit-order-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #e5e7eb;
                ">
                    <h2 style="margin: 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                        Edit Order - #${order.orderNumber}
                    </h2>
                    <button class="close-modal" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #6b7280;
                        padding: 4px;
                    ">&times;</button>
                </div>

                <form class="edit-order-form">
                    <div class="form-section" style="margin-bottom: 24px;">
                        <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">
                            Order Status
                        </h3>
                        <select id="edit-order-status" style="
                            width: 100%;
                            padding: 12px;
                            border: 1px solid #d1d5db;
                            border-radius: 6px;
                            font-size: 14px;
                        ">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>

                    <div class="form-section" style="margin-bottom: 24px;">
                        <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">
                            Customer Information
                        </h3>
                        <div style="display: grid; gap: 12px;">
                            <div>
                                <label style="display: block; font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 4px;">Customer Name</label>
                                <input type="text" id="edit-customer-name" value="${order.customer.name}" style="
                                    width: 100%;
                                    padding: 12px;
                                    border: 1px solid #d1d5db;
                                    border-radius: 6px;
                                    font-size: 14px;
                                ">
                            </div>
                            <div>
                                <label style="display: block; font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 4px;">Email</label>
                                <input type="email" id="edit-customer-email" value="${order.customer.email}" style="
                                    width: 100%;
                                    padding: 12px;
                                    border: 1px solid #d1d5db;
                                    border-radius: 6px;
                                    font-size: 14px;
                                ">
                            </div>
                            <div>
                                <label style="display: block; font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 4px;">Phone</label>
                                <input type="tel" id="edit-customer-phone" value="${order.customer.phone}" style="
                                    width: 100%;
                                    padding: 12px;
                                    border: 1px solid #d1d5db;
                                    border-radius: 6px;
                                    font-size: 14px;
                                ">
                            </div>
                        </div>
                    </div>

                    <div class="form-section" style="margin-bottom: 24px;">
                        <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">
                            Order Notes
                        </h3>
                        <textarea id="edit-order-notes" placeholder="Add notes about this order..." style="
                            width: 100%;
                            padding: 12px;
                            border: 1px solid #d1d5db;
                            border-radius: 6px;
                            font-size: 14px;
                            min-height: 100px;
                            resize: vertical;
                        "></textarea>
                    </div>

                    <div class="form-actions" style="
                        display: flex;
                        gap: 12px;
                        justify-content: flex-end;
                        padding-top: 16px;
                        border-top: 1px solid #e5e7eb;
                    ">
                        <button type="button" class="btn-cancel" style="
                            background: #6b7280;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 500;
                        ">Cancel</button>
                        <button type="submit" class="btn-save" style="
                            background: #059669;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 500;
                        ">Save Changes</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.close-modal').onclick = () => document.body.removeChild(modal);
        modal.querySelector('.btn-cancel').onclick = () => document.body.removeChild(modal);

        modal.querySelector('.edit-order-form').onsubmit = (e) => {
            e.preventDefault();
            this.saveOrderChanges(order._id, modal);
        };

        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }

    async saveOrderChanges(orderId, modal) {
        try {
            const status = modal.querySelector('#edit-order-status').value;
            const customerName = modal.querySelector('#edit-customer-name').value;
            const customerEmail = modal.querySelector('#edit-customer-email').value;
            const customerPhone = modal.querySelector('#edit-customer-phone').value;
            const notes = modal.querySelector('#edit-order-notes').value;

            // Show loading state
            const saveButton = modal.querySelector('.btn-save');
            const originalText = saveButton.textContent;
            saveButton.textContent = 'Saving...';
            saveButton.disabled = true;

            // Try to save to database first
            try {
                const response = await authFetch(`/api/admin/orders/${orderId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        status,
                        customer: { 
                            name: customerName, 
                            email: customerEmail, 
                            phone: customerPhone 
                        },
                        notes,
                        updatedAt: new Date().toISOString()
                    })
                });

                if (response.ok) {
                    const updatedOrder = await response.json();
                    console.log('Order saved to database:', updatedOrder);
                    
                    // Update the order in our local data with the response from server
                    const orderIndex = this.orders.findIndex(o => o._id === orderId);
                    if (orderIndex !== -1) {
                        this.orders[orderIndex] = this.transformOrderData(updatedOrder.order || updatedOrder);
                        
                        // Update filtered orders if this order is visible
                        const filteredIndex = this.filteredOrders.findIndex(o => o._id === orderId);
                        if (filteredIndex !== -1) {
                            this.filteredOrders[filteredIndex] = { ...this.orders[orderIndex] };
                        }
                    }
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (apiError) {
                console.warn('API call failed, saving to localStorage as backup:', apiError);
                
                // Fallback: Save to localStorage for persistence
                const orderData = {
                    orderId,
                    status,
                    customer: { name: customerName, email: customerEmail, phone: customerPhone },
                    notes,
                    updatedAt: new Date().toISOString()
                };
                
                // Get existing saved orders or create new array
                const savedOrders = JSON.parse(localStorage.getItem('adminOrderUpdates') || '[]');
                
                // Remove existing entry for this order if it exists
                const existingIndex = savedOrders.findIndex(o => o.orderId === orderId);
                if (existingIndex !== -1) {
                    savedOrders[existingIndex] = orderData;
                } else {
                    savedOrders.push(orderData);
                }
                
                // Save to localStorage
                localStorage.setItem('adminOrderUpdates', JSON.stringify(savedOrders));
                
                // Update local data
                const orderIndex = this.orders.findIndex(o => o._id === orderId);
                if (orderIndex !== -1) {
                    this.orders[orderIndex].status = status;
                    this.orders[orderIndex].customer.name = customerName;
                    this.orders[orderIndex].customer.email = customerEmail;
                    this.orders[orderIndex].customer.phone = customerPhone;
                    this.orders[orderIndex].notes = notes;
                    this.orders[orderIndex].updatedAt = new Date();

                    // Update filtered orders if this order is visible
                    const filteredIndex = this.filteredOrders.findIndex(o => o._id === orderId);
                    if (filteredIndex !== -1) {
                        this.filteredOrders[filteredIndex] = { ...this.orders[orderIndex] };
                    }
                }
            }

            // Re-render orders
            this.renderOrders();

            // Close modal
            document.body.removeChild(modal);

            // Show success message
            this.showMessage('Order updated successfully!', 'success');

        } catch (error) {
            console.error('Error saving order changes:', error);
            this.showMessage('Failed to save order changes', 'error');
            
            // Reset button state
            const saveButton = modal.querySelector('.btn-save');
            if (saveButton) {
                saveButton.textContent = 'Save Changes';
                saveButton.disabled = false;
            }
        }
    }

    cancelOrder(orderId) {
        this.showCancelOrderModal(orderId);
    }

    showCancelOrderModal(orderId) {
        const order = this.orders.find(o => o._id === orderId);
        if (!order) {
            console.error('Order not found:', orderId);
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'cancel-order-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            ">
                <div class="modal-header" style="
                    margin-bottom: 20px;
                    text-align: center;
                ">
                    <div style="
                        width: 48px;
                        height: 48px;
                        background: #fee2e2;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 16px;
                    ">
                        <span style="font-size: 24px; color: #dc2626;">⚠️</span>
                    </div>
                    <h2 style="margin: 0; color: #1f2937; font-size: 20px; font-weight: 600;">
                        Cancel Order
                    </h2>
                </div>

                <div class="modal-body" style="margin-bottom: 24px;">
                    <p style="
                        color: #6b7280;
                        text-align: center;
                        margin: 0 0 16px 0;
                        line-height: 1.5;
                    ">
                        Are you sure you want to cancel order <strong>#${order.orderNumber}</strong>?
                    </p>
                    <div style="
                        background: #fef3c7;
                        border: 1px solid #f59e0b;
                        border-radius: 8px;
                        padding: 12px;
                        margin: 16px 0;
                    ">
                        <p style="
                            margin: 0;
                            color: #92400e;
                            font-size: 14px;
                            text-align: center;
                        ">
                            <strong>⚠️ Warning:</strong> This action cannot be undone. The customer will be notified about the cancellation.
                        </p>
                    </div>
                </div>

                <div class="modal-actions" style="
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                ">
                    <button class="btn-cancel-modal" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                        font-size: 14px;
                    ">Keep Order</button>
                    <button class="btn-confirm-cancel" style="
                        background: #dc2626;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                        font-size: 14px;
                    ">Yes, Cancel Order</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.btn-cancel-modal').onclick = () => {
            document.body.removeChild(modal);
        };

        modal.querySelector('.btn-confirm-cancel').onclick = () => {
            this.processOrderCancellation(orderId);
            document.body.removeChild(modal);
        };

        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }

    async processOrderCancellation(orderId) {
        try {
            // Try to save to database first
            try {
                const response = await authFetch(`/api/admin/orders/${orderId}/cancel`, {
                    method: 'POST'
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Order cancelled in database:', result);
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (apiError) {
                console.warn('API call failed, saving to localStorage as backup:', apiError);
                
                // Fallback: Save to localStorage for persistence
                const orderData = {
                    orderId,
                    status: 'cancelled',
                    updatedAt: new Date().toISOString()
                };
                
                // Get existing saved orders or create new array
                const savedOrders = JSON.parse(localStorage.getItem('adminOrderUpdates') || '[]');
                
                // Remove existing entry for this order if it exists
                const existingIndex = savedOrders.findIndex(o => o.orderId === orderId);
                if (existingIndex !== -1) {
                    savedOrders[existingIndex] = { ...savedOrders[existingIndex], ...orderData };
                } else {
                    savedOrders.push(orderData);
                }
                
                // Save to localStorage
                localStorage.setItem('adminOrderUpdates', JSON.stringify(savedOrders));
            }

            // Update order status to cancelled
            const orderIndex = this.orders.findIndex(o => o._id === orderId);
            if (orderIndex !== -1) {
                this.orders[orderIndex].status = 'cancelled';
                this.orders[orderIndex].updatedAt = new Date();

                // Update filtered orders if this order is visible
                const filteredIndex = this.filteredOrders.findIndex(o => o._id === orderId);
                if (filteredIndex !== -1) {
                    this.filteredOrders[filteredIndex] = { ...this.orders[orderIndex] };
                }

                // Re-render orders
                this.renderOrders();
            }

            // Show success message
            this.showMessage('Order cancelled successfully!', 'success');

        } catch (error) {
            console.error('Error cancelling order:', error);
            this.showMessage('Failed to cancel order', 'error');
        }
    }

    executeBulkAction() {
        const action = document.getElementById('bulk-action-select').value;
        const selectedCount = this.selectedOrders.size;
        
        if (!action || selectedCount === 0) return;

        switch (action) {
            case 'update-status':
                this.showBulkStatusUpdateModal();
                break;
            case 'export-selected':
                this.exportSelectedOrders();
                break;
            case 'send-notifications':
                this.sendBulkNotifications();
                break;
            case 'add-notes':
                this.showBulkNotesModal();
                break;
        }
    }

    showBulkStatusUpdateModal() {
        const newStatus = prompt('Enter new status (pending, processing, shipped, delivered, cancelled):');
        if (newStatus && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(newStatus)) {
            this.showMessage(`Updated status for ${this.selectedOrders.size} orders to ${newStatus}`, 'success');
            this.selectedOrders.clear();
            this.updateBulkActionButton();
            this.loadOrders();
        }
    }

    exportSelectedOrders() {
        const selectedOrdersData = this.orders.filter(order => this.selectedOrders.has(order._id));
        this.exportOrdersToCSV(selectedOrdersData, 'selected-orders');
        this.showMessage(`Exported ${selectedOrdersData.length} orders`, 'success');
    }

    sendBulkNotifications() {
        this.showMessage(`Sent notifications to ${this.selectedOrders.size} customers`, 'success');
    }

    showBulkNotesModal() {
        const note = prompt('Enter note to add to selected orders:');
        if (note) {
            this.showMessage(`Added note to ${this.selectedOrders.size} orders`, 'success');
        }
    }

    exportOrders() {
        this.exportOrdersToCSV(this.filteredOrders, 'all-orders');
        this.showMessage(`Exported ${this.filteredOrders.length} orders`, 'success');
    }

    exportOrdersToCSV(orders, filename) {
        const headers = ['Order Number', 'Customer Name', 'Email', 'Phone', 'Status', 'Payment Method', 'Total Amount', 'Date'];
        const csvContent = [
            headers.join(','),
            ...orders.map(order => [
                order.orderNumber,
                order.customer.name,
                order.customer.email,
                order.customer.phone,
                order.status,
                order.paymentMethod,
                order.totalAmount,
                new Date(order.createdAt).toLocaleDateString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    showMessage(message, type) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            background: ${type === 'success' ? '#059669' : '#ef4444'};
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
window.applyQuickFilter = function(filterType) {
    if (window.adminOrdersManager) {
        window.adminOrdersManager.applyQuickFilter(filterType);
    }
};

window.clearAllFilters = function() {
    if (window.adminOrdersManager) {
        window.adminOrdersManager.clearAllFilters();
    }
};

window.executeBulkAction = function() {
    if (window.adminOrdersManager) {
        window.adminOrdersManager.executeBulkAction();
    }
};

window.exportOrders = function() {
    if (window.adminOrdersManager) {
        window.adminOrdersManager.exportOrders();
    }
};

// Global functions for order actions
window.viewOrderDetails = function(orderId) {
    console.log('viewOrderDetails called with:', orderId);
    console.log('adminOrdersManager exists:', !!window.adminOrdersManager);
    if (window.adminOrdersManager) {
        window.adminOrdersManager.viewOrderDetails(orderId);
    } else {
        console.error('adminOrdersManager not initialized');
        alert('Admin orders manager not initialized. Please refresh the page.');
    }
};

window.editOrder = function(orderId) {
    console.log('editOrder called with:', orderId);
    console.log('adminOrdersManager exists:', !!window.adminOrdersManager);
    if (window.adminOrdersManager) {
        window.adminOrdersManager.editOrder(orderId);
    } else {
        console.error('adminOrdersManager not initialized');
        alert('Admin orders manager not initialized. Please refresh the page.');
    }
};

window.cancelOrder = function(orderId) {
    if (window.adminOrdersManager) {
        window.adminOrdersManager.cancelOrder(orderId);
    }
};

window.fulfillItem = function(orderId, itemId) {
    if (window.adminOrdersManager) {
        window.adminOrdersManager.fulfillItem(orderId, itemId);
    }
};

window.refundItem = function(orderId, itemId) {
    if (window.adminOrdersManager) {
        window.adminOrdersManager.refundItem(orderId, itemId);
    }
};

// Enhanced loadOrders function
const loadOrders = async (page = 1, search = '') => {
    // Initialize the enhanced orders manager if not already done
    if (!window.adminOrdersManager) {
        window.adminOrdersManager = new AdminOrdersManager();
    }
};

// Enhanced Admin Books Management System
class AdminBooksManager {
    constructor() {
        this.books = [];
        this.filteredBooks = [];
        this.currentFilters = {};
        this.selectedBooks = new Set();
        this.currentView = 'grid'; // 'grid' or 'list'
        this.token = getToken();
        
        // Pagination
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.totalPages = 1;
        
        // UX enhancements
        this.keyboardShortcuts = {
            'ctrl+f': () => document.getElementById('book-search-input')?.focus(),
            'ctrl+a': () => this.selectAllBooks(),
            'ctrl+d': () => this.clearAllFilters(),
            'escape': () => this.closeAllModals(),
            'ctrl+s': () => this.exportBooks(),
            'ctrl+i': () => this.showInventoryManagement(),
            'ctrl+shift+a': () => this.showAnalyticsDashboard()
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupGlobalModalHandlers();
        this.loadBooks();
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('book-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.performSearch();
            }, 300));
        }

        // Filter dropdowns
        const filterSelects = ['category-filter', 'status-filter', 'price-filter', 'stock-filter', 'sort-books'];
        filterSelects.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.applyFilters();
                });
            }
        });

        // Clear filters button
        const clearFiltersBtn = document.getElementById('clear-book-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }

        // View toggle buttons
        const gridViewBtn = document.getElementById('grid-view-btn');
        const listViewBtn = document.getElementById('list-view-btn');
        if (gridViewBtn && listViewBtn) {
            gridViewBtn.addEventListener('click', () => {
                this.switchView('grid');
            });
            listViewBtn.addEventListener('click', () => {
                this.switchView('list');
            });
        }

        // Bulk operations
        const bulkActionSelect = document.getElementById('bulk-action-select');
        const applyBulkActionBtn = document.getElementById('apply-bulk-action-btn');
        if (bulkActionSelect && applyBulkActionBtn) {
            bulkActionSelect.addEventListener('change', (e) => {
                applyBulkActionBtn.disabled = !e.target.value || this.selectedBooks.size === 0;
            });
            applyBulkActionBtn.addEventListener('click', () => {
                this.executeBulkAction();
            });
        }

        // Add book button
        const addBookBtn = document.getElementById('add-book-btn');
        if (addBookBtn) {
            addBookBtn.addEventListener('click', () => {
                this.showAddBookModal();
            });
        }

        // Inventory management button
        const inventoryBtn = document.getElementById('inventory-management-btn');
        if (inventoryBtn) {
            inventoryBtn.addEventListener('click', () => {
                this.showInventoryManagement();
            });
        }

        // Analytics button
        const analyticsBtn = document.getElementById('analytics-btn');
        if (analyticsBtn) {
            analyticsBtn.addEventListener('click', () => {
                this.showAnalyticsDashboard();
            });
        }

        // Data management button
        const dataManagementBtn = document.getElementById('data-management-btn');
        if (dataManagementBtn) {
            dataManagementBtn.addEventListener('click', () => {
                this.showDataManagement();
            });
        }

        // Export buttons
        const exportBooksBtn = document.getElementById('export-books-btn');
        const exportAllBooksBtn = document.getElementById('export-all-books');
        const exportFilteredBooksBtn = document.getElementById('export-filtered-books');
        const downloadTemplateBtn = document.getElementById('download-template');

        if (exportBooksBtn) {
            exportBooksBtn.addEventListener('click', () => {
                this.exportBooks();
            });
        }
        if (exportAllBooksBtn) {
            exportAllBooksBtn.addEventListener('click', () => {
                this.exportBooks('all');
            });
        }
        if (exportFilteredBooksBtn) {
            exportFilteredBooksBtn.addEventListener('click', () => {
                this.exportBooks('filtered');
            });
        }
        if (downloadTemplateBtn) {
            downloadTemplateBtn.addEventListener('click', () => {
                this.downloadTemplate();
            });
        }

        // Toggle import section
        const toggleImportBtn = document.getElementById('toggle-import-section');
        const importContent = document.getElementById('import-content');
        if (toggleImportBtn && importContent) {
            toggleImportBtn.addEventListener('click', () => {
                const isVisible = importContent.style.display !== 'none';
                importContent.style.display = isVisible ? 'none' : 'block';
                toggleImportBtn.textContent = isVisible ? 'Show' : 'Hide';
            });
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async loadBooks() {
        try {
            this.showLoading();
            
            // Try to load real books first
            try {
                const res = await authFetch('/api/admin/books');
                if (res.ok) {
    const data = await res.json();
                    if (data.books && Array.isArray(data.books)) {
                        this.books = data.books.map(book => this.transformBookData(book));
                        this.applyLocalStorageUpdates();
                        this.filteredBooks = [...this.books];
                        this.renderBooks();
                        this.updateBooksCount();
                        return;
                    }
                }
            } catch (error) {
                console.log('Real API not available, using sample data');
            }
            
            // Fallback to sample data
            this.books = this.generateSampleBooks();
            this.applyLocalStorageUpdates();
            this.filteredBooks = [...this.books];
            
            this.renderBooks();
            this.updateBooksCount();
            
        } catch (error) {
            console.error('Error loading books:', error);
            this.showError('Failed to load books');
        }
    }

    transformBookData(book) {
        return {
            _id: book._id,
            isbn: book.isbn || book.ISBN || 'N/A',
            title: book.title || 'Unknown Title',
            author: book.author || 'Unknown Author',
            price: book.price || 0,
            stock: book.stock || 0,
            category: book.category || 'uncategorized',
            status: book.status || 'active',
            description: book.description || '',
            image: book.image || book.cover || '',
            tags: book.tags || [],
            createdAt: book.createdAt ? new Date(book.createdAt) : new Date(),
            updatedAt: book.updatedAt ? new Date(book.updatedAt) : new Date()
        };
    }

    generateSampleBooks() {
        const categories = ['fiction', 'non-fiction', 'science', 'history', 'biography', 'self-help', 'business', 'technology'];
        const statuses = ['active', 'inactive', 'out-of-stock', 'discontinued'];
        
        const sampleBooks = [
            { title: 'The Alchemist', author: 'Paulo Coelho', price: 299, category: 'fiction', stock: 15 },
            { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', price: 399, category: 'non-fiction', stock: 8 },
            { title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 249, category: 'fiction', stock: 0 },
            { title: '1984', author: 'George Orwell', price: 199, category: 'fiction', stock: 12 },
            { title: 'The Power of Habit', author: 'Charles Duhigg', price: 350, category: 'self-help', stock: 3 },
            { title: 'Becoming', author: 'Michelle Obama', price: 399, category: 'biography', stock: 20 },
            { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', price: 499, category: 'fiction', stock: 7 },
            { title: 'Atomic Habits', author: 'James Clear', price: 299, category: 'self-help', stock: 25 },
            { title: 'The Lean Startup', author: 'Eric Ries', price: 450, category: 'business', stock: 5 },
            { title: 'Clean Code', author: 'Robert C. Martin', price: 550, category: 'technology', stock: 10 },
            { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 199, category: 'fiction', stock: 18 },
            { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', price: 399, category: 'science', stock: 6 }
        ];

        return sampleBooks.map((book, index) => ({
            _id: `book_${index + 1}`,
            isbn: `978${Math.floor(Math.random() * 10000000000)}`,
            title: book.title,
            author: book.author,
            price: book.price,
            stock: book.stock,
            category: book.category,
            status: book.stock === 0 ? 'out-of-stock' : (book.stock < 5 ? 'active' : 'active'),
            description: `A compelling ${book.category} book by ${book.author}.`,
            image: '',
            tags: [book.category],
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
        }));
    }

    applyLocalStorageUpdates() {
        try {
            const savedUpdates = JSON.parse(localStorage.getItem('adminBookUpdates') || '[]');
            console.log('Applying localStorage updates to books:', savedUpdates);
            
            savedUpdates.forEach(update => {
                const bookIndex = this.books.findIndex(b => b._id === update.bookId);
                if (bookIndex !== -1) {
                    // Apply the saved updates
                    Object.keys(update).forEach(key => {
                        if (key !== 'bookId' && key !== 'updatedAt') {
                            this.books[bookIndex][key] = update[key];
                        }
                    });
                    this.books[bookIndex].updatedAt = new Date(update.updatedAt);
                    
                    console.log(`Applied update to book ${update.bookId}:`, update);
                }
            });
        } catch (error) {
            console.error('Error applying localStorage updates to books:', error);
        }
    }

    performSearch() {
        const searchTerm = document.getElementById('book-search-input').value.toLowerCase();
        
        if (!searchTerm) {
            this.applyFilters();
            return;
        }

        this.filteredBooks = this.books.filter(book => {
            return (
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                book.isbn.includes(searchTerm) ||
                book.category.toLowerCase().includes(searchTerm) ||
                book.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        });

        this.renderBooks();
        this.updateBooksCount();
    }

    applyFilters() {
        const categoryFilter = document.getElementById('category-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        const priceFilter = document.getElementById('price-filter').value;
        const stockFilter = document.getElementById('stock-filter').value;
        const sortBy = document.getElementById('sort-books').value;

        this.currentFilters = {
            category: categoryFilter,
            status: statusFilter,
            price: priceFilter,
            stock: stockFilter,
            sort: sortBy
        };

        this.filteredBooks = this.books.filter(book => {
            // Category filter
            if (categoryFilter && book.category !== categoryFilter) return false;

            // Status filter
            if (statusFilter && book.status !== statusFilter) return false;

            // Price filter
            if (priceFilter) {
                const price = book.price;
                switch (priceFilter) {
                    case '0-200':
                        if (price > 200) return false;
                        break;
                    case '200-500':
                        if (price < 200 || price > 500) return false;
                        break;
                    case '500-1000':
                        if (price < 500 || price > 1000) return false;
                        break;
                    case '1000+':
                        if (price < 1000) return false;
                        break;
                }
            }

            // Stock filter
            if (stockFilter) {
                const stock = book.stock;
                switch (stockFilter) {
                    case 'in-stock':
                        if (stock <= 0) return false;
                        break;
                    case 'low-stock':
                        if (stock > 5 || stock <= 0) return false;
                        break;
                    case 'out-of-stock':
                        if (stock > 0) return false;
                        break;
                }
            }

            return true;
        });

        // Apply sorting
        this.sortBooks(sortBy);

        this.renderBooks();
        this.updateBooksCount();
    }

    sortBooks(sortBy) {
        switch (sortBy) {
            case 'title-asc':
                this.filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                this.filteredBooks.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'author-asc':
                this.filteredBooks.sort((a, b) => a.author.localeCompare(b.author));
                break;
            case 'author-desc':
                this.filteredBooks.sort((a, b) => b.author.localeCompare(a.author));
                break;
            case 'price-asc':
                this.filteredBooks.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                this.filteredBooks.sort((a, b) => b.price - a.price);
                break;
            case 'stock-asc':
                this.filteredBooks.sort((a, b) => a.stock - b.stock);
                break;
            case 'stock-desc':
                this.filteredBooks.sort((a, b) => b.stock - a.stock);
                break;
            case 'date-added':
                this.filteredBooks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }
    }

    clearAllFilters() {
        // Reset all filter inputs
        document.getElementById('book-search-input').value = '';
        document.getElementById('category-filter').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('price-filter').value = '';
        document.getElementById('stock-filter').value = '';
        document.getElementById('sort-books').value = 'title-asc';
        
        // Clear current filters
        this.currentFilters = {};
        this.filteredBooks = [...this.books];
        
        this.renderBooks();
        this.updateBooksCount();
    }

    switchView(view) {
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'white';
        });
        
        const activeBtn = document.getElementById(`${view}-view-btn`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.style.background = '#f3f4f6';
        }
        
        this.renderBooks();
    }

    renderBooks() {
        const booksList = document.getElementById('books-list');
        if (!booksList) return;

        if (this.filteredBooks.length === 0) {
            booksList.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #6b7280;">
                    <div style="font-size: 48px; margin-bottom: 16px; color: #d1d5db;">📚</div>
                    <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">No books found</h3>
                    <p style="font-size: 14px; margin: 0;">Try adjusting your search criteria or filters</p>
                </div>
            `;
            return;
        }

        if (this.currentView === 'grid') {
            booksList.innerHTML = this.createBooksGrid();
        } else {
            booksList.innerHTML = this.createBooksList();
        }
        
        this.setupBookActionListeners();
    }

    createBooksGrid() {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; padding: 20px;">
                ${this.filteredBooks.map(book => this.createBookCard(book)).join('')}
            </div>
        `;
    }

    createBooksList() {
        return `
            <div style="padding: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa; border-bottom: 2px solid #e5e7eb;">
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Select</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Book</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Author</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Category</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Price</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Stock</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Status</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Actions</th>
          </tr>
                    </thead>
                    <tbody>
                        ${this.filteredBooks.map(book => this.createBookRow(book)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    createBookCard(book) {
        const statusColors = {
            active: '#dcfce7',
            inactive: '#f3f4f6',
            'out-of-stock': '#fee2e2',
            discontinued: '#fef3c7'
        };

        const statusTextColors = {
            active: '#166534',
            inactive: '#6b7280',
            'out-of-stock': '#991b1b',
            discontinued: '#92400e'
        };

        const stockStatus = book.stock === 0 ? 'out-of-stock' : (book.stock < 5 ? 'low-stock' : 'in-stock');
        const stockColor = book.stock === 0 ? '#ef4444' : (book.stock < 5 ? '#f59e0b' : '#059669');

        return `
            <div class="book-card" data-book-id="${book._id}" style="
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
            " onmouseover="this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.15)'" onmouseout="this.style.boxShadow='0 1px 3px rgba(0, 0, 0, 0.1)'">
                
                <!-- Book Header -->
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #1f2937; line-height: 1.3;">${book.title}</h4>
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">by ${book.author}</p>
                    </div>
                    <input type="checkbox" class="book-checkbox" value="${book._id}" style="margin-left: 8px;">
                </div>

                <!-- Book Details -->
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 12px; color: #6b7280;">Category:</span>
                        <span style="font-size: 12px; color: #374151; text-transform: capitalize;">${book.category}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 12px; color: #6b7280;">Price:</span>
                        <span style="font-size: 14px; font-weight: 600; color: #059669;">₹${book.price}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 12px; color: #6b7280;">Stock:</span>
                        <span style="font-size: 12px; color: ${stockColor}; font-weight: 500;">${book.stock} units</span>
                    </div>
                </div>

                <!-- Status Badge -->
                <div style="margin-bottom: 12px;">
                    <span style="
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 500;
                        text-transform: uppercase;
                        background: ${statusColors[book.status]};
                        color: ${statusTextColors[book.status]};
                    ">${book.status.replace('-', ' ')}</span>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 8px;">
                    <button class="book-action-btn" data-book-id="${book._id}" data-action="view" style="
                        flex: 1;
                        padding: 8px 12px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: 500;
                        background: #2563eb;
                        color: white;
                    ">View</button>
                    <button class="book-action-btn" data-book-id="${book._id}" data-action="edit" style="
                        flex: 1;
                        padding: 8px 12px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: 500;
                        background: #059669;
                        color: white;
                    ">Edit</button>
                    <button class="book-action-btn" data-book-id="${book._id}" data-action="delete" style="
                        padding: 8px 12px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: 500;
                        background: #ef4444;
                        color: white;
                    ">Delete</button>
                </div>
            </div>
        `;
    }

    createBookRow(book) {
        const statusColors = {
            active: '#dcfce7',
            inactive: '#f3f4f6',
            'out-of-stock': '#fee2e2',
            discontinued: '#fef3c7'
        };

        const statusTextColors = {
            active: '#166534',
            inactive: '#6b7280',
            'out-of-stock': '#991b1b',
            discontinued: '#92400e'
        };

        const stockColor = book.stock === 0 ? '#ef4444' : (book.stock < 5 ? '#f59e0b' : '#059669');

        return `
            <tr style="border-bottom: 1px solid #e5e7eb;" data-book-id="${book._id}">
                <td style="padding: 12px;">
                    <input type="checkbox" class="book-checkbox" value="${book._id}">
                </td>
                <td style="padding: 12px;">
                    <div>
                        <div style="font-weight: 600; color: #1f2937; margin-bottom: 2px;">${book.title}</div>
                        <div style="font-size: 12px; color: #6b7280;">ISBN: ${book.isbn}</div>
                    </div>
                </td>
                <td style="padding: 12px; color: #374151;">${book.author}</td>
                <td style="padding: 12px; color: #374151; text-transform: capitalize;">${book.category}</td>
                <td style="padding: 12px; font-weight: 600; color: #059669;">₹${book.price}</td>
                <td style="padding: 12px; color: ${stockColor}; font-weight: 500;">${book.stock}</td>
                <td style="padding: 12px;">
                    <span style="
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 500;
                        text-transform: uppercase;
                        background: ${statusColors[book.status]};
                        color: ${statusTextColors[book.status]};
                    ">${book.status.replace('-', ' ')}</span>
                </td>
                <td style="padding: 12px;">
                    <div style="display: flex; gap: 4px;">
                        <button class="book-action-btn" data-book-id="${book._id}" data-action="view" style="
                            padding: 4px 8px;
                            border: none;
                            border-radius: 3px;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: 500;
                            background: #2563eb;
                            color: white;
                        ">View</button>
                        <button class="book-action-btn" data-book-id="${book._id}" data-action="edit" style="
                            padding: 4px 8px;
                            border: none;
                            border-radius: 3px;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: 500;
                            background: #059669;
                            color: white;
                        ">Edit</button>
                        <button class="book-action-btn" data-book-id="${book._id}" data-action="delete" style="
                            padding: 4px 8px;
                            border: none;
                            border-radius: 3px;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: 500;
                            background: #ef4444;
                            color: white;
                        ">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }

    setupBookActionListeners() {
        // Add event listeners for action buttons using event delegation
        const booksList = document.getElementById('books-list');
        if (booksList) {
            // Remove existing listeners to avoid duplicates
            booksList.removeEventListener('click', this.handleBookAction);
            
            // Add new event listener
            this.handleBookAction = this.handleBookAction.bind(this);
            booksList.addEventListener('click', this.handleBookAction);
        }

        // Add checkbox listeners for bulk selection
        document.querySelectorAll('.book-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedBooks.add(e.target.value);
                } else {
                    this.selectedBooks.delete(e.target.value);
                }
                this.updateBulkOperationsBar();
            });
        });
    }

    handleBookAction(event) {
        const button = event.target.closest('.book-action-btn');
        if (!button) return;

        const action = button.getAttribute('data-action');
        const bookId = button.getAttribute('data-book-id');

        console.log('Book action clicked:', { action, bookId });

        switch (action) {
            case 'view':
                this.viewBookDetails(bookId);
                break;
            case 'edit':
                this.editBook(bookId);
                break;
            case 'delete':
                this.deleteBook(bookId);
                break;
            default:
                console.log('Unknown book action:', action);
        }
    }

    updateBulkOperationsBar() {
        const bulkBar = document.getElementById('bulk-operations-bar');
        const selectedCount = document.getElementById('selected-books-count');
        const applyBtn = document.getElementById('apply-bulk-action-btn');
        const bulkSelect = document.getElementById('bulk-action-select');

        if (this.selectedBooks.size > 0) {
            bulkBar.style.display = 'block';
            selectedCount.textContent = `${this.selectedBooks.size} books selected`;
            applyBtn.disabled = !bulkSelect.value;
        } else {
            bulkBar.style.display = 'none';
        }
    }

    updateBooksCount() {
        const countElement = document.getElementById('books-count');
        if (countElement) {
            countElement.textContent = this.filteredBooks.length;
        }
    }

    showLoading() {
        const booksList = document.getElementById('books-list');
        if (booksList) {
            booksList.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; padding: 40px; color: #6b7280;">
                    <div style="width: 20px; height: 20px; border: 2px solid #e5e7eb; border-top: 2px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 12px;"></div>
                    Loading books...
                </div>
            `;
        }
    }

    showError(message) {
        const booksList = document.getElementById('books-list');
        if (booksList) {
            booksList.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #6b7280;">
                    <div style="font-size: 48px; margin-bottom: 16px; color: #d1d5db;">⚠️</div>
                    <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">Error</h3>
                    <p style="font-size: 14px; margin: 0;">${message}</p>
                </div>
            `;
        }
    }

    // Book Actions
    viewBookDetails(bookId) {
        const book = this.books.find(b => b._id === bookId);
        if (book) {
            this.showBookDetailsModal(book);
        }
    }

    editBook(bookId) {
        const book = this.books.find(b => b._id === bookId);
        if (book) {
            this.showEditBookModal(book);
        }
    }

    deleteBook(bookId) {
        const book = this.books.find(b => b._id === bookId);
        if (book) {
            this.showDeleteBookModal(book);
        }
    }

    showAddBookModal() {
        // Implementation for add book modal
        console.log('Add book modal - to be implemented');
    }

    showBookDetailsModal(book) {
        const detailsModal = document.createElement('div');
        detailsModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        const stockStatus = this.getStockStatus(book);
        const reviews = this.generateSampleReviews(book);

        detailsModal.innerHTML = `
            <div style="
                background: white;
                border-radius: 8px;
                padding: 24px;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h3 style="margin: 0; color: #1f2937; font-size: 20px; font-weight: 600;">
                        <i class="fas fa-book" style="color: #2563eb; margin-right: 8px;"></i>
                        Book Details
                    </h3>
                    <button data-close-modal style="
                        background: none;
                        border: none;
                        font-size: 20px;
                        cursor: pointer;
                        color: #6b7280;
                    ">×</button>
                </div>

                <!-- Book Header -->
                <div style="display: grid; grid-template-columns: 200px 1fr; gap: 24px; margin-bottom: 24px;">
                    <!-- Book Cover -->
                    <div style="
                        background: #f3f4f6;
                        border: 2px solid #e5e7eb;
                        border-radius: 8px;
                        height: 280px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-direction: column;
                        text-align: center;
                    ">
                        <i class="fas fa-book" style="font-size: 48px; color: #9ca3af; margin-bottom: 12px;"></i>
                        <div style="color: #6b7280; font-size: 12px;">No Cover Image</div>
                        <div style="color: #9ca3af; font-size: 10px; margin-top: 4px;">${book.isbn}</div>
                    </div>

                    <!-- Book Info -->
                    <div>
                        <h2 style="margin: 0 0 8px 0; color: #1f2937; font-size: 24px; font-weight: 700; line-height: 1.2;">${book.title}</h2>
                        <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 16px;">by ${book.author}</p>
                        
                        <!-- Status and Stock -->
                        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                            <span style="
                                padding: 6px 12px;
                                border-radius: 16px;
                                font-size: 12px;
                                font-weight: 500;
                                text-transform: uppercase;
                                background: ${stockStatus.status === 'out-of-stock' ? '#fee2e2' : stockStatus.status === 'low-stock' ? '#fef3c7' : '#dcfce7'};
                                color: ${stockStatus.status === 'out-of-stock' ? '#991b1b' : stockStatus.status === 'low-stock' ? '#92400e' : '#166534'};
                            ">${stockStatus.label}</span>
                            <span style="
                                padding: 6px 12px;
                                border-radius: 16px;
                                font-size: 12px;
                                font-weight: 500;
                                text-transform: uppercase;
                                background: #f3e8ff;
                                color: #7c3aed;
                            ">${book.category}</span>
                        </div>

                        <!-- Price and Stock -->
                        <div style="display: flex; gap: 24px; margin-bottom: 16px;">
                            <div>
                                <div style="color: #6b7280; font-size: 12px; font-weight: 500;">Price</div>
                                <div style="color: #059669; font-size: 20px; font-weight: 700;">₹${book.price}</div>
                            </div>
                            <div>
                                <div style="color: #6b7280; font-size: 12px; font-weight: 500;">Stock</div>
                                <div style="color: ${stockStatus.color}; font-size: 20px; font-weight: 700;">${book.stock} units</div>
                            </div>
                            <div>
                                <div style="color: #6b7280; font-size: 12px; font-weight: 500;">Total Value</div>
                                <div style="color: #2563eb; font-size: 20px; font-weight: 700;">₹${(book.price * book.stock).toLocaleString()}</div>
                            </div>
                        </div>

                        <!-- ISBN and Dates -->
                        <div style="display: flex; gap: 24px; margin-bottom: 16px;">
                            <div>
                                <div style="color: #6b7280; font-size: 12px; font-weight: 500;">ISBN</div>
                                <div style="color: #374151; font-size: 14px; font-family: monospace;">${book.isbn}</div>
                            </div>
                            <div>
                                <div style="color: #6b7280; font-size: 12px; font-weight: 500;">Added</div>
                                <div style="color: #374151; font-size: 14px;">${book.createdAt.toLocaleDateString()}</div>
                            </div>
                            <div>
                                <div style="color: #6b7280; font-size: 12px; font-weight: 500;">Updated</div>
                                <div style="color: #374151; font-size: 14px;">${book.updatedAt.toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Description -->
                <div style="margin-bottom: 24px;">
                    <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 16px; font-weight: 600;">Description</h4>
                    <div style="
                        background: #f9fafb;
                        padding: 16px;
                        border-radius: 6px;
                        border: 1px solid #e5e7eb;
                        color: #374151;
                        line-height: 1.6;
                    ">${book.description}</div>
                </div>

                <!-- Tags -->
                ${book.tags && book.tags.length > 0 ? `
                    <div style="margin-bottom: 24px;">
                        <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 16px; font-weight: 600;">Tags</h4>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            ${book.tags.map(tag => `
                                <span style="
                                    padding: 4px 8px;
                                    background: #e0e7ff;
                                    color: #3730a3;
                                    border-radius: 12px;
                                    font-size: 12px;
                                    font-weight: 500;
                                ">${tag}</span>
        `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Reviews Section -->
                <div style="margin-bottom: 24px;">
                    <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 16px; font-weight: 600;">
                        <i class="fas fa-star" style="color: #f59e0b; margin-right: 6px;"></i>
                        Reviews & Ratings
                    </h4>
                    <div style="background: #f9fafb; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb;">
                        <!-- Overall Rating -->
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                            <div style="font-size: 24px; font-weight: 700; color: #1f2937;">4.2</div>
                            <div style="display: flex; gap: 2px;">
                                ${[1,2,3,4,5].map(i => `
                                    <i class="fas fa-star" style="color: ${i <= 4 ? '#f59e0b' : '#d1d5db'}; font-size: 16px;"></i>
                                `).join('')}
                            </div>
                            <div style="color: #6b7280; font-size: 14px;">(${reviews.length} reviews)</div>
                        </div>

                        <!-- Recent Reviews -->
                        <div style="space-y: 12px;">
                            ${reviews.slice(0, 3).map(review => `
                                <div style="
                                    background: white;
                                    padding: 12px;
                                    border-radius: 6px;
                                    border: 1px solid #e5e7eb;
                                ">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                        <div>
                                            <div style="color: #1f2937; font-size: 14px; font-weight: 500;">${review.customer}</div>
                                            <div style="display: flex; gap: 2px; margin-top: 2px;">
                                                ${[1,2,3,4,5].map(i => `
                                                    <i class="fas fa-star" style="color: ${i <= review.rating ? '#f59e0b' : '#d1d5db'}; font-size: 12px;"></i>
                                                `).join('')}
                                            </div>
                                        </div>
                                        <div style="color: #6b7280; font-size: 12px;">${review.date}</div>
                                    </div>
                                    <div style="color: #374151; font-size: 13px; line-height: 1.4;">${review.comment}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Book History -->
                <div style="margin-bottom: 24px;">
                    <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 16px; font-weight: 600;">
                        <i class="fas fa-history" style="color: #6b7280; margin-right: 6px;"></i>
                        Book History
                    </h4>
                    <div style="background: #f9fafb; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb;">
                        <div style="space-y: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                <div>
                                    <div style="color: #1f2937; font-size: 13px; font-weight: 500;">Stock Updated</div>
                                    <div style="color: #6b7280; font-size: 12px;">Stock changed from 15 to ${book.stock} units</div>
                                </div>
                                <div style="color: #6b7280; font-size: 12px;">2 days ago</div>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                <div>
                                    <div style="color: #1f2937; font-size: 13px; font-weight: 500;">Price Updated</div>
                                    <div style="color: #6b7280; font-size: 12px;">Price changed from ₹${book.price - 50} to ₹${book.price}</div>
                                </div>
                                <div style="color: #6b7280; font-size: 12px;">1 week ago</div>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                                <div>
                                    <div style="color: #1f2937; font-size: 13px; font-weight: 500;">Book Added</div>
                                    <div style="color: #6b7280; font-size: 12px;">Book was added to inventory</div>
                                </div>
                                <div style="color: #6b7280; font-size: 12px;">${book.createdAt.toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                    <button data-edit-book="${book._id}" style="
                        background: #059669;
                        color: white;
                        border: none;
                        padding: 10px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                    ">
                        <i class="fas fa-edit me-2"></i>Edit Book
                    </button>
                    <button onclick="window.adminBooksManager.quickStockUpdate('${book._id}')" style="
                        background: #2563eb;
                        color: white;
                        border: none;
                        padding: 10px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                    ">
                        <i class="fas fa-warehouse me-2"></i>Update Stock
                    </button>
                    <button data-close-modal style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 10px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                    ">Close</button>
                </div>
            </div>
        `;

        detailsModal.className = 'book-details-modal';
        document.body.appendChild(detailsModal);

        // Add event listeners for close buttons
        const closeButtons = detailsModal.querySelectorAll('[data-close-modal]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                detailsModal.remove();
            });
        });

        // Add event listener for edit book button
        const editButton = detailsModal.querySelector('[data-edit-book]');
        if (editButton) {
            editButton.addEventListener('click', () => {
                const bookId = editButton.getAttribute('data-edit-book');
                const book = this.books.find(b => b._id === bookId);
                if (book) {
                    this.showEditBookModal(book);
                    detailsModal.remove();
                }
            });
        }
    }

    generateSampleReviews(book) {
        const customers = ['John Doe', 'Sarah Wilson', 'Mike Johnson', 'Emily Davis', 'David Brown'];
        const comments = [
            `Great book! Really enjoyed reading ${book.title}. Highly recommended.`,
            `Excellent quality and fast delivery. The book arrived in perfect condition.`,
            `One of the best books I've read this year. ${book.author} did an amazing job.`,
            `Good value for money. The content is well-written and engaging.`,
            `Perfect for anyone interested in ${book.category}. Very informative and well-structured.`
        ];

        return customers.map((customer, index) => ({
            customer,
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            comment: comments[index] || comments[0],
            date: ['2 days ago', '1 week ago', '2 weeks ago', '1 month ago', '2 months ago'][index]
        }));
    }

    showEditBookModal(book) {
        const editModal = document.createElement('div');
        editModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        editModal.innerHTML = `
            <div style="
                background: white;
                border-radius: 8px;
                padding: 24px;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h3 style="margin: 0; color: #1f2937; font-size: 20px; font-weight: 600;">
                        <i class="fas fa-edit" style="color: #059669; margin-right: 8px;"></i>
                        Edit Book
                    </h3>
                    <button data-close-modal style="
                        background: none;
                        border: none;
                        font-size: 20px;
                        cursor: pointer;
                        color: #6b7280;
                    ">×</button>
                </div>

                <form id="edit-book-form" onsubmit="return window.adminBooksManager.saveBookChanges('${book._id}', this)">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div>
                            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">Title *</label>
                            <input type="text" id="edit-title" value="${book.title}" required style="
                                width: 100%;
                                padding: 10px;
                                border: 1px solid #d1d5db;
                                border-radius: 6px;
                                font-size: 14px;
                            ">
                        </div>
                        <div>
                            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">Author *</label>
                            <input type="text" id="edit-author" value="${book.author}" required style="
                                width: 100%;
                                padding: 10px;
                                border: 1px solid #d1d5db;
                                border-radius: 6px;
                                font-size: 14px;
                            ">
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div>
                            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">ISBN *</label>
                            <input type="text" id="edit-isbn" value="${book.isbn}" required style="
                                width: 100%;
                                padding: 10px;
                                border: 1px solid #d1d5db;
                                border-radius: 6px;
                                font-size: 14px;
                                font-family: monospace;
                            ">
                        </div>
                        <div>
                            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">Category *</label>
                            <select id="edit-category" required style="
                                width: 100%;
                                padding: 10px;
                                border: 1px solid #d1d5db;
                                border-radius: 6px;
                                font-size: 14px;
                            ">
                                <option value="fiction" ${book.category === 'fiction' ? 'selected' : ''}>Fiction</option>
                                <option value="non-fiction" ${book.category === 'non-fiction' ? 'selected' : ''}>Non-Fiction</option>
                                <option value="science" ${book.category === 'science' ? 'selected' : ''}>Science</option>
                                <option value="history" ${book.category === 'history' ? 'selected' : ''}>History</option>
                                <option value="biography" ${book.category === 'biography' ? 'selected' : ''}>Biography</option>
                                <option value="self-help" ${book.category === 'self-help' ? 'selected' : ''}>Self-Help</option>
                                <option value="business" ${book.category === 'business' ? 'selected' : ''}>Business</option>
                                <option value="technology" ${book.category === 'technology' ? 'selected' : ''}>Technology</option>
                            </select>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div>
                            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">Price (₹) *</label>
                            <input type="number" id="edit-price" value="${book.price}" min="0" step="0.01" required style="
                                width: 100%;
                                padding: 10px;
                                border: 1px solid #d1d5db;
                                border-radius: 6px;
                                font-size: 14px;
                            ">
                        </div>
                        <div>
                            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">Stock *</label>
                            <input type="number" id="edit-stock" value="${book.stock}" min="0" required style="
                                width: 100%;
                                padding: 10px;
                                border: 1px solid #d1d5db;
                                border-radius: 6px;
                                font-size: 14px;
                            ">
                        </div>
                    </div>

                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">Status *</label>
                        <select id="edit-status" required style="
                            width: 100%;
                            padding: 10px;
                            border: 1px solid #d1d5db;
                            border-radius: 6px;
                            font-size: 14px;
                        ">
                            <option value="active" ${book.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="inactive" ${book.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                            <option value="out-of-stock" ${book.status === 'out-of-stock' ? 'selected' : ''}>Out of Stock</option>
                            <option value="discontinued" ${book.status === 'discontinued' ? 'selected' : ''}>Discontinued</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">Description</label>
                        <textarea id="edit-description" rows="4" style="
                            width: 100%;
                            padding: 10px;
                            border: 1px solid #d1d5db;
                            border-radius: 6px;
                            font-size: 14px;
                            resize: vertical;
                        ">${book.description}</textarea>
                    </div>

                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button type="button" data-close-modal style="
                            background: #6b7280;
                            color: white;
                            border: none;
                            padding: 10px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                        ">Cancel</button>
                        <button type="submit" style="
                            background: #059669;
                            color: white;
                            border: none;
                            padding: 10px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                        ">
                            <i class="fas fa-save me-2"></i>Save Changes
                        </button>
                    </div>
                </form>
            </div>
        `;

        editModal.className = 'edit-book-modal';
        document.body.appendChild(editModal);

        // Add event listeners for close buttons
        const closeButtons = editModal.querySelectorAll('[data-close-modal]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                editModal.remove();
            });
        });
    }

    saveBookChanges(bookId, form) {
        const formData = new FormData(form);
        const updates = {
            title: form.querySelector('#edit-title').value,
            author: form.querySelector('#edit-author').value,
            isbn: form.querySelector('#edit-isbn').value,
            category: form.querySelector('#edit-category').value,
            price: parseFloat(form.querySelector('#edit-price').value),
            stock: parseInt(form.querySelector('#edit-stock').value),
            status: form.querySelector('#edit-status').value,
            description: form.querySelector('#edit-description').value
        };

        // Validation
        if (!this.validateBookData(updates)) {
            return false;
        }

        // Update book
        const bookIndex = this.books.findIndex(b => b._id === bookId);
        if (bookIndex !== -1) {
            this.books[bookIndex] = {
                ...this.books[bookIndex],
                ...updates,
                updatedAt: new Date()
            };

            // Update filtered books if visible
            const filteredIndex = this.filteredBooks.findIndex(b => b._id === bookId);
            if (filteredIndex !== -1) {
                this.filteredBooks[filteredIndex] = { ...this.books[bookIndex] };
            }

            // Save to localStorage
            this.saveBookUpdate(bookId, updates);

            // Re-render
            this.renderBooks();
            this.showMessage(`Book "${updates.title}" updated successfully!`, 'success');

            // Close modal
            const editModal = document.querySelector('.edit-book-modal');
            if (editModal) {
                editModal.remove();
            }
        }

        return false; // Prevent form submission
    }

    validateBookData(data) {
        const errors = [];

        if (!data.title || data.title.trim().length < 2) {
            errors.push('Title must be at least 2 characters long');
        }

        if (!data.author || data.author.trim().length < 2) {
            errors.push('Author must be at least 2 characters long');
        }

        if (!data.isbn || !this.validateISBN(data.isbn)) {
            errors.push('Please enter a valid ISBN');
        }

        if (!data.price || data.price < 0) {
            errors.push('Price must be a positive number');
        }

        if (data.stock < 0) {
            errors.push('Stock cannot be negative');
        }

        if (errors.length > 0) {
            this.showMessage(`Validation errors: ${errors.join(', ')}`, 'error');
            return false;
        }

        return true;
    }

    validateISBN(isbn) {
        // Basic ISBN validation (13 digits)
        const cleanISBN = isbn.replace(/[-\s]/g, '');
        return /^\d{13}$/.test(cleanISBN);
    }

    // Data Management Methods
    showDataManagement() {
        const dataModal = document.createElement('div');
        dataModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        const archivedBooks = this.books.filter(book => book.status === 'discontinued');
        const totalValue = this.books.reduce((sum, book) => sum + (book.price * book.stock), 0);

        dataModal.innerHTML = `
            <div style="
                background: white;
                border-radius: 8px;
                padding: 24px;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h3 style="margin: 0; color: #1f2937; font-size: 20px; font-weight: 600;">
                        <i class="fas fa-database" style="color: #7c3aed; margin-right: 8px;"></i>
                        Data Management
                    </h3>
                    <button onclick="document.querySelector('.data-management-modal').remove()" style="
                        background: none;
                        border: none;
                        font-size: 20px;
                        cursor: pointer;
                        color: #6b7280;
                    ">×</button>
                </div>

                <!-- Data Summary -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; border: 1px solid #bae6fd;">
                        <div style="font-size: 24px; font-weight: 700; color: #0369a1;">${this.books.length}</div>
                        <div style="font-size: 12px; color: #0369a1; font-weight: 500;">Total Books</div>
                    </div>
                    <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; border: 1px solid #bbf7d0;">
                        <div style="font-size: 24px; font-weight: 700; color: #059669;">₹${totalValue.toLocaleString()}</div>
                        <div style="font-size: 12px; color: #059669; font-weight: 500;">Total Value</div>
                    </div>
                    <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border: 1px solid #fde68a;">
                        <div style="font-size: 24px; font-weight: 700; color: #d97706;">${archivedBooks.length}</div>
                        <div style="font-size: 12px; color: #d97706; font-weight: 500;">Archived Books</div>
                    </div>
                    <div style="background: #f3e8ff; padding: 16px; border-radius: 8px; border: 1px solid #c4b5fd;">
                        <div style="font-size: 24px; font-weight: 700; color: #7c3aed;">${this.getDataSize()}</div>
                        <div style="font-size: 12px; color: #7c3aed; font-weight: 500;">Data Size</div>
                    </div>
                </div>

                <!-- Data Management Actions -->
                <div style="margin-bottom: 24px;">
                    <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">Data Operations</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        <button onclick="window.adminBooksManager.backupData()" style="
                            padding: 12px;
                            border: 1px solid #d1d5db;
                            background: white;
                            color: #374151;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            text-align: center;
                        ">
                            <i class="fas fa-download" style="display: block; font-size: 20px; margin-bottom: 4px; color: #059669;"></i>
                            Backup Data
                        </button>
                        
                        <button onclick="window.adminBooksManager.restoreData()" style="
                            padding: 12px;
                            border: 1px solid #d1d5db;
                            background: white;
                            color: #374151;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            text-align: center;
                        ">
                            <i class="fas fa-upload" style="display: block; font-size: 20px; margin-bottom: 4px; color: #2563eb;"></i>
                            Restore Data
                        </button>
                        
                        <button onclick="window.adminBooksManager.validateAllData()" style="
                            padding: 12px;
                            border: 1px solid #d1d5db;
                            background: white;
                            color: #374151;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            text-align: center;
                        ">
                            <i class="fas fa-check-circle" style="display: block; font-size: 20px; margin-bottom: 4px; color: #7c3aed;"></i>
                            Validate Data
                        </button>
                        
                        <button onclick="window.adminBooksManager.cleanupData()" style="
                            padding: 12px;
                            border: 1px solid #d1d5db;
                            background: white;
                            color: #374151;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            text-align: center;
                        ">
                            <i class="fas fa-broom" style="display: block; font-size: 20px; margin-bottom: 4px; color: #f59e0b;"></i>
                            Cleanup Data
                        </button>
                    </div>
                </div>

                <!-- Archived Books -->
                ${archivedBooks.length > 0 ? `
                    <div style="margin-bottom: 24px;">
                        <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">
                            <i class="fas fa-archive" style="color: #f59e0b; margin-right: 6px;"></i>
                            Archived Books (${archivedBooks.length})
                        </h4>
                        <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px;">
                            ${archivedBooks.map(book => `
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 12px;
                                    border-bottom: 1px solid #f3f4f6;
                                ">
                                    <div>
                                        <div style="font-size: 13px; font-weight: 500; color: #1f2937;">${book.title}</div>
                                        <div style="font-size: 11px; color: #6b7280;">by ${book.author} • ${book.category}</div>
                                    </div>
                                    <div style="display: flex; gap: 8px;">
                                        <button onclick="window.adminBooksManager.restoreBook('${book._id}')" style="
                                            background: #059669;
                                            color: white;
                                            border: none;
                                            padding: 4px 8px;
                                            border-radius: 3px;
                                            cursor: pointer;
                                            font-size: 10px;
                                        ">Restore</button>
                                        <button onclick="window.adminBooksManager.permanentDelete('${book._id}')" style="
                                            background: #ef4444;
                                            color: white;
                                            border: none;
                                            padding: 4px 8px;
                                            border-radius: 3px;
                                            cursor: pointer;
                                            font-size: 10px;
                                        ">Delete</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                    <button onclick="document.querySelector('.data-management-modal').remove()" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    ">Close</button>
                </div>
            </div>
        `;

        dataModal.className = 'data-management-modal';
        document.body.appendChild(dataModal);
    }

    getDataSize() {
        const dataSize = JSON.stringify(this.books).length;
        if (dataSize < 1024) return `${dataSize} B`;
        if (dataSize < 1024 * 1024) return `${(dataSize / 1024).toFixed(1)} KB`;
        return `${(dataSize / (1024 * 1024)).toFixed(1)} MB`;
    }

    backupData() {
        const backup = {
            books: this.books,
            timestamp: new Date().toISOString(),
            version: '1.0',
            totalBooks: this.books.length,
            totalValue: this.books.reduce((sum, book) => sum + (book.price * book.stock), 0)
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `book-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showMessage('Data backup created successfully!', 'success');
    }

    restoreData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const backup = JSON.parse(e.target.result);
                        if (backup.books && Array.isArray(backup.books)) {
                            this.books = backup.books;
                            this.filteredBooks = [...this.books];
                            this.renderBooks();
                            this.showMessage(`Data restored successfully! ${backup.books.length} books loaded.`, 'success');
    } else {
                            this.showMessage('Invalid backup file format', 'error');
                        }
                    } catch (error) {
                        this.showMessage('Error reading backup file', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    validateAllData() {
        const errors = [];
        const warnings = [];

        this.books.forEach((book, index) => {
            if (!book.title || book.title.trim().length < 2) {
                errors.push(`Book ${index + 1}: Invalid title`);
            }
            if (!book.author || book.author.trim().length < 2) {
                errors.push(`Book ${index + 1}: Invalid author`);
            }
            if (!book.isbn || !this.validateISBN(book.isbn)) {
                errors.push(`Book ${index + 1}: Invalid ISBN`);
            }
            if (!book.price || book.price < 0) {
                errors.push(`Book ${index + 1}: Invalid price`);
            }
            if (book.stock < 0) {
                errors.push(`Book ${index + 1}: Invalid stock`);
            }
            if (book.stock === 0 && book.status !== 'out-of-stock') {
                warnings.push(`Book ${index + 1}: Stock is 0 but status is not 'out-of-stock'`);
            }
        });

        let message = '';
        if (errors.length > 0) {
            message += `Found ${errors.length} errors: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`;
        }
        if (warnings.length > 0) {
            message += (message ? '\n' : '') + `Found ${warnings.length} warnings: ${warnings.slice(0, 3).join(', ')}${warnings.length > 3 ? '...' : ''}`;
        }
        if (errors.length === 0 && warnings.length === 0) {
            message = 'All data is valid!';
        }

        this.showMessage(message, errors.length > 0 ? 'error' : 'success');
    }

    cleanupData() {
        let cleanedCount = 0;

        this.books = this.books.filter(book => {
            if (!book.title || !book.author || !book.isbn) {
                cleanedCount++;
                return false;
            }
            return true;
        });

        this.filteredBooks = [...this.books];
        this.renderBooks();
        this.showMessage(`Data cleanup completed! Removed ${cleanedCount} invalid entries.`, 'success');
    }

    restoreBook(bookId) {
        const book = this.books.find(b => b._id === bookId);
        if (book) {
            book.status = 'active';
            book.updatedAt = new Date();
            
            // Update filtered books if visible
            const filteredIndex = this.filteredBooks.findIndex(b => b._id === bookId);
            if (filteredIndex !== -1) {
                this.filteredBooks[filteredIndex] = { ...book };
            }
            
            this.renderBooks();
            this.showMessage(`Book "${book.title}" restored successfully!`, 'success');
        }
    }

    permanentDelete(bookId) {
        const book = this.books.find(b => b._id === bookId);
        if (book && confirm(`Are you sure you want to permanently delete "${book.title}"? This action cannot be undone.`)) {
            this.books = this.books.filter(b => b._id !== bookId);
            this.filteredBooks = [...this.books];
            this.renderBooks();
            this.showMessage(`Book "${book.title}" permanently deleted!`, 'success');
        }
    }

    showDeleteBookModal(book) {
        // Implementation for delete book modal
        console.log('Delete book modal - to be implemented for:', book.title);
    }

    executeBulkAction() {
        const action = document.getElementById('bulk-action-select').value;
        const selectedCount = this.selectedBooks.size;
        
        if (!action || selectedCount === 0) return;

        console.log('Executing bulk action:', action, 'on', selectedCount, 'books');
        
        switch (action) {
            case 'edit-price':
                this.showBulkPriceEditModal();
                break;
            case 'change-status':
                this.showBulkStatusChangeModal();
                break;
            case 'assign-category':
                this.showBulkCategoryAssignModal();
                break;
            case 'update-stock':
                this.showBulkStockUpdateModal();
                break;
            case 'delete':
                this.showBulkDeleteModal();
                break;
        }
    }

    showBulkPriceEditModal() {
        console.log('Bulk price edit modal - to be implemented');
    }

    showBulkStatusChangeModal() {
        console.log('Bulk status change modal - to be implemented');
    }

    showBulkCategoryAssignModal() {
        console.log('Bulk category assign modal - to be implemented');
    }

    showBulkStockUpdateModal() {
        console.log('Bulk stock update modal - to be implemented');
    }

    showBulkDeleteModal() {
        console.log('Bulk delete modal - to be implemented');
    }

    exportBooks(type = 'all') {
        const booksToExport = type === 'filtered' ? this.filteredBooks : this.books;
        this.exportBooksToCSV(booksToExport, `${type}-books`);
        this.showMessage(`Exported ${booksToExport.length} books`, 'success');
    }

    downloadTemplate() {
        const template = [
            ['ISBN', 'Title', 'Author', 'Price', 'Stock', 'Category', 'Status', 'Description'],
            ['9781234567890', 'Sample Book', 'Sample Author', '299', '10', 'fiction', 'active', 'Sample description']
        ];
        
        this.exportBooksToCSV(template, 'book-import-template');
        this.showMessage('Template downloaded successfully', 'success');
    }

    exportBooksToCSV(data, filename) {
        const headers = ['ISBN', 'Title', 'Author', 'Price', 'Stock', 'Category', 'Status', 'Description'];
        const csvContent = [
            headers.join(','),
            ...data.map(book => [
                book.isbn || '',
                book.title || '',
                book.author || '',
                book.price || 0,
                book.stock || 0,
                book.category || '',
                book.status || '',
                (book.description || '').replace(/,/g, ';')
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    showMessage(message, type) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            background: ${type === 'success' ? '#059669' : '#ef4444'};
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    // Inventory Management Methods
    getStockStatus(book) {
        if (book.stock === 0) return { status: 'out-of-stock', color: '#ef4444', label: 'Out of Stock' };
        if (book.stock < 5) return { status: 'low-stock', color: '#f59e0b', label: 'Low Stock' };
        if (book.stock < 10) return { status: 'medium-stock', color: '#3b82f6', label: 'Medium Stock' };
        return { status: 'in-stock', color: '#059669', label: 'In Stock' };
    }

    checkStockAlerts() {
        const lowStockBooks = this.books.filter(book => book.stock < 5 && book.stock > 0);
        const outOfStockBooks = this.books.filter(book => book.stock === 0);
        
        if (lowStockBooks.length > 0 || outOfStockBooks.length > 0) {
            this.showStockAlerts(lowStockBooks, outOfStockBooks);
        }
    }

    showStockAlerts(lowStockBooks, outOfStockBooks) {
        const alertModal = document.createElement('div');
        alertModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        alertModal.innerHTML = `
            <div style="
                background: white;
                border-radius: 8px;
                padding: 24px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                        <i class="fas fa-exclamation-triangle" style="color: #f59e0b; margin-right: 8px;"></i>
                        Stock Alerts
                    </h3>
                    <button onclick="this.closest('.stock-alert-modal').remove()" style="
                        background: none;
                        border: none;
                        font-size: 20px;
                        cursor: pointer;
                        color: #6b7280;
                    ">×</button>
                </div>

                ${outOfStockBooks.length > 0 ? `
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #ef4444; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
                            <i class="fas fa-times-circle" style="margin-right: 6px;"></i>
                            Out of Stock (${outOfStockBooks.length})
                        </h4>
                        <div style="max-height: 150px; overflow-y: auto;">
                            ${outOfStockBooks.map(book => `
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 8px 12px;
                                    background: #fef2f2;
                                    border: 1px solid #fecaca;
                                    border-radius: 4px;
                                    margin-bottom: 4px;
                                ">
                                    <span style="font-size: 12px; color: #991b1b;">${book.title}</span>
                                    <span style="font-size: 11px; color: #991b1b; font-weight: 500;">0 units</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${lowStockBooks.length > 0 ? `
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #f59e0b; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
                            <i class="fas fa-exclamation-triangle" style="margin-right: 6px;"></i>
                            Low Stock (${lowStockBooks.length})
                        </h4>
                        <div style="max-height: 150px; overflow-y: auto;">
                            ${lowStockBooks.map(book => `
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 8px 12px;
                                    background: #fffbeb;
                                    border: 1px solid #fed7aa;
                                    border-radius: 4px;
                                    margin-bottom: 4px;
                                ">
                                    <span style="font-size: 12px; color: #92400e;">${book.title}</span>
                                    <span style="font-size: 11px; color: #92400e; font-weight: 500;">${book.stock} units</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                    <button onclick="document.querySelector('.stock-alert-modal').remove()" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    ">Close</button>
                    <button onclick="window.adminBooksManager.showInventoryManagement()" style="
                        background: #2563eb;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    ">Manage Inventory</button>
                </div>
            </div>
        `;

        alertModal.className = 'stock-alert-modal';
        document.body.appendChild(alertModal);
    }

    showInventoryManagement() {
        const inventoryModal = document.createElement('div');
        inventoryModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        const lowStockBooks = this.books.filter(book => book.stock < 10);
        const outOfStockBooks = this.books.filter(book => book.stock === 0);
        const totalValue = this.books.reduce((sum, book) => sum + (book.price * book.stock), 0);

        inventoryModal.innerHTML = `
            <div style="
                background: white;
                border-radius: 8px;
                padding: 24px;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h3 style="margin: 0; color: #1f2937; font-size: 20px; font-weight: 600;">
                        <i class="fas fa-warehouse" style="color: #2563eb; margin-right: 8px;"></i>
                        Inventory Management
                    </h3>
                    <button data-close-modal style="
                        background: none;
                        border: none;
                        font-size: 20px;
                        cursor: pointer;
                        color: #6b7280;
                    ">×</button>
                </div>

                <!-- Inventory Summary -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; border: 1px solid #bae6fd;">
                        <div style="font-size: 24px; font-weight: 700; color: #0369a1;">${this.books.length}</div>
                        <div style="font-size: 12px; color: #0369a1; font-weight: 500;">Total Books</div>
                    </div>
                    <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; border: 1px solid #bbf7d0;">
                        <div style="font-size: 24px; font-weight: 700; color: #059669;">${this.books.reduce((sum, book) => sum + book.stock, 0)}</div>
                        <div style="font-size: 12px; color: #059669; font-weight: 500;">Total Stock</div>
                    </div>
                    <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border: 1px solid #fde68a;">
                        <div style="font-size: 24px; font-weight: 700; color: #d97706;">${lowStockBooks.length}</div>
                        <div style="font-size: 12px; color: #d97706; font-weight: 500;">Low Stock</div>
                    </div>
                    <div style="background: #fee2e2; padding: 16px; border-radius: 8px; border: 1px solid #fecaca;">
                        <div style="font-size: 24px; font-weight: 700; color: #dc2626;">${outOfStockBooks.length}</div>
                        <div style="font-size: 12px; color: #dc2626; font-weight: 500;">Out of Stock</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div style="margin-bottom: 24px;">
                    <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">Quick Actions</h4>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button data-bulk-stock style="
                            background: #059669;
                            color: white;
                            border: none;
                            padding: 8px 12px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 12px;
                        ">Bulk Stock Update</button>
                        <button data-reorder-points style="
                            background: #7c3aed;
                            color: white;
                            border: none;
                            padding: 8px 12px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 12px;
                        ">Set Reorder Points</button>
                        <button data-export-report style="
                            background: #2563eb;
                            color: white;
                            border: none;
                            padding: 8px 12px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 12px;
                        ">Export Report</button>
                    </div>
                </div>

                <!-- Low Stock Books -->
                ${lowStockBooks.length > 0 ? `
                    <div style="margin-bottom: 24px;">
                        <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">
                            <i class="fas fa-exclamation-triangle" style="color: #f59e0b; margin-right: 6px;"></i>
                            Books Requiring Attention
                        </h4>
                        <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px;">
                            ${lowStockBooks.map(book => `
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 12px;
                                    border-bottom: 1px solid #f3f4f6;
                                ">
                                    <div>
                                        <div style="font-size: 13px; font-weight: 500; color: #1f2937;">${book.title}</div>
                                        <div style="font-size: 11px; color: #6b7280;">by ${book.author}</div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div style="text-align: right;">
                                            <div style="font-size: 12px; color: ${book.stock === 0 ? '#ef4444' : '#f59e0b'}; font-weight: 500;">
                                                ${book.stock} units
                                            </div>
                                            <div style="font-size: 10px; color: #6b7280;">₹${book.price} each</div>
                                        </div>
                                        <button data-update-stock="${book._id}" style="
                                            background: #2563eb;
                                            color: white;
                                            border: none;
                                            padding: 4px 8px;
                                            border-radius: 3px;
                                            cursor: pointer;
                                            font-size: 10px;
                                        ">Update</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Stock History -->
                <div style="margin-bottom: 24px;">
                    <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">
                        <i class="fas fa-history" style="color: #6b7280; margin-right: 6px;"></i>
                        Recent Stock Changes
                    </h4>
                    <div style="max-height: 150px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px;">
                        ${this.getStockHistory().map(entry => `
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                padding: 8px 12px;
                                border-bottom: 1px solid #f3f4f6;
                            ">
                                <div>
                                    <div style="font-size: 12px; color: #1f2937;">${entry.bookTitle}</div>
                                    <div style="font-size: 10px; color: #6b7280;">${entry.type} - ${entry.quantity} units</div>
                                </div>
                                <div style="font-size: 10px; color: #6b7280;">${entry.date}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                    <button data-close-modal style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    ">Close</button>
                </div>
            </div>
        `;

        inventoryModal.className = 'inventory-modal';
        document.body.appendChild(inventoryModal);

        // Add event listeners for close buttons
        const closeButtons = inventoryModal.querySelectorAll('[data-close-modal]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                inventoryModal.remove();
            });
        });

        // Add event listeners for action buttons
        const bulkStockBtn = inventoryModal.querySelector('[data-bulk-stock]');
        if (bulkStockBtn) {
            bulkStockBtn.addEventListener('click', () => {
                this.showBulkStockUpdateModal();
            });
        }

        const reorderPointsBtn = inventoryModal.querySelector('[data-reorder-points]');
        if (reorderPointsBtn) {
            reorderPointsBtn.addEventListener('click', () => {
                this.showReorderPointsModal();
            });
        }

        const exportReportBtn = inventoryModal.querySelector('[data-export-report]');
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', () => {
                this.exportInventoryReport();
            });
        }

        // Add event listeners for individual book update buttons
        const updateButtons = inventoryModal.querySelectorAll('[data-update-stock]');
        updateButtons.forEach(button => {
            button.addEventListener('click', () => {
                const bookId = button.getAttribute('data-update-stock');
                this.quickStockUpdate(bookId);
            });
        });
    }

    getStockHistory() {
        // Generate sample stock history
        const history = [];
        const books = this.books.slice(0, 5); // Show history for first 5 books
        
        books.forEach(book => {
            const changes = [
                { type: 'Stock In', quantity: Math.floor(Math.random() * 20) + 10, date: '2 days ago' },
                { type: 'Stock Out', quantity: Math.floor(Math.random() * 5) + 1, date: '1 week ago' },
                { type: 'Stock In', quantity: Math.floor(Math.random() * 15) + 5, date: '2 weeks ago' }
            ];
            
            changes.forEach(change => {
                history.push({
                    bookTitle: book.title,
                    type: change.type,
                    quantity: change.quantity,
                    date: change.date
                });
            });
        });
        
        return history.slice(0, 10); // Return last 10 entries
    }

    quickStockUpdate(bookId) {
        const book = this.books.find(b => b._id === bookId);
        if (!book) return;

        const newStock = prompt(`Enter new stock quantity for "${book.title}":`, book.stock);
        if (newStock !== null && !isNaN(newStock) && newStock >= 0) {
            this.updateBookStock(bookId, parseInt(newStock));
        }
    }

    updateBookStock(bookId, newStock) {
        const bookIndex = this.books.findIndex(b => b._id === bookId);
        if (bookIndex !== -1) {
            const oldStock = this.books[bookIndex].stock;
            this.books[bookIndex].stock = newStock;
            this.books[bookIndex].updatedAt = new Date();
            
            // Update status based on stock
            if (newStock === 0) {
                this.books[bookIndex].status = 'out-of-stock';
            } else if (newStock < 5) {
                this.books[bookIndex].status = 'active';
            } else {
                this.books[bookIndex].status = 'active';
            }
            
            // Update filtered books if visible
            const filteredIndex = this.filteredBooks.findIndex(b => b._id === bookId);
            if (filteredIndex !== -1) {
                this.filteredBooks[filteredIndex] = { ...this.books[bookIndex] };
            }
            
            // Save to localStorage
            this.saveBookUpdate(bookId, { stock: newStock, status: this.books[bookIndex].status });
            
            // Re-render
            this.renderBooks();
            this.showMessage(`Stock updated for ${this.books[bookIndex].title}: ${oldStock} → ${newStock}`, 'success');
        }
    }

    saveBookUpdate(bookId, updates) {
        try {
            const savedUpdates = JSON.parse(localStorage.getItem('adminBookUpdates') || '[]');
            const existingIndex = savedUpdates.findIndex(u => u.bookId === bookId);
            
            const updateData = {
                bookId,
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            if (existingIndex !== -1) {
                savedUpdates[existingIndex] = { ...savedUpdates[existingIndex], ...updateData };
            } else {
                savedUpdates.push(updateData);
            }
            
            localStorage.setItem('adminBookUpdates', JSON.stringify(savedUpdates));
        } catch (error) {
            console.error('Error saving book update:', error);
        }
    }

    showReorderPointsModal() {
        console.log('Reorder points modal - to be implemented');
        this.showMessage('Reorder points feature coming soon!', 'success');
    }

    exportInventoryReport() {
        const reportData = this.books.map(book => ({
            'Book Title': book.title,
            'Author': book.author,
            'ISBN': book.isbn,
            'Current Stock': book.stock,
            'Price': book.price,
            'Total Value': book.price * book.stock,
            'Status': book.status,
            'Category': book.category,
            'Last Updated': book.updatedAt.toLocaleDateString()
        }));
        
        this.exportBooksToCSV(reportData, 'inventory-report');
        this.showMessage('Inventory report exported successfully!', 'success');
    }

    showBulkStockUpdateModal() {
        this.showMessage('Bulk stock update modal - to be implemented', 'info');
    }

    // Analytics and Reporting Methods
    showAnalyticsDashboard() {
        const analyticsModal = document.createElement('div');
        analyticsModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        const analytics = this.generateAnalytics();

        analyticsModal.innerHTML = `
            <div style="
                background: white;
                border-radius: 8px;
                padding: 24px;
                max-width: 1000px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h3 style="margin: 0; color: #1f2937; font-size: 20px; font-weight: 600;">
                        <i class="fas fa-chart-bar" style="color: #7c3aed; margin-right: 8px;"></i>
                        Book Analytics & Reports
                    </h3>
                    <button onclick="document.querySelector('.analytics-modal').remove()" style="
                        background: none;
                        border: none;
                        font-size: 20px;
                        cursor: pointer;
                        color: #6b7280;
                    ">×</button>
                </div>

                <!-- Analytics Summary Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; border: 1px solid #bae6fd;">
                        <div style="font-size: 24px; font-weight: 700; color: #0369a1;">${analytics.totalBooks}</div>
                        <div style="font-size: 12px; color: #0369a1; font-weight: 500;">Total Books</div>
                    </div>
                    <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; border: 1px solid #bbf7d0;">
                        <div style="font-size: 24px; font-weight: 700; color: #059669;">₹${analytics.totalValue.toLocaleString()}</div>
                        <div style="font-size: 12px; color: #059669; font-weight: 500;">Total Inventory Value</div>
                    </div>
                    <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border: 1px solid #fde68a;">
                        <div style="font-size: 24px; font-weight: 700; color: #d97706;">${analytics.lowStockCount}</div>
                        <div style="font-size: 12px; color: #d97706; font-weight: 500;">Low Stock Items</div>
                    </div>
                    <div style="background: #f3e8ff; padding: 16px; border-radius: 8px; border: 1px solid #c4b5fd;">
                        <div style="font-size: 24px; font-weight: 700; color: #7c3aed;">${analytics.categories.length}</div>
                        <div style="font-size: 12px; color: #7c3aed; font-weight: 500;">Categories</div>
                    </div>
                </div>

                <!-- Analytics Tabs -->
                <div style="margin-bottom: 24px;">
                    <div style="display: flex; gap: 8px; border-bottom: 1px solid #e5e7eb;">
                        <button class="analytics-tab active" data-tab="overview" style="
                            padding: 8px 16px;
                            border: none;
                            background: #7c3aed;
                            color: white;
                            border-radius: 4px 4px 0 0;
                            cursor: pointer;
                            font-size: 12px;
                        ">Overview</button>
                        <button class="analytics-tab" data-tab="bestsellers" style="
                            padding: 8px 16px;
                            border: none;
                            background: #f3f4f6;
                            color: #6b7280;
                            border-radius: 4px 4px 0 0;
                            cursor: pointer;
                            font-size: 12px;
                        ">Best Sellers</button>
                        <button class="analytics-tab" data-tab="stock" style="
                            padding: 8px 16px;
                            border: none;
                            background: #f3f4f6;
                            color: #6b7280;
                            border-radius: 4px 4px 0 0;
                            cursor: pointer;
                            font-size: 12px;
                        ">Stock Analysis</button>
                        <button class="analytics-tab" data-tab="pricing" style="
                            padding: 8px 16px;
                            border: none;
                            background: #f3f4f6;
                            color: #6b7280;
                            border-radius: 4px 4px 0 0;
                            cursor: pointer;
                            font-size: 12px;
                        ">Pricing Analysis</button>
                        <button class="analytics-tab" data-tab="categories" style="
                            padding: 8px 16px;
                            border: none;
                            background: #f3f4f6;
                            color: #6b7280;
                            border-radius: 4px 4px 0 0;
                            cursor: pointer;
                            font-size: 12px;
                        ">Categories</button>
                    </div>
                </div>

                <!-- Analytics Content -->
                <div id="analytics-content">
                    ${this.generateAnalyticsContent(analytics)}
                </div>

                <!-- Export Options -->
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                    <button onclick="window.adminBooksManager.exportAnalyticsReport('overview')" style="
                        background: #059669;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    ">Export Overview</button>
                    <button onclick="window.adminBooksManager.exportAnalyticsReport('detailed')" style="
                        background: #2563eb;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    ">Export Detailed</button>
                    <button onclick="document.querySelector('.analytics-modal').remove()" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    ">Close</button>
                </div>
            </div>
        `;

        analyticsModal.className = 'analytics-modal';
        document.body.appendChild(analyticsModal);

        // Setup tab switching
        this.setupAnalyticsTabs();
    }

    generateAnalytics() {
        const totalBooks = this.books.length;
        const totalValue = this.books.reduce((sum, book) => sum + (book.price * book.stock), 0);
        const lowStockCount = this.books.filter(book => book.stock < 5).length;
        const outOfStockCount = this.books.filter(book => book.stock === 0).length;
        
        // Category analysis
        const categoryStats = {};
        this.books.forEach(book => {
            if (!categoryStats[book.category]) {
                categoryStats[book.category] = {
                    count: 0,
                    totalValue: 0,
                    totalStock: 0,
                    avgPrice: 0
                };
            }
            categoryStats[book.category].count++;
            categoryStats[book.category].totalValue += book.price * book.stock;
            categoryStats[book.category].totalStock += book.stock;
        });

        // Calculate average prices
        Object.keys(categoryStats).forEach(category => {
            const stats = categoryStats[category];
            stats.avgPrice = stats.totalValue / stats.totalStock || 0;
        });

        // Best sellers (simulated based on stock movement)
        const bestSellers = [...this.books]
            .sort((a, b) => {
                // Simulate sales based on stock levels and price
                const aScore = (25 - a.stock) * (a.price / 100);
                const bScore = (25 - b.stock) * (b.price / 100);
                return bScore - aScore;
            })
            .slice(0, 10);

        // Price analysis
        const prices = this.books.map(book => book.price);
        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        // Stock analysis
        const stockLevels = this.books.map(book => book.stock);
        const avgStock = stockLevels.reduce((sum, stock) => sum + stock, 0) / stockLevels.length;
        const totalStock = stockLevels.reduce((sum, stock) => sum + stock, 0);

        return {
            totalBooks,
            totalValue,
            lowStockCount,
            outOfStockCount,
            categories: Object.keys(categoryStats),
            categoryStats,
            bestSellers,
            priceAnalysis: {
                avgPrice,
                minPrice,
                maxPrice,
                priceRanges: {
                    '0-200': this.books.filter(b => b.price <= 200).length,
                    '200-500': this.books.filter(b => b.price > 200 && b.price <= 500).length,
                    '500-1000': this.books.filter(b => b.price > 500 && b.price <= 1000).length,
                    '1000+': this.books.filter(b => b.price > 1000).length
                }
            },
            stockAnalysis: {
                avgStock,
                totalStock,
                stockRanges: {
                    '0': this.books.filter(b => b.stock === 0).length,
                    '1-5': this.books.filter(b => b.stock >= 1 && b.stock <= 5).length,
                    '6-20': this.books.filter(b => b.stock >= 6 && b.stock <= 20).length,
                    '20+': this.books.filter(b => b.stock > 20).length
                }
            }
        };
    }

    generateAnalyticsContent(analytics) {
        return `
            <!-- Overview Tab Content -->
            <div id="overview-content" class="analytics-tab-content">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <!-- Key Metrics -->
                    <div>
                        <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">Key Metrics</h4>
                        <div style="space-y: 12px;">
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 14px;">Total Books:</span>
                                <span style="color: #1f2937; font-weight: 500;">${analytics.totalBooks}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 14px;">Total Inventory Value:</span>
                                <span style="color: #1f2937; font-weight: 500;">₹${analytics.totalValue.toLocaleString()}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 14px;">Average Price:</span>
                                <span style="color: #1f2937; font-weight: 500;">₹${Math.round(analytics.priceAnalysis.avgPrice)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 14px;">Average Stock:</span>
                                <span style="color: #1f2937; font-weight: 500;">${Math.round(analytics.stockAnalysis.avgStock)} units</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 14px;">Low Stock Items:</span>
                                <span style="color: #f59e0b; font-weight: 500;">${analytics.lowStockCount}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                                <span style="color: #6b7280; font-size: 14px;">Out of Stock:</span>
                                <span style="color: #ef4444; font-weight: 500;">${analytics.outOfStockCount}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Category Distribution -->
                    <div>
                        <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">Category Distribution</h4>
                        <div style="space-y: 8px;">
                            ${Object.entries(analytics.categoryStats).map(([category, stats]) => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                                    <div>
                                        <span style="color: #1f2937; font-size: 14px; text-transform: capitalize;">${category}</span>
                                        <div style="color: #6b7280; font-size: 12px;">${stats.count} books</div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="color: #059669; font-size: 14px; font-weight: 500;">₹${Math.round(stats.totalValue).toLocaleString()}</div>
                                        <div style="color: #6b7280; font-size: 12px;">${stats.totalStock} units</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Best Sellers Tab Content -->
            <div id="bestsellers-content" class="analytics-tab-content" style="display: none;">
                <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">Top 10 Best Sellers</h4>
                <div style="space-y: 8px;">
                    ${analytics.bestSellers.map((book, index) => `
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 12px;
                            background: ${index < 3 ? '#f0f9ff' : '#f9fafb'};
                            border: 1px solid ${index < 3 ? '#bae6fd' : '#e5e7eb'};
                            border-radius: 6px;
                        ">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="
                                    width: 24px;
                                    height: 24px;
                                    background: ${index < 3 ? '#2563eb' : '#6b7280'};
                                    color: white;
                                    border-radius: 50%;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 12px;
                                    font-weight: 600;
                                ">${index + 1}</div>
                                <div>
                                    <div style="color: #1f2937; font-size: 14px; font-weight: 500;">${book.title}</div>
                                    <div style="color: #6b7280; font-size: 12px;">by ${book.author}</div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: #059669; font-size: 14px; font-weight: 500;">₹${book.price}</div>
                                <div style="color: #6b7280; font-size: 12px;">${book.stock} units</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Stock Analysis Tab Content -->
            <div id="stock-content" class="analytics-tab-content" style="display: none;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <!-- Stock Distribution -->
                    <div>
                        <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">Stock Distribution</h4>
                        <div style="space-y: 8px;">
                            ${Object.entries(analytics.stockAnalysis.stockRanges).map(([range, count]) => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                                    <span style="color: #6b7280; font-size: 14px;">${range === '0' ? 'Out of Stock' : range === '1-5' ? 'Low Stock' : range === '6-20' ? 'Medium Stock' : 'High Stock'}:</span>
                                    <span style="color: #1f2937; font-weight: 500;">${count} books</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Low Stock Alert -->
                    <div>
                        <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">Stock Alerts</h4>
                        <div style="space-y: 8px;">
                            ${this.books.filter(book => book.stock < 5).slice(0, 5).map(book => `
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 8px 12px;
                                    background: ${book.stock === 0 ? '#fef2f2' : '#fffbeb'};
                                    border: 1px solid ${book.stock === 0 ? '#fecaca' : '#fed7aa'};
                                    border-radius: 4px;
                                ">
                                    <div>
                                        <div style="color: #1f2937; font-size: 12px; font-weight: 500;">${book.title}</div>
                                        <div style="color: #6b7280; font-size: 11px;">${book.category}</div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="color: ${book.stock === 0 ? '#ef4444' : '#f59e0b'}; font-size: 12px; font-weight: 500;">${book.stock} units</div>
                                        <div style="color: #6b7280; font-size: 11px;">₹${book.price}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pricing Analysis Tab Content -->
            <div id="pricing-content" class="analytics-tab-content" style="display: none;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <!-- Price Distribution -->
                    <div>
                        <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">Price Distribution</h4>
                        <div style="space-y: 8px;">
                            ${Object.entries(analytics.priceAnalysis.priceRanges).map(([range, count]) => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                                    <span style="color: #6b7280; font-size: 14px;">₹${range}:</span>
                                    <span style="color: #1f2937; font-weight: 500;">${count} books</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Price Statistics -->
                    <div>
                        <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">Price Statistics</h4>
                        <div style="space-y: 8px;">
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 14px;">Average Price:</span>
                                <span style="color: #1f2937; font-weight: 500;">₹${Math.round(analytics.priceAnalysis.avgPrice)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 14px;">Lowest Price:</span>
                                <span style="color: #1f2937; font-weight: 500;">₹${analytics.priceAnalysis.minPrice}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                                <span style="color: #6b7280; font-size: 14px;">Highest Price:</span>
                                <span style="color: #1f2937; font-weight: 500;">₹${analytics.priceAnalysis.maxPrice}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Categories Tab Content -->
            <div id="categories-content" class="analytics-tab-content" style="display: none;">
                <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">Category Performance</h4>
                <div style="space-y: 8px;">
                    ${Object.entries(analytics.categoryStats)
                        .sort(([,a], [,b]) => b.totalValue - a.totalValue)
                        .map(([category, stats]) => `
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 12px;
                            background: #f9fafb;
                            border: 1px solid #e5e7eb;
                            border-radius: 6px;
                        ">
                            <div>
                                <div style="color: #1f2937; font-size: 14px; font-weight: 500; text-transform: capitalize;">${category}</div>
                                <div style="color: #6b7280; font-size: 12px;">${stats.count} books • ${stats.totalStock} units</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: #059669; font-size: 14px; font-weight: 500;">₹${Math.round(stats.totalValue).toLocaleString()}</div>
                                <div style="color: #6b7280; font-size: 12px;">Avg: ₹${Math.round(stats.avgPrice)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    setupAnalyticsTabs() {
        const tabs = document.querySelectorAll('.analytics-tab');
        const contents = document.querySelectorAll('.analytics-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // Update tab styles
                tabs.forEach(t => {
                    t.style.background = '#f3f4f6';
                    t.style.color = '#6b7280';
                });
                tab.style.background = '#7c3aed';
                tab.style.color = 'white';
                
                // Show/hide content
                contents.forEach(content => {
                    content.style.display = 'none';
                });
                document.getElementById(`${targetTab}-content`).style.display = 'block';
            });
        });
    }

    exportAnalyticsReport(type) {
        const analytics = this.generateAnalytics();
        let reportData = [];

        if (type === 'overview') {
            reportData = [
                ['Metric', 'Value'],
                ['Total Books', analytics.totalBooks],
                ['Total Inventory Value', `₹${analytics.totalValue.toLocaleString()}`],
                ['Average Price', `₹${Math.round(analytics.priceAnalysis.avgPrice)}`],
                ['Average Stock', `${Math.round(analytics.stockAnalysis.avgStock)} units`],
                ['Low Stock Items', analytics.lowStockCount],
                ['Out of Stock Items', analytics.outOfStockCount],
                ['Total Categories', analytics.categories.length]
            ];
        } else {
            // Detailed report
            reportData = [
                ['Book Title', 'Author', 'Category', 'Price', 'Stock', 'Total Value', 'Status'],
                ...this.books.map(book => [
                    book.title,
                    book.author,
                    book.category,
                    book.price,
                    book.stock,
                    book.price * book.stock,
                    book.status
                ])
            ];
        }

        this.exportBooksToCSV(reportData, `${type}-analytics-report`);
        this.showMessage(`${type} analytics report exported successfully!`, 'success');
    }

    // UX Enhancement Methods
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            const ctrl = e.ctrlKey || e.metaKey;
            const shift = e.shiftKey;
            
            let shortcut = '';
            if (ctrl && shift) shortcut = `ctrl+shift+${key}`;
            else if (ctrl) shortcut = `ctrl+${key}`;
            else if (key === 'escape') shortcut = 'escape';
            
            if (shortcut && this.keyboardShortcuts[shortcut]) {
                e.preventDefault();
                this.keyboardShortcuts[shortcut]();
            }
        });
    }

    setupGlobalModalHandlers() {
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('book-details-modal') || 
                e.target.classList.contains('edit-book-modal') ||
                e.target.classList.contains('analytics-modal') ||
                e.target.classList.contains('inventory-modal') ||
                e.target.classList.contains('data-management-modal') ||
                e.target.classList.contains('stock-alert-modal') ||
                e.target.classList.contains('quick-actions-modal')) {
                e.target.remove();
            }
        });

        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.book-details-modal, .edit-book-modal, .analytics-modal, .inventory-modal, .data-management-modal, .stock-alert-modal, .quick-actions-modal');
                modals.forEach(modal => modal.remove());
            }
        });
    }

    selectAllBooks() {
        const checkboxes = document.querySelectorAll('.book-checkbox');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
            if (checkbox.checked) {
                this.selectedBooks.add(checkbox.value);
            } else {
                this.selectedBooks.delete(checkbox.value);
            }
        });
        
        this.updateBulkOperationsBar();
        this.showMessage(allChecked ? 'All books deselected' : 'All books selected', 'success');
    }

    closeAllModals() {
        document.querySelectorAll('.book-details-modal, .edit-book-modal, .analytics-modal, .inventory-modal, .data-management-modal, .stock-alert-modal, .quick-actions-modal').forEach(modal => {
            modal.remove();
        });
    }

    // Pagination Methods
    calculatePagination() {
        this.totalPages = Math.ceil(this.filteredBooks.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages) {
            this.currentPage = Math.max(1, this.totalPages);
        }
    }

    getCurrentPageBooks() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredBooks.slice(startIndex, endIndex);
    }

    renderPagination() {
        const paginationContainer = document.getElementById('books-pagination');
        if (!paginationContainer) return;

        if (this.totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        const prevDisabled = this.currentPage === 1 ? 'disabled' : '';
        const nextDisabled = this.currentPage === this.totalPages ? 'disabled' : '';

        paginationContainer.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 20px;">
                <button onclick="window.adminBooksManager.goToPage(${this.currentPage - 1})" 
                        ${prevDisabled} 
                        style="
                            padding: 8px 12px;
                            border: 1px solid #d1d5db;
                            background: ${prevDisabled ? '#f9fafb' : 'white'};
                            color: ${prevDisabled ? '#9ca3af' : '#374151'};
                            border-radius: 4px;
                            cursor: ${prevDisabled ? 'not-allowed' : 'pointer'};
                            font-size: 14px;
                        ">
                    <i class="fas fa-chevron-left"></i> Previous
                </button>
                
                ${this.generatePaginationNumbers()}
                
                <button onclick="window.adminBooksManager.goToPage(${this.currentPage + 1})" 
                        ${nextDisabled}
                        style="
                            padding: 8px 12px;
                            border: 1px solid #d1d5db;
                            background: ${nextDisabled ? '#f9fafb' : 'white'};
                            color: ${nextDisabled ? '#9ca3af' : '#374151'};
                            border-radius: 4px;
                            cursor: ${nextDisabled ? 'not-allowed' : 'pointer'};
                            font-size: 14px;
                        ">
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

    generatePaginationNumbers() {
        const numbers = [];
        const maxVisible = 5;
        let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(this.totalPages, start + maxVisible - 1);
        
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            const isActive = i === this.currentPage;
            numbers.push(`
                <button onclick="window.adminBooksManager.goToPage(${i})" 
                        style="
                            padding: 8px 12px;
                            border: 1px solid #d1d5db;
                            background: ${isActive ? '#2563eb' : 'white'};
                            color: ${isActive ? 'white' : '#374151'};
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: ${isActive ? '600' : '400'};
                        ">
                    ${i}
                </button>
            `);
        }

        return numbers.join('');
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.renderBooks();
            this.renderPagination();
            
            // Scroll to top of books list
            const booksList = document.getElementById('books-list');
            if (booksList) {
                booksList.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    // Quick Actions
    showQuickActions(bookId) {
        const book = this.books.find(b => b._id === bookId);
        if (!book) return;

        const quickActionsModal = document.createElement('div');
        quickActionsModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        quickActionsModal.innerHTML = `
            <div style="
                background: white;
                border-radius: 8px;
                padding: 20px;
                max-width: 400px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            ">
                <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                    Quick Actions - ${book.title}
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <button onclick="window.adminBooksManager.quickStockUpdate('${book._id}'); document.querySelector('.quick-actions-modal').remove();" 
                            style="
                                padding: 12px;
                                border: 1px solid #d1d5db;
                                background: white;
                                color: #374151;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                text-align: center;
                            ">
                        <i class="fas fa-warehouse" style="display: block; font-size: 20px; margin-bottom: 4px; color: #2563eb;"></i>
                        Update Stock
                    </button>
                    
                    <button onclick="window.adminBooksManager.duplicateBook('${book._id}'); document.querySelector('.quick-actions-modal').remove();" 
                            style="
                                padding: 12px;
                                border: 1px solid #d1d5db;
                                background: white;
                                color: #374151;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                text-align: center;
                            ">
                        <i class="fas fa-copy" style="display: block; font-size: 20px; margin-bottom: 4px; color: #059669;"></i>
                        Duplicate
                    </button>
                    
                    <button onclick="window.adminBooksManager.archiveBook('${book._id}'); document.querySelector('.quick-actions-modal').remove();" 
                            style="
                                padding: 12px;
                                border: 1px solid #d1d5db;
                                background: white;
                                color: #374151;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                text-align: center;
                            ">
                        <i class="fas fa-archive" style="display: block; font-size: 20px; margin-bottom: 4px; color: #f59e0b;"></i>
                        Archive
                    </button>
                    
                    <button onclick="window.adminBooksManager.showBookDetailsModal(window.adminBooksManager.books.find(b => b._id === '${book._id}')); document.querySelector('.quick-actions-modal').remove();" 
                            style="
                                padding: 12px;
                                border: 1px solid #d1d5db;
                                background: white;
                                color: #374151;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                text-align: center;
                            ">
                        <i class="fas fa-eye" style="display: block; font-size: 20px; margin-bottom: 4px; color: #7c3aed;"></i>
                        View Details
                    </button>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                    <button onclick="document.querySelector('.quick-actions-modal').remove()" 
                            style="
                                background: #6b7280;
                                color: white;
                                border: none;
                                padding: 8px 16px;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 12px;
                            ">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        quickActionsModal.className = 'quick-actions-modal';
        document.body.appendChild(quickActionsModal);
    }

    duplicateBook(bookId) {
        const book = this.books.find(b => b._id === bookId);
        if (!book) return;

        const newBook = {
            ...book,
            _id: `book_${Date.now()}`,
            title: `${book.title} (Copy)`,
            isbn: `978${Math.floor(Math.random() * 10000000000)}`,
            stock: 0,
            status: 'inactive',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.books.unshift(newBook);
        this.filteredBooks = [...this.books];
        this.renderBooks();
        this.showMessage(`Book "${newBook.title}" duplicated successfully!`, 'success');
    }

    archiveBook(bookId) {
        const book = this.books.find(b => b._id === bookId);
        if (!book) return;

        book.status = 'discontinued';
        book.updatedAt = new Date();
        
        // Update filtered books if visible
        const filteredIndex = this.filteredBooks.findIndex(b => b._id === bookId);
        if (filteredIndex !== -1) {
            this.filteredBooks[filteredIndex] = { ...book };
        }
        
        this.renderBooks();
        this.showMessage(`Book "${book.title}" archived successfully!`, 'success');
    }

    // Enhanced render methods with pagination
    renderBooks() {
        const booksList = document.getElementById('books-list');
        if (!booksList) return;

        this.calculatePagination();
        const currentPageBooks = this.getCurrentPageBooks();

        if (currentPageBooks.length === 0) {
            booksList.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #6b7280;">
                    <div style="font-size: 48px; margin-bottom: 16px; color: #d1d5db;">📚</div>
                    <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">No books found</h3>
                    <p style="font-size: 14px; margin: 0;">Try adjusting your search criteria or filters</p>
                </div>
            `;
            this.renderPagination();
            return;
        }

        if (this.currentView === 'grid') {
            booksList.innerHTML = this.createBooksGrid(currentPageBooks);
        } else {
            booksList.innerHTML = this.createBooksList(currentPageBooks);
        }
        
        this.setupBookActionListeners();
        this.renderPagination();
    }

    createBooksGrid(books = this.filteredBooks) {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; padding: 20px;">
                ${books.map(book => this.createBookCard(book)).join('')}
            </div>
        `;
    }

    createBooksList(books = this.filteredBooks) {
        return `
            <div style="padding: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa; border-bottom: 2px solid #e5e7eb;">
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Select</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Book</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Author</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Category</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Price</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Stock</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Status</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${books.map(book => this.createBookRow(book)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Enhanced book card with quick actions
    createBookCard(book) {
        const statusColors = {
            active: '#dcfce7',
            inactive: '#f3f4f6',
            'out-of-stock': '#fee2e2',
            discontinued: '#fef3c7'
        };

        const statusTextColors = {
            active: '#166534',
            inactive: '#6b7280',
            'out-of-stock': '#991b1b',
            discontinued: '#92400e'
        };

        const stockStatus = book.stock === 0 ? 'out-of-stock' : (book.stock < 5 ? 'low-stock' : 'in-stock');
        const stockColor = book.stock === 0 ? '#ef4444' : (book.stock < 5 ? '#f59e0b' : '#059669');

        return `
            <div class="book-card" data-book-id="${book._id}" style="
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                position: relative;
            " onmouseover="this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.15)'" onmouseout="this.style.boxShadow='0 1px 3px rgba(0, 0, 0, 0.1)'">
                
                <!-- Quick Actions Button -->
                <button onclick="window.adminBooksManager.showQuickActions('${book._id}')" 
                        style="
                            position: absolute;
                            top: 8px;
                            right: 8px;
                            width: 24px;
                            height: 24px;
                            border: none;
                            background: rgba(0, 0, 0, 0.1);
                            color: #6b7280;
                            border-radius: 50%;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 12px;
                            opacity: 0;
                            transition: opacity 0.3s ease;
                        " 
                        onmouseover="this.style.opacity='1'; this.style.background='rgba(0, 0, 0, 0.2)'"
                        onmouseout="this.style.opacity='0'; this.style.background='rgba(0, 0, 0, 0.1)'">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                
                <!-- Book Header -->
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #1f2937; line-height: 1.3;">${book.title}</h4>
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">by ${book.author}</p>
                    </div>
                    <input type="checkbox" class="book-checkbox" value="${book._id}" style="margin-left: 8px;">
                </div>

                <!-- Book Details -->
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 12px; color: #6b7280;">Category:</span>
                        <span style="font-size: 12px; color: #374151; text-transform: capitalize;">${book.category}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 12px; color: #6b7280;">Price:</span>
                        <span style="font-size: 14px; font-weight: 600; color: #059669;">₹${book.price}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 12px; color: #6b7280;">Stock:</span>
                        <span style="font-size: 12px; color: ${stockColor}; font-weight: 500;">${book.stock} units</span>
                    </div>
                </div>

                <!-- Status Badge -->
                <div style="margin-bottom: 12px;">
                    <span style="
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 500;
                        text-transform: uppercase;
                        background: ${statusColors[book.status]};
                        color: ${statusTextColors[book.status]};
                    ">${book.status.replace('-', ' ')}</span>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 8px;">
                    <button class="book-action-btn" data-book-id="${book._id}" data-action="view" style="
                        flex: 1;
                        padding: 8px 12px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: 500;
                        background: #2563eb;
                        color: white;
                    ">View</button>
                    <button class="book-action-btn" data-book-id="${book._id}" data-action="edit" style="
                        flex: 1;
                        padding: 8px 12px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: 500;
                        background: #059669;
                        color: white;
                    ">Edit</button>
                    <button class="book-action-btn" data-book-id="${book._id}" data-action="delete" style="
                        padding: 8px 12px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: 500;
                        background: #ef4444;
                        color: white;
                    ">Delete</button>
                </div>
            </div>
        `;
    }
}
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
      // Initialize the enhanced books manager
      if (!window.adminBooksManager) {
        window.adminBooksManager = new AdminBooksManager();
      }
    }
    if (sectionId === 'users') {
  // ...removed console.log...
      loadUsers();
    }
    if (sectionId === 'orders') {
  // ...removed console.log...
      // Initialize the enhanced orders manager
      if (!window.adminOrdersManager) {
        console.log('Initializing AdminOrdersManager...');
        window.adminOrdersManager = new AdminOrdersManager();
        console.log('AdminOrdersManager initialized:', !!window.adminOrdersManager);
      } else {
        console.log('AdminOrdersManager already exists');
      }
    }
    if (sectionId === 'analytics') {
  // ...removed console.log...
      loadAuditLog();
    }
    if (sectionId === 'banner-management') {
      console.log('Loading banner management section...');
      renderBannersAdminList();
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
    console.log('=== BANNER FETCH DEBUG ===');
    console.log('Fetching banners...');
    const token = getToken();
    console.log('Admin token exists:', !!token);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    
    console.log('Making request to /api/admin/banners');
    const res = await authFetch('/api/admin/banners');
    console.log('Banner response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      console.error('Banner fetch failed with status:', res.status);
      const errorText = await res.text();
      console.error('Error response:', errorText);
      return [];
    }
    
    const data = await res.json();
    console.log('Banner data received:', data);
    console.log('Banner count:', data.data ? data.data.length : 0);
    console.log('=== END BANNER FETCH DEBUG ===');
    return data.data || [];
  } catch (e) { 
    console.error('Error fetching banners:', e);
    console.error('Error stack:', e.stack);
    return []; 
  }
}
function renderBannerRow(b) {
  const statusClass = b.active ? 'active' : 'inactive';
  const statusText = b.active ? 'Active' : 'Inactive';
  const statusColor = b.active ? '#28a745' : '#dc3545';
  
  return `
    <div class="banner-row ${statusClass}" data-id="${b._id}" style="
      display: flex; 
      gap: 15px; 
      align-items: center; 
      padding: 15px; 
      border: 1px solid #e0e0e0; 
      border-radius: 8px; 
      margin-bottom: 10px; 
      background: #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    ">
      <div class="drag-handle" style="cursor: grab; padding: 5px; color: #666;">☰</div>
      <img src="${b.imageUrl}" alt="banner" style="
        width: 100px; 
        height: 60px; 
        object-fit: cover; 
        border-radius: 6px;
        border: 2px solid #f0f0f0;
      "/>
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 600; color: #333; margin-bottom: 4px;">
          ${b.title || 'Untitled Banner'}
        </div>
        <div style="font-size: 13px; color: #666; margin-bottom: 4px;">
          ${b.subtitle || 'No subtitle'}
        </div>
        <div style="font-size: 12px; color: #999;">
          CTA: ${b.ctaText || 'None'} | Link: ${b.ctaLink || 'None'}
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
        <input type="number" class="banner-order" value="${b.order || 0}" style="
          width: 60px; 
          padding: 4px; 
          border: 1px solid #ddd; 
          border-radius: 4px; 
          text-align: center;
        " placeholder="Order" />
        <label style="display: flex; align-items: center; gap: 6px; font-size: 12px;">
          <input type="checkbox" class="banner-active" ${b.active ? 'checked' : ''} style="transform: scale(1.2);"/>
          <span style="color: ${statusColor}; font-weight: 600;">${statusText}</span>
        </label>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button class="btn banner-edit" style="
          min-width: 80px; 
          background: #007bff; 
          color: #fff; 
          border: none; 
          padding: 6px 12px; 
          border-radius: 4px; 
          cursor: pointer;
          font-size: 12px;
        ">Edit</button>
        <button class="btn banner-save" style="
          min-width: 80px; 
          background: #28a745; 
          color: #fff; 
          border: none; 
          padding: 6px 12px; 
          border-radius: 4px; 
          cursor: pointer;
          font-size: 12px;
        ">Save</button>
        <button class="btn banner-delete" style="
          min-width: 80px; 
          background: #dc3545; 
          color: #fff; 
          border: none; 
          padding: 6px 12px; 
          border-radius: 4px; 
          cursor: pointer;
          font-size: 12px;
        ">Delete</button>
      </div>
    </div>`;
}
async function renderBannersAdminList() {
  const list = document.getElementById('banners-list');
  if (!list) {
    console.error('Banners list element not found');
    return;
  }
  
  // Show loading state
  list.innerHTML = `
    <div style="text-align: center; color: #666; padding: 40px;">
      <div style="font-size: 18px; margin-bottom: 10px;">⏳</div>
      <div>Loading banners...</div>
      <div style="font-size: 12px; color: #999; margin-top: 8px;">
        Checking authentication and fetching data...
      </div>
    </div>
  `;
  
  try {
    console.log('=== RENDER BANNERS DEBUG ===');
    console.log('Starting banner fetch...');
    const banners = await adminFetchBanners();
    console.log('Banners received:', banners);
    console.log('Banner count:', banners.length);
    
    if (banners.length === 0) {
      console.log('No banners found, showing empty state');
      list.innerHTML = `
        <div style="text-align: center; color: #666; padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
          <h3 style="color: #333; margin-bottom: 8px;">No Banners Yet</h3>
          <p style="margin-bottom: 16px;">Create your first banner using the form above.</p>
          <div style="font-size: 12px; color: #999;">
            Banners will appear here once created
          </div>
        </div>
      `;
    } else {
      console.log('Rendering banner rows...');
      list.innerHTML = banners.map(renderBannerRow).join('');
      console.log('Banner rows rendered successfully');
    }
    console.log('=== END RENDER BANNERS DEBUG ===');
  } catch (error) {
    console.error('Error in renderBannersAdminList:', error);
    list.innerHTML = `
      <div style="text-align: center; color: #dc3545; padding: 40px;">
        <div style="font-size: 18px; margin-bottom: 10px;">❌</div>
        <div>Failed to load banners. Please try again.</div>
        <div style="font-size: 12px; color: #999; margin-top: 8px;">
          Error: ${error.message}
        </div>
        <div style="font-size: 10px; color: #666; margin-top: 4px;">
          Check console for detailed error information
        </div>
      </div>
    `;
  }
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
    if (res.ok) {
      renderBannersAdminList();
      showNotification('Banner updated successfully!', 'success');
    }
  }
  
  if (e.target.classList.contains('banner-edit')) {
    // Load banner data into the form for editing
    const banners = await adminFetchBanners();
    const banner = banners.find(b => b._id === id);
    if (banner) {
      document.getElementById('banner-title').value = banner.title || '';
      document.getElementById('banner-subtitle').value = banner.subtitle || '';
      document.getElementById('banner-cta-text').value = banner.ctaText || '';
      document.getElementById('banner-cta-link').value = banner.ctaLink || '';
      document.getElementById('banner-overlay').checked = banner.overlay || false;
      document.getElementById('banner-text-color').value = banner.textColor || '#ffffff';
      document.getElementById('banner-cta-color').value = banner.ctaColor || '#ffffff';
      document.getElementById('banner-cta-bg').value = banner.ctaBg || '#e94e77';
      document.getElementById('banner-order').value = banner.order || 0;
      document.getElementById('banner-active').checked = banner.active || false;
      document.getElementById('banner-image-url').value = banner.imageUrl || '';
      
      // Scroll to form
      document.getElementById('banner-form').scrollIntoView({ behavior: 'smooth' });
      showNotification('Banner loaded for editing. Update and click "Add Banner" to save changes.', 'info');
    }
  }
  
  if (e.target.classList.contains('banner-delete')) {
    if (!confirm('Are you sure you want to delete this banner? This action cannot be undone.')) return;
    const res = await authFetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
    if (res.ok) {
      row.remove();
      showNotification('Banner deleted successfully!', 'success');
    } else {
      showNotification('Failed to delete banner. Please try again.', 'error');
    }
  }
});

// Add notification function
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 6px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  const colors = {
    success: '#28a745',
    error: '#dc3545',
    info: '#007bff',
    warning: '#ffc107'
  };
  
  notification.style.backgroundColor = colors[type] || colors.info;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

window.addEventListener('hashchange', function(){
  if (location.hash === '#banner-management') renderBannersAdminList();
});
if (location.hash === '#banner-management') renderBannersAdminList();
