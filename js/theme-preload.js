// Apply theme variables from localStorage before first paint to prevent color flash
(function applyThemeEarly() {
  try {
    var raw = localStorage.getItem('adminThemeSettings');
    if (!raw) return;
    var s = JSON.parse(raw);
    var rootStyle = document.documentElement.style;
    if (s.primaryColor) rootStyle.setProperty('--primary-color', s.primaryColor);
    if (s.accentColor) rootStyle.setProperty('--accent-color', s.accentColor);
    if (s.bgColor) rootStyle.setProperty('--bg-color', s.bgColor);
    if (s.cardColor) rootStyle.setProperty('--card-color', s.cardColor);
    if (s.buttonColor) rootStyle.setProperty('--button-color', s.buttonColor);
    if (s.headingColor) rootStyle.setProperty('--heading-color', s.headingColor);
  } catch (e) {
    // ignore
  }
})();


