document.addEventListener('DOMContentLoaded', function() {
    // Elements
  const registerBtn = document.getElementById('register-affiliate-btn');
  const registrationStatus = document.getElementById('affiliate-registration-status');
  const affiliateInfo = document.getElementById('affiliate-info');
    const affiliateRegistration = document.getElementById('affiliate-registration');
  const referralLinkInput = document.getElementById('referral-link');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const ordersList = document.getElementById('orders-list');
    
    // Stats elements
    const totalEarnings = document.getElementById('total-earnings');
    const totalOrders = document.getElementById('total-orders');
    const commissionRate = document.getElementById('commission-rate');
    const referralLinkClicks = document.getElementById('referral-link-clicks');
    const thisMonthEarnings = document.getElementById('this-month-earnings');
    const lastMonthEarnings = document.getElementById('last-month-earnings');
    const pendingEarnings = document.getElementById('pending-earnings');
    const paidEarnings = document.getElementById('paid-earnings');

    // Get token from localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');

    // Check if user is logged in
    if (!token) {
        showMessage('Please login to access affiliate dashboard', 'error');
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return;
    }

    // Load affiliate dashboard
    loadDashboard();

    // Register affiliate button
    registerBtn.addEventListener('click', function() {
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
        registerBtn.disabled = true;
        
        fetch('/api/affiliate/register', {
            method: 'POST',
            headers: { 
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showMessage('Successfully registered as affiliate! Your code: ' + data.code, 'success');
                setTimeout(() => {
                    loadDashboard();
                }, 1000);
            } else {
                showMessage(data.message || 'Registration failed. Please try again.', 'error');
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            showMessage('Network error. Please try again.', 'error');
        })
        .finally(() => {
            registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Register as Affiliate';
            registerBtn.disabled = false;
        });
    });

    // Copy referral link
    copyLinkBtn.addEventListener('click', function() {
        referralLinkInput.select();
        document.execCommand('copy');
        
        const originalText = copyLinkBtn.innerHTML;
        copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyLinkBtn.style.background = '#38a169';
        
        setTimeout(() => {
            copyLinkBtn.innerHTML = originalText;
            copyLinkBtn.style.background = '';
        }, 2000);
    });

    // Load affiliate dashboard
  function loadDashboard() {
    fetch('/api/affiliate/dashboard', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
                // Show affiliate dashboard
                affiliateRegistration.classList.add('hidden');
                affiliateInfo.classList.remove('hidden');
                
                // Populate data
                populateDashboard(data);
          } else {
                // Show registration form
                affiliateRegistration.classList.remove('hidden');
                affiliateInfo.classList.add('hidden');
            }
        })
        .catch(error => {
            console.error('Dashboard load error:', error);
            showMessage('Failed to load dashboard. Please refresh the page.', 'error');
        });
    }

    // Populate dashboard with data
    function populateDashboard(data) {
        const affiliate = data.affiliate;
        
        // Set referral link
        referralLinkInput.value = data.referralLink || '';
        
        // Update stats
        totalEarnings.textContent = '₹' + (affiliate.totalEarnings || 0).toFixed(2);
        totalOrders.textContent = affiliate.referredOrders ? affiliate.referredOrders.length : 0;
        commissionRate.textContent = ((affiliate.commissionRate || 0.05) * 100).toFixed(0) + '%';
        
        // Calculate earnings breakdown (mock data for now)
        const totalEarningsAmount = affiliate.totalEarnings || 0;
        thisMonthEarnings.textContent = '₹' + (totalEarningsAmount * 0.6).toFixed(2);
        lastMonthEarnings.textContent = '₹' + (totalEarningsAmount * 0.3).toFixed(2);
        pendingEarnings.textContent = '₹' + (totalEarningsAmount * 0.1).toFixed(2);
        paidEarnings.textContent = '₹' + (totalEarningsAmount * 0.5).toFixed(2);
        
        // Load orders
        loadOrders(affiliate.referredOrders || []);
    }

    // Load referred orders
    function loadOrders(orderIds) {
        if (orderIds.length === 0) {
            ordersList.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #718096;">
                        <i class="fas fa-shopping-cart"></i> No referred orders yet
                    </td>
                </tr>
            `;
            return;
        }

        // Fetch order details for each order ID
        Promise.all(orderIds.map(orderId => 
            fetch(`/api/orders/${orderId}`, {
      headers: { 'Authorization': 'Bearer ' + token }
            }).then(res => res.json())
        ))
        .then(orders => {
            ordersList.innerHTML = orders.map(order => {
                if (order.success) {
                    const orderData = order.data;
                    const commission = (orderData.total * 0.05).toFixed(2);
                    const date = new Date(orderData.createdAt).toLocaleDateString();
                    
                    return `
                        <tr>
                            <td>#${orderData.orderNumber}</td>
                            <td>${orderData.shippingAddress.fullName}</td>
                            <td>₹${orderData.total}</td>
                            <td>₹${commission}</td>
                            <td>${date}</td>
                            <td><span class="status-${orderData.status}">${orderData.status}</span></td>
                        </tr>
                    `;
                }
                return null;
            }).filter(Boolean).join('');
        })
        .catch(error => {
            console.error('Orders load error:', error);
            ordersList.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #e53e3e;">
                        <i class="fas fa-exclamation-triangle"></i> Failed to load orders
                    </td>
                </tr>
            `;
        });
    }

    // Show message
    function showMessage(message, type) {
        registrationStatus.textContent = message;
        registrationStatus.className = `message ${type}`;
        registrationStatus.style.display = 'block';
        
        setTimeout(() => {
            registrationStatus.style.display = 'none';
        }, 5000);
    }

    // Marketing functions
    window.downloadBanners = function() {
        // Create banner download links
        const banners = [
            { size: '728x90', name: 'Leaderboard Banner' },
            { size: '300x250', name: 'Medium Rectangle' },
            { size: '160x600', name: 'Wide Skyscraper' },
            { size: '300x600', name: 'Half Page' }
        ];
        
        let downloadLinks = '<div style="text-align: center; padding: 2rem;">';
        banners.forEach(banner => {
            downloadLinks += `
                <div style="margin: 1rem 0;">
                    <h4>${banner.name} (${banner.size})</h4>
                    <a href="/api/affiliate/banner/${banner.size}" 
                       download="bookworld-banner-${banner.size}.png" 
                       class="marketing-btn" 
                       style="display: inline-block; text-decoration: none; margin: 0.5rem;">
                        <i class="fas fa-download"></i> Download ${banner.size}
                    </a>
                </div>
            `;
        });
        downloadLinks += '</div>';
        
        showModal('Banner Downloads', downloadLinks);
    };

    window.showWidgetCode = function() {
        const referralCode = referralLinkInput.value.split('ref=')[1] || 'YOUR_CODE';
        const widgetCode = `
<!-- Bookworld India Widget -->
<div id="bookworld-widget" style="width: 300px; height: 400px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <iframe src="${window.location.origin}/widget?ref=${referralCode}" 
            width="100%" 
            height="100%" 
            frameborder="0"
            style="border: none;">
    </iframe>
</div>
<!-- End Bookworld Widget -->`;
        
        document.getElementById('widget-code').value = widgetCode;
        showModal('Widget Code', `
            <p>Copy and paste this code into your website:</p>
            <textarea readonly rows="10" style="width: 100%; font-family: monospace; padding: 1rem; border: 1px solid #ddd; border-radius: 5px;">${widgetCode}</textarea>
            <button onclick="copyWidgetCode()" class="copy-btn" style="margin-top: 1rem;">
                <i class="fas fa-copy"></i> Copy Code
            </button>
        `);
    };

    window.showSocialContent = function() {
        const referralLink = referralLinkInput.value;
        const socialContent = `
            <div style="text-align: left;">
                <h4>Facebook/LinkedIn Post:</h4>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 5px; margin: 1rem 0;">
                    📚 Discover amazing books at Bookworld India! From bestsellers to new releases, find your next favorite read. 
                    <br><br>
                    🔗 ${referralLink}
                    <br><br>
                    #Books #Reading #BookworldIndia #BookLovers
                </div>
                
                <h4>Twitter Post:</h4>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 5px; margin: 1rem 0;">
                    📚 Find your next favorite book at Bookworld India! Great selection, amazing prices. 
                    ${referralLink} #Books #Reading
                </div>
                
                <h4>Instagram Caption:</h4>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 5px; margin: 1rem 0;">
                    📖 Book lovers, this is for you! @bookworldindia has an incredible collection of books waiting to be discovered. 
                    From fiction to non-fiction, there's something for everyone. 
                    <br><br>
                    Link in bio: ${referralLink}
                    <br><br>
                    #Bookstagram #BookLovers #Reading #BookworldIndia #Books
                </div>
            </div>
        `;
        
        showModal('Social Media Content', socialContent);
    };

    window.copyWidgetCode = function() {
        const widgetCode = document.getElementById('widget-code');
        widgetCode.select();
        document.execCommand('copy');
        
        const copyBtn = document.querySelector('#widget-modal .copy-btn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.background = '#38a169';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '';
        }, 2000);
    };

    // Modal functions
    function showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // Close modal
        modal.querySelector('.close').onclick = () => {
            document.body.removeChild(modal);
        };
        
        // Close on outside click
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }

    // Add modal styles
    const modalStyles = `
        <style>
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        }
        
        .modal-content {
            background-color: white;
            margin: 5% auto;
            padding: 2rem;
            border-radius: 15px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        }
        
        .close {
            position: absolute;
            right: 1rem;
            top: 1rem;
            font-size: 2rem;
            font-weight: bold;
            cursor: pointer;
            color: #aaa;
        }
        
        .close:hover {
            color: #000;
        }
        
        .status-pending { color: #f6ad55; }
        .status-confirmed { color: #4299e1; }
        .status-shipped { color: #38a169; }
        .status-delivered { color: #38a169; }
        .status-cancelled { color: #e53e3e; }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', modalStyles);
});