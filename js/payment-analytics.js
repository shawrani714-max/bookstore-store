/**
 * Payment Analytics and Monitoring
 * Tracks payment metrics, conversion rates, and user behavior
 */

class PaymentAnalytics {
    constructor() {
        this.metrics = this.initializeMetrics();
        this.sessionId = this.generateSessionId();
        this.setupAnalytics();
    }

    initializeMetrics() {
        return {
            conversionRate: 0,
            averagePaymentTime: 0,
            methodPreferences: {},
            errorRates: {},
            abandonmentPoints: [],
            userSegments: {},
            deviceTypes: {},
            paymentFlows: {},
            revenue: {
                total: 0,
                byMethod: {},
                bySegment: {},
                trends: []
            }
        };
    }

    setupAnalytics() {
        this.setupEventTracking();
        this.setupPerformanceMonitoring();
        this.setupUserBehaviorTracking();
        this.setupConversionTracking();
    }

    // Event tracking
    setupEventTracking() {
        // Track payment attempts
        this.trackPaymentAttempt = this.createEventTracker('payment_attempt');
        this.trackPaymentSuccess = this.createEventTracker('payment_success');
        this.trackPaymentFailure = this.createEventTracker('payment_failure');
        this.trackPaymentAbandonment = this.createEventTracker('payment_abandonment');
        this.trackMethodSelection = this.createEventTracker('method_selection');
        this.trackFormInteraction = this.createEventTracker('form_interaction');
    }

    createEventTracker(eventType) {
        return (data) => {
            const event = {
                type: eventType,
                timestamp: new Date().toISOString(),
                sessionId: this.sessionId,
                userId: this.getCurrentUserId(),
                ...data
            };

            // Send to analytics service
            this.sendEvent(event);
            
            // Update local metrics
            this.updateMetrics(event);
            
            // Store locally for offline sync
            this.storeEventLocally(event);
        };
    }

    // Payment attempt tracking
    trackPaymentAttempt(method, amount, userSegment) {
        const event = {
            method,
            amount,
            userSegment,
            deviceType: this.getDeviceType(),
            browser: this.getBrowserInfo(),
            location: this.getLocationInfo(),
            sessionDuration: this.getSessionDuration(),
            pageLoadTime: this.getPageLoadTime()
        };

        this.trackPaymentAttempt(event);
    }

    // Payment success tracking
    trackPaymentSuccess(method, amount, processingTime, orderId) {
        const event = {
            method,
            amount,
            processingTime,
            orderId,
            conversionTime: this.getConversionTime(),
            attempts: this.getPaymentAttempts(),
            userSegment: this.getUserSegment()
        };

        this.trackPaymentSuccess(event);
        
        // Update conversion rate
        this.updateConversionRate();
        
        // Track revenue
        this.trackRevenue(amount, method);
    }

    // Payment failure tracking
    trackPaymentFailure(method, error, step, context) {
        const event = {
            method,
            error: error.code,
            errorMessage: error.message,
            step,
            context,
            userSegment: this.getUserSegment(),
            deviceType: this.getDeviceType(),
            retryAttempt: this.getRetryAttempt()
        };

        this.trackPaymentFailure(event);
        
        // Update error rates
        this.updateErrorRate(method, error.code);
    }

    // Payment abandonment tracking
    trackPaymentAbandonment(step, reason, timeSpent) {
        const event = {
            step,
            reason,
            timeSpent,
            userSegment: this.getUserSegment(),
            deviceType: this.getDeviceType(),
            formCompletion: this.getFormCompletion()
        };

        this.trackPaymentAbandonment(event);
        
        // Update abandonment points
        this.updateAbandonmentPoints(step, reason);
    }

    // Method selection tracking
    trackMethodSelection(method, previousMethod, selectionTime) {
        const event = {
            method,
            previousMethod,
            selectionTime,
            userSegment: this.getUserSegment(),
            deviceType: this.getDeviceType()
        };

        this.trackMethodSelection(event);
        
        // Update method preferences
        this.updateMethodPreferences(method);
    }

    // Form interaction tracking
    trackFormInteraction(field, action, timeSpent) {
        const event = {
            field,
            action,
            timeSpent,
            formStep: this.getCurrentFormStep(),
            userSegment: this.getUserSegment()
        };

        this.trackFormInteraction(event);
    }

    // Metrics calculation
    updateConversionRate() {
        const attempts = this.getTotalPaymentAttempts();
        const successes = this.getTotalPaymentSuccesses();
        
        if (attempts > 0) {
            this.metrics.conversionRate = (successes / attempts) * 100;
        }
    }

    updateErrorRate(method, errorCode) {
        if (!this.metrics.errorRates[method]) {
            this.metrics.errorRates[method] = {};
        }
        
        if (!this.metrics.errorRates[method][errorCode]) {
            this.metrics.errorRates[method][errorCode] = 0;
        }
        
        this.metrics.errorRates[method][errorCode]++;
    }

