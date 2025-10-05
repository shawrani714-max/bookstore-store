const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const { AnalyticsAdminServiceClient } = require('@google-analytics/admin');
const { cacheService } = require('../config/redis');
const logger = require('../utils/logger');

class AnalyticsService {
  constructor() {
    this.analyticsDataClient = null;
    this.analyticsAdminClient = null;
    this.propertyId = process.env.GA_PROPERTY_ID;
    this.credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    this.initializeClients();
  }

  initializeClients() {
    try {
      if (this.credentials && this.propertyId) {
        this.analyticsDataClient = new BetaAnalyticsDataClient({
          keyFilename: this.credentials
        });
        
        this.analyticsAdminClient = new AnalyticsAdminServiceClient({
          keyFilename: this.credentials
        });
        
        logger.info('Google Analytics clients initialized');
      } else {
        logger.warn('Google Analytics not configured - running in mock mode');
      }
    } catch (error) {
      logger.error('Failed to initialize Google Analytics clients:', error);
    }
  }

  // Track page view
  async trackPageView(page, title, userId = null) {
    try {
      if (!this.analyticsDataClient) {
        return this.mockTrackPageView(page, title, userId);
      }

      const request = {
        property: `properties/${this.propertyId}`,
        requests: [
          {
            events: [
              {
                name: 'page_view',
                parameters: {
                  page_location: page,
                  page_title: title,
                  user_id: userId || 'anonymous'
                }
              }
            ]
          }
        ]
      };

      await this.analyticsDataClient.runReport(request);
      logger.debug(`Page view tracked: ${page}`);
    } catch (error) {
      logger.error('Failed to track page view:', error);
    }
  }

  // Track custom event
  async trackEvent(eventName, parameters = {}, userId = null) {
    try {
      if (!this.analyticsDataClient) {
        return this.mockTrackEvent(eventName, parameters, userId);
      }

      const request = {
        property: `properties/${this.propertyId}`,
        requests: [
          {
            events: [
              {
                name: eventName,
                parameters: {
                  ...parameters,
                  user_id: userId || 'anonymous'
                }
              }
            ]
          }
        ]
      };

      await this.analyticsDataClient.runReport(request);
      logger.debug(`Event tracked: ${eventName}`);
    } catch (error) {
      logger.error('Failed to track event:', error);
    }
  }

  // Track e-commerce events
  async trackPurchase(orderData, userId = null) {
    try {
      const parameters = {
        transaction_id: orderData.orderNumber,
        value: orderData.total,
        currency: 'INR',
        items: orderData.items.map(item => ({
          item_id: item.book,
          item_name: item.title,
          item_category: 'Books',
          quantity: item.quantity,
          price: item.price
        }))
      };

      await this.trackEvent('purchase', parameters, userId);
    } catch (error) {
      logger.error('Failed to track purchase:', error);
    }
  }

  // Track add to cart
  async trackAddToCart(bookData, userId = null) {
    try {
      const parameters = {
        item_id: bookData._id,
        item_name: bookData.title,
        item_category: 'Books',
        value: bookData.price,
        currency: 'INR'
      };

      await this.trackEvent('add_to_cart', parameters, userId);
    } catch (error) {
      logger.error('Failed to track add to cart:', error);
    }
  }

  // Track search
  async trackSearch(query, resultsCount, userId = null) {
    try {
      const parameters = {
        search_term: query,
        results_count: resultsCount
      };

      await this.trackEvent('search', parameters, userId);
    } catch (error) {
      logger.error('Failed to track search:', error);
    }
  }

  // Get analytics data
  async getAnalyticsData(startDate, endDate, metrics = ['sessions', 'users', 'pageviews']) {
    try {
      if (!this.analyticsDataClient) {
        return this.mockGetAnalyticsData(startDate, endDate, metrics);
      }

      const request = {
        property: `properties/${this.propertyId}`,
        dateRanges: [
          {
            startDate: startDate,
            endDate: endDate
          }
        ],
        metrics: metrics.map(metric => ({ name: metric })),
        dimensions: [{ name: 'date' }]
      };

      const [response] = await this.analyticsDataClient.runReport(request);
      return this.formatAnalyticsResponse(response);
    } catch (error) {
      logger.error('Failed to get analytics data:', error);
      return this.mockGetAnalyticsData(startDate, endDate, metrics);
    }
  }

  // Get e-commerce analytics
  async getEcommerceAnalytics(startDate, endDate) {
    try {
      if (!this.analyticsDataClient) {
        return this.mockGetEcommerceAnalytics(startDate, endDate);
      }

      const request = {
        property: `properties/${this.propertyId}`,
        dateRanges: [
          {
            startDate: startDate,
            endDate: endDate
          }
        ],
        metrics: [
          { name: 'totalRevenue' },
          { name: 'transactions' },
          { name: 'averageOrderValue' },
          { name: 'purchaseRevenue' }
        ],
        dimensions: [{ name: 'date' }]
      };

      const [response] = await this.analyticsDataClient.runReport(request);
      return this.formatAnalyticsResponse(response);
    } catch (error) {
      logger.error('Failed to get e-commerce analytics:', error);
      return this.mockGetEcommerceAnalytics(startDate, endDate);
    }
  }

