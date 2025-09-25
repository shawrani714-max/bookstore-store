document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        once: true,
        offset: 20,
    });

    const sidebarLinks = document.querySelectorAll('.account-sidebar .list-group-item-action');
    const contentSections = document.querySelectorAll('.account-content .content-section');

    function showSection(targetId) {
        console.log('Switching to section:', targetId);
        // Update active link
        sidebarLinks.forEach(l => {
            const href = l.getAttribute('href');
            if (href && href.substring(1) === targetId) {
                l.classList.add('active');
            } else {
                l.classList.remove('active');
            }
        });
        // Show target content section
        contentSections.forEach(section => {
            if (section.id === targetId) {
                section.style.display = 'block';
                section.classList.add('active');
            } else {
                section.style.display = 'none';
                section.classList.remove('active');
            }
        });
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if(link.href.includes('index.html')) {
                window.location.href = link.href;
                return;
            }
            const targetId = link.getAttribute('href').substring(1);
            console.log('Sidebar link clicked:', targetId);
            showSection(targetId);
        });
    });

    // Show the profile section by default on page load
    showSection('profile');
}); 
