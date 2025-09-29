document.addEventListener('DOMContentLoaded', function() {
  const registerBtn = document.getElementById('register-affiliate-btn');
  const registrationStatus = document.getElementById('affiliate-registration-status');
  const affiliateInfo = document.getElementById('affiliate-info');
  const referralLinkInput = document.getElementById('referral-link');
  const earningsDiv = document.getElementById('affiliate-earnings');
  const ordersList = document.getElementById('affiliate-orders');

  // Simulate user token (replace with real auth in production)
  const token = localStorage.getItem('userToken');

  function loadDashboard() {
    fetch('/api/affiliate/dashboard', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          affiliateInfo.style.display = 'block';
          referralLinkInput.value = data.referralLink;
          earningsDiv.textContent = '₹' + (data.affiliate.totalEarnings || 0).toFixed(2);
          ordersList.innerHTML = '';
          if (data.affiliate.referredOrders && data.affiliate.referredOrders.length) {
            data.affiliate.referredOrders.forEach(orderId => {
              const li = document.createElement('li');
              li.textContent = 'Order ID: ' + orderId;
              ordersList.appendChild(li);
            });
          } else {
            ordersList.innerHTML = '<li>No referred orders yet.</li>';
          }
        }
      });
  }

  registerBtn.addEventListener('click', function() {
    registrationStatus.textContent = '';
    fetch('/api/affiliate/register', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          registrationStatus.textContent = 'Registered! Your code: ' + data.code;
          loadDashboard();
        } else {
          registrationStatus.textContent = data.message || 'Registration failed.';
        }
      });
  });

  // Try to load dashboard on page load
  loadDashboard();
});