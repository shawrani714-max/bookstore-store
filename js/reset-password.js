document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const form = document.getElementById('reset-password-form');
    const message = document.getElementById('reset-password-message');

    // Get token from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        message.textContent = 'Invalid or missing reset token.';
        if (mainContent) mainContent.classList.remove('hidden');
        document.body.classList.remove('body-hidden');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        if (newPassword !== confirmPassword) {
            message.textContent = 'Passwords do not match.';
            return;
        }
        message.textContent = 'Resetting password...';
        try {
            const response = await fetch(`/api/auth/reset-password/${token}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword })
            });
            if (!response.ok) throw new Error('Failed to reset password');
            message.textContent = 'Password reset successful! You can now log in with your new password.';
            form.style.display = 'none';
        } catch (err) {
            message.textContent = 'Failed to reset password. The link may have expired.';
        }
    });

    if (mainContent) mainContent.classList.remove('hidden');
    document.body.classList.remove('body-hidden');
}); 
