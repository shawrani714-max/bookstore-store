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

    // Goal Setting Functions
    window.setGoal = function(type) {
        const currentTarget = document.getElementById(`${type}-target`).textContent;
        const newTarget = prompt(`Set your ${type} goal (₹):`, currentTarget.replace('₹', ''));
        
        if (newTarget && !isNaN(newTarget)) {
            document.getElementById(`${type}-target`).textContent = `₹${newTarget}`;
            updateGoalProgress(type);
            showNotification(`Goal updated successfully!`, 'success');
            
            // Save to localStorage
            localStorage.setItem(`affiliate_${type}_goal`, newTarget);
        }
    };

    function updateGoalProgress(type) {
        const current = parseFloat(document.getElementById(`${type}-current`).textContent.replace('₹', ''));
        const target = parseFloat(document.getElementById(`${type}-target`).textContent.replace('₹', ''));
        const progress = Math.min((current / target) * 100, 100);
        
        document.getElementById(`${type}-progress`).style.width = `${progress}%`;
    }

    // Load saved goals
    function loadGoals() {
        const monthlyGoal = localStorage.getItem('affiliate_monthly_goal') || '5000';
        const yearlyGoal = localStorage.getItem('affiliate_yearly_goal') || '50000';
        
        document.getElementById('monthly-target').textContent = `₹${monthlyGoal}`;
        document.getElementById('yearly-target').textContent = `₹${yearlyGoal}`;
        
        updateGoalProgress('monthly');
        updateGoalProgress('yearly');
    }

    // Social Sharing Functions
    window.shareToSocial = function(platform) {
        const referralLink = document.getElementById('referral-link').value;
        const text = "Check out amazing books at Bookworld India!";
        
        let url = '';
        switch(platform) {
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
                break;
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + referralLink)}`;
                break;
        }
        
        if (url) {
            window.open(url, '_blank', 'width=600,height=400');
            trackSocialShare(platform);
        }
    };

    function trackSocialShare(platform) {
        // Track social sharing
        fetch('/api/affiliate/track-share', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ platform: platform })
        }).catch(error => console.log('Share tracking failed:', error));
    }

    // QR Code Generation
    window.generateQRCode = function() {
        const referralLink = document.getElementById('referral-link').value;
        if (!referralLink) {
            showNotification('Please generate your referral link first', 'error');
            return;
        }

        // Using QR Server API for QR code generation
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(referralLink)}`;
        
        document.getElementById('qr-code-display').innerHTML = `
            <img src="${qrUrl}" alt="QR Code" style="max-width: 150px; height: auto;">
            <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #666;">
                <a href="${qrUrl}" download="referral-qr-code.png" style="color: #667eea;">
                    <i class="fas fa-download"></i> Download QR Code
                </a>
            </div>
        `;
        
        showNotification('QR Code generated successfully!', 'success');
    };

    // Email Templates
    window.showEmailTemplate = function(type) {
        const referralLink = document.getElementById('referral-link').value;
        let template = '';
        
        switch(type) {
            case 'welcome':
                template = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #667eea;">Welcome to Bookworld India!</h2>
                        <p>Dear Reader,</p>
                        <p>Welcome to the wonderful world of books! We're excited to have you join our community of book lovers.</p>
                        <p>Here are some handpicked recommendations just for you:</p>
                        <ul>
                            <li>📚 Best Sellers Collection</li>
                            <li>🔥 New Releases</li>
                            <li>⭐ Editor's Choice</li>
                        </ul>
                        <p>Start your reading journey today: <a href="${referralLink}" style="color: #667eea;">${referralLink}</a></p>
                        <p>Happy Reading!<br>The Bookworld Team</p>
                    </div>
                `;
                break;
            case 'deals':
                template = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #e53e3e;">🔥 HOT DEALS - Limited Time Only!</h2>
                        <p>Don't miss out on these amazing book deals:</p>
                        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                            <h3>📚 Up to 50% OFF on Fiction Books</h3>
                            <p>Valid until end of month</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                            <h3>🎯 Buy 2 Get 1 FREE on Business Books</h3>
                            <p>Limited stock available</p>
                        </div>
                        <p>Shop now: <a href="${referralLink}" style="color: #667eea;">${referralLink}</a></p>
                        <p>Happy Shopping!<br>The Bookworld Team</p>
                    </div>
                `;
                break;
            case 'releases':
                template = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #38a169;">⭐ New Releases This Week</h2>
                        <p>Discover the latest books hitting the shelves:</p>
                        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                            <h3>📖 "The Future of Reading" by Jane Smith</h3>
                            <p>A thought-provoking exploration of digital reading trends</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                            <h3>📚 "Mystery of the Lost Library" by John Doe</h3>
                            <p>An exciting adventure for mystery lovers</p>
                        </div>
                        <p>Get your copies: <a href="${referralLink}" style="color: #667eea;">${referralLink}</a></p>
                        <p>Happy Reading!<br>The Bookworld Team</p>
                    </div>
                `;
                break;
        }
        
        showModal('Email Template Preview', template);
    };

    // Real-time Notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Performance Chart (using Chart.js)
    function initPerformanceChart() {
        const ctx = document.getElementById('performance-chart');
        if (!ctx) return;
        
        // Mock data for demonstration
        const chartData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Earnings (₹)',
                data: [1200, 1900, 3000, 5000, 2000, 3000],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4
            }]
        };
        
        // Simple chart implementation without Chart.js
        const canvas = ctx;
        const context = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        context.clearRect(0, 0, width, height);
        
        // Draw simple line chart
        context.strokeStyle = '#667eea';
        context.lineWidth = 2;
        context.beginPath();
        
        const maxValue = Math.max(...chartData.datasets[0].data);
        const stepX = width / (chartData.labels.length - 1);
        
        chartData.datasets[0].data.forEach((value, index) => {
            const x = index * stepX;
            const y = height - (value / maxValue) * height;
            
            if (index === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        });
        
        context.stroke();
        
        // Draw data points
        context.fillStyle = '#667eea';
        chartData.datasets[0].data.forEach((value, index) => {
            const x = index * stepX;
            const y = height - (value / maxValue) * height;
            context.beginPath();
            context.arc(x, y, 4, 0, 2 * Math.PI);
            context.fill();
        });
    }

    // Analytics Functions
    function updateAnalytics() {
        // Mock analytics data
        const analytics = {
            ctr: 3.2,
            conversion: 2.1,
            aov: 1250,
            clicks: 1250
        };
        
        document.getElementById('ctr-value').textContent = `${analytics.ctr}%`;
        document.getElementById('conversion-value').textContent = `${analytics.conversion}%`;
        document.getElementById('aov-value').textContent = `₹${analytics.aov}`;
        document.getElementById('total-clicks').textContent = analytics.clicks;
        
        // Update change indicators
        document.getElementById('ctr-change').textContent = '+0.5%';
        document.getElementById('conversion-change').textContent = '+0.2%';
        document.getElementById('aov-change').textContent = '+5%';
        document.getElementById('clicks-change').textContent = '+50';
    }

    // Real-time Updates
    function startRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            updateAnalytics();
            updateGoalProgress('monthly');
            updateGoalProgress('yearly');
            
            // Random notification
            if (Math.random() > 0.8) {
                const notifications = [
                    'New referral click detected!',
                    'Commission earned: ₹50',
                    'Goal progress: 75% complete',
                    'New order from referral!'
                ];
                const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
                showNotification(randomNotification, 'success');
            }
        }, 30000);
    }

    // Initialize new features
    loadGoals();
    updateAnalytics();
    initPerformanceChart();
    startRealTimeUpdates();
    
    // Update goal progress when earnings change
    const originalPopulateDashboard = populateDashboard;
    populateDashboard = function(data) {
        originalPopulateDashboard(data);
        
        // Update goal progress with current earnings
        const currentEarnings = data.affiliate.totalEarnings || 0;
        document.getElementById('monthly-current').textContent = `₹${currentEarnings}`;
        document.getElementById('yearly-current').textContent = `₹${currentEarnings}`;
        
        updateGoalProgress('monthly');
        updateGoalProgress('yearly');
    };
});