    updateMethodPreferences(method) {
        if (!this.metrics.methodPreferences[method]) {
            this.metrics.methodPreferences[method] = 0;
        }
        
        this.metrics.methodPreferences[method]++;
    }

    updateAbandonmentPoints(step, reason) {
        this.metrics.abandonmentPoints.push({
            step,
            reason,
            timestamp: new Date().toISOString(),
            count: 1
        });
    }

    trackRevenue(amount, method) {
        this.metrics.revenue.total += amount;
        
        if (!this.metrics.revenue.byMethod[method]) {
            this.metrics.revenue.byMethod[method] = 0;
        }
        
        this.metrics.revenue.byMethod[method] += amount;
        
        // Add to trends
        this.metrics.revenue.trends.push({
            amount,
            method,
            timestamp: new Date().toISOString()
        });
    }

    // Performance monitoring
    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            this.trackPageLoadPerformance();
        });

        // Monitor payment processing performance
        this.monitorPaymentPerformance();
    }

    trackPageLoadPerformance() {
        const performance = window.performance;
        const navigation = performance.getEntriesByType('navigation')[0];
        
        const metrics = {
            pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            firstPaint: this.getFirstPaint(),
            firstContentfulPaint: this.getFirstContentfulPaint(),
            largestContentfulPaint: this.getLargestContentfulPaint()
        };

        this.sendPerformanceMetrics(metrics);
    }

    monitorPaymentPerformance() {
        // Monitor payment form performance
        const form = document.getElementById('payment-form');
        if (form) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'measure') {
                        this.trackPaymentPerformance(entry);
                    }
                }
            });
            
            observer.observe({ entryTypes: ['measure'] });
        }
    }

    trackPaymentPerformance(entry) {
        const metrics = {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: new Date().toISOString()
        };

        this.sendPerformanceMetrics(metrics);
    }

    // User behavior tracking
    setupUserBehaviorTracking() {
        // Track user interactions
        this.trackUserInteractions();
        
        // Track session behavior
        this.trackSessionBehavior();
        
        // Track device and browser info
        this.trackDeviceInfo();
    }

    trackUserInteractions() {
        // Track clicks on payment methods
        document.addEventListener('click', (e) => {
            if (e.target.closest('.payment-method')) {
                const method = e.target.closest('.payment-method').dataset.method;
                this.trackMethodSelection(method, this.getPreviousMethod(), Date.now());
            }
        });

        // Track form field interactions
        document.addEventListener('focus', (e) => {
            if (e.target.closest('#payment-form')) {
                this.trackFormInteraction(e.target.name, 'focus', 0);
            }
        });

        document.addEventListener('blur', (e) => {
            if (e.target.closest('#payment-form')) {
                const timeSpent = Date.now() - this.getFieldFocusTime(e.target.name);
                this.trackFormInteraction(e.target.name, 'blur', timeSpent);
            }
        });
    }

    trackSessionBehavior() {
        // Track session duration
        this.sessionStartTime = Date.now();
        
        // Track page views
        this.trackPageView();
        
        // Track user journey
        this.trackUserJourney();
    }

    trackDeviceInfo() {
        const deviceInfo = {
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            deviceType: this.getDeviceType(),
            browser: this.getBrowserInfo(),
            os: this.getOSInfo(),
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        this.sendDeviceInfo(deviceInfo);
    }

    // Conversion tracking
    setupConversionTracking() {
        // Track conversion funnel
        this.trackConversionFunnel();
        
        // Track conversion optimization
        this.trackConversionOptimization();
    }

    trackConversionFunnel() {
        const funnelSteps = [
            'page_view',
            'method_selection',
            'form_completion',
            'payment_attempt',
            'payment_success'
        ];

        this.conversionFunnel = {
            steps: funnelSteps,
            stepData: {},
            conversionRates: {}
        };

        // Track each step
        funnelSteps.forEach(step => {
            this.conversionFunnel.stepData[step] = {
                count: 0,
                timestamp: null
            };
        });
    }

    trackConversionOptimization() {
        // A/B testing for payment methods
        this.setupABTesting();
        
        // Track optimization metrics
        this.trackOptimizationMetrics();
    }

    setupABTesting() {
        // Randomly assign users to test groups
        const testGroup = Math.random() < 0.5 ? 'A' : 'B';
        localStorage.setItem('paymentTestGroup', testGroup);
        
        // Track test group assignment
        this.trackTestGroupAssignment(testGroup);
    }

    trackTestGroupAssignment(group) {
        const event = {
            testGroup: group,
            testName: 'payment_method_optimization',
            timestamp: new Date().toISOString()
        };

        this.sendEvent(event);
    }

    // Data sending and storage
    sendEvent(event) {
        // Send to analytics service
        this.sendToAnalyticsService(event);
        
        // Send to Google Analytics if available
        this.sendToGoogleAnalytics(event);
        
        // Send to custom analytics
        this.sendToCustomAnalytics(event);
    }

    sendToAnalyticsService(event) {
        fetch('/api/analytics/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        }).catch(error => {
            console.error('Failed to send analytics event:', error);
        });
    }

    sendToGoogleAnalytics(event) {
        if (window.gtag) {
            window.gtag('event', event.type, {
                event_category: 'payment',
                event_label: event.method || 'unknown',
                value: event.amount || 0,
                custom_parameter_1: event.userSegment,
                custom_parameter_2: event.deviceType
            });
        }
    }

    sendToCustomAnalytics(event) {
        // Send to custom analytics service
        if (window.customAnalytics) {
            window.customAnalytics.track(event);
        }
    }

    sendPerformanceMetrics(metrics) {
        fetch('/api/analytics/performance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metrics)
        }).catch(error => {
            console.error('Failed to send performance metrics:', error);
        });
    }

    sendDeviceInfo(deviceInfo) {
        fetch('/api/analytics/device', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deviceInfo)
        }).catch(error => {
            console.error('Failed to send device info:', error);
        });
    }

    storeEventLocally(event) {
        try {
            const events = JSON.parse(localStorage.getItem('paymentAnalytics') || '[]');
            events.push(event);
            
            // Keep only last 100 events
            if (events.length > 100) {
                events.splice(0, events.length - 100);
            }
            
            localStorage.setItem('paymentAnalytics', JSON.stringify(events));
        } catch (error) {
            console.error('Failed to store event locally:', error);
        }
    }

    // Utility methods
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getCurrentUserId() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.id || 'anonymous';
    }

    getDeviceType() {
        const userAgent = navigator.userAgent;
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            return 'mobile';
        } else if (/Tablet|iPad/i.test(userAgent)) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    getOSInfo() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Windows')) return 'Windows';
        if (userAgent.includes('Mac')) return 'macOS';
        if (userAgent.includes('Linux')) return 'Linux';
        if (userAgent.includes('Android')) return 'Android';
        if (userAgent.includes('iOS')) return 'iOS';
        return 'Unknown';
    }

    getLocationInfo() {
        // In a real implementation, this would use geolocation or IP-based location
        return {
            country: 'India',
            region: 'Unknown',
            city: 'Unknown'
        };
    }

    getSessionDuration() {
        return Date.now() - (this.sessionStartTime || Date.now());
    }

    getPageLoadTime() {
        const navigation = performance.getEntriesByType('navigation')[0];
        return navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
    }

    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : 0;
    }

    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return firstContentfulPaint ? firstContentfulPaint.startTime : 0;
    }

    getLargestContentfulPaint() {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0;
    }

    getConversionTime() {
        return Date.now() - (this.sessionStartTime || Date.now());
    }

    getPaymentAttempts() {
        return parseInt(localStorage.getItem('paymentAttempts') || '0');
    }

    getUserSegment() {
        // Determine user segment based on behavior
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.isNew) return 'new_user';
        if (user.totalOrders > 10) return 'loyal_customer';
        if (user.totalOrders > 0) return 'returning_customer';
        return 'anonymous';
    }

    getRetryAttempt() {
        return parseInt(localStorage.getItem('retryAttempt') || '0');
    }

    getFormCompletion() {
        const form = document.getElementById('payment-form');
        if (!form) return 0;
        
        const fields = form.querySelectorAll('input[required], select[required]');
        const filledFields = Array.from(fields).filter(field => field.value.trim() !== '');
        
        return (filledFields.length / fields.length) * 100;
    }

    getCurrentFormStep() {
        // Determine current step in payment form
        const activeStep = document.querySelector('.payment-step.active');
        return activeStep ? activeStep.dataset.step : 'unknown';
    }

    getPreviousMethod() {
        return localStorage.getItem('previousPaymentMethod') || null;
    }

    getFieldFocusTime(fieldName) {
        return this.fieldFocusTimes[fieldName] || Date.now();
    }

    getTotalPaymentAttempts() {
        return parseInt(localStorage.getItem('totalPaymentAttempts') || '0');
    }

    getTotalPaymentSuccesses() {
        return parseInt(localStorage.getItem('totalPaymentSuccesses') || '0');
    }

    // Analytics dashboard methods
    getAnalyticsDashboard() {
        return {
            metrics: this.metrics,
            conversionRate: this.metrics.conversionRate,
            averagePaymentTime: this.metrics.averagePaymentTime,
            methodPreferences: this.metrics.methodPreferences,
            errorRates: this.metrics.errorRates,
            abandonmentPoints: this.metrics.abandonmentPoints,
            revenue: this.metrics.revenue
        };
    }

    exportAnalyticsData() {
        const data = {
            metrics: this.metrics,
            events: JSON.parse(localStorage.getItem('paymentAnalytics') || '[]'),
            sessionId: this.sessionId,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment-analytics-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// Export for use in other modules
window.PaymentAnalytics = PaymentAnalytics;