  // Get top pages
  async getTopPages(startDate, endDate, limit = 10) {
    try {
      if (!this.analyticsDataClient) {
        return this.mockGetTopPages(startDate, endDate, limit);
      }

      const request = {
        property: `properties/${this.propertyId}`,
        dateRanges: [
          {
            startDate: startDate,
            endDate: endDate
          }
        ],
        metrics: [{ name: 'pageviews' }],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        orderBys: [{ metric: { metricName: 'pageviews' }, desc: true }],
        limit: limit
      };

      const [response] = await this.analyticsDataClient.runReport(request);
      return this.formatAnalyticsResponse(response);
    } catch (error) {
      logger.error('Failed to get top pages:', error);
      return this.mockGetTopPages(startDate, endDate, limit);
    }
  }

  // Get user demographics
  async getUserDemographics(startDate, endDate) {
    try {
      if (!this.analyticsDataClient) {
        return this.mockGetUserDemographics(startDate, endDate);
      }

      const request = {
        property: `properties/${this.propertyId}`,
        dateRanges: [
          {
            startDate: startDate,
            endDate: endDate
          }
        ],
        metrics: [{ name: 'users' }],
        dimensions: [
          { name: 'country' },
          { name: 'city' },
          { name: 'deviceCategory' },
          { name: 'operatingSystem' }
        ]
      };

      const [response] = await this.analyticsDataClient.runReport(request);
      return this.formatAnalyticsResponse(response);
    } catch (error) {
      logger.error('Failed to get user demographics:', error);
      return this.mockGetUserDemographics(startDate, endDate);
    }
  }

  // Format analytics response
  formatAnalyticsResponse(response) {
    const formattedData = {
      rows: [],
      totals: {}
    };

    if (response.rows) {
      formattedData.rows = response.rows.map(row => {
        const formattedRow = {};
        
        if (row.dimensionValues) {
          row.dimensionValues.forEach((value, index) => {
            const dimensionName = response.dimensionHeaders[index].name;
            formattedRow[dimensionName] = value.value;
          });
        }
        
        if (row.metricValues) {
          row.metricValues.forEach((value, index) => {
            const metricName = response.metricHeaders[index].name;
            formattedRow[metricName] = parseFloat(value.value) || 0;
          });
        }
        
        return formattedRow;
      });
    }

    if (response.totals) {
      response.totals.forEach(total => {
        total.metricValues.forEach((value, index) => {
          const metricName = response.metricHeaders[index].name;
          formattedData.totals[metricName] = parseFloat(value.value) || 0;
        });
      });
    }

    return formattedData;
  }

  // Mock methods for when GA is not configured
  mockTrackPageView(page, title, userId) {
    logger.debug(`Mock: Page view tracked - ${page} (${title})`);
  }

  mockTrackEvent(eventName, parameters, userId) {
    logger.debug(`Mock: Event tracked - ${eventName}`, parameters);
  }

  mockGetAnalyticsData(startDate, endDate, metrics) {
    return {
      rows: [],
      totals: metrics.reduce((acc, metric) => {
        acc[metric] = Math.floor(Math.random() * 1000);
        return acc;
      }, {})
    };
  }

  mockGetEcommerceAnalytics(startDate, endDate) {
    return {
      rows: [],
      totals: {
        totalRevenue: Math.floor(Math.random() * 100000),
        transactions: Math.floor(Math.random() * 100),
        averageOrderValue: Math.floor(Math.random() * 1000),
        purchaseRevenue: Math.floor(Math.random() * 100000)
      }
    };
  }

  mockGetTopPages(startDate, endDate, limit) {
    const mockPages = [
      { pagePath: '/', pageTitle: 'Home', pageviews: Math.floor(Math.random() * 1000) },
      { pagePath: '/shop', pageTitle: 'Shop', pageviews: Math.floor(Math.random() * 800) },
      { pagePath: '/about', pageTitle: 'About', pageviews: Math.floor(Math.random() * 600) },
      { pagePath: '/contact', pageTitle: 'Contact', pageviews: Math.floor(Math.random() * 400) }
    ];

    return {
      rows: mockPages.slice(0, limit),
      totals: { pageviews: mockPages.reduce((sum, page) => sum + page.pageviews, 0) }
    };
  }

  mockGetUserDemographics(startDate, endDate) {
    return {
      rows: [
        { country: 'India', city: 'Mumbai', deviceCategory: 'desktop', operatingSystem: 'Windows', users: Math.floor(Math.random() * 500) },
        { country: 'India', city: 'Delhi', deviceCategory: 'mobile', operatingSystem: 'Android', users: Math.floor(Math.random() * 400) },
        { country: 'India', city: 'Bangalore', deviceCategory: 'tablet', operatingSystem: 'iOS', users: Math.floor(Math.random() * 300) }
      ],
      totals: { users: Math.floor(Math.random() * 1200) }
    };
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

module.exports = {
  AnalyticsService,
  analyticsService
};
