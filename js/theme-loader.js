document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/admin/theme');
    if (!res.ok) return; // fall back to default CSS
    const settings = await res.json();

    const root = document.documentElement;
    if (settings.primaryColor) root.style.setProperty('--primary-color', settings.primaryColor);
    if (settings.accentColor) root.style.setProperty('--accent-color', settings.accentColor);
    if (settings.bgColor) root.style.setProperty('--bg-color', settings.bgColor);
    if (settings.cardColor) root.style.setProperty('--card-color', settings.cardColor);

    // Optional extras if present
    if (settings.buttonColor) root.style.setProperty('--button-color', settings.buttonColor);
    if (settings.headingColor) root.style.setProperty('--heading-color', settings.headingColor);
  } catch (e) {
    // no-op; defaults remain
  }
});


