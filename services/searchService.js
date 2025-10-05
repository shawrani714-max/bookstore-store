const Book = require('../models/Book');
const { cacheService } = require('../config/redis');
const logger = require('../utils/logger');

class SearchService {
  constructor() {
    this.searchCache = new Map();
    this.searchHistory = new Map();
    this.popularSearches = new Map();
  }

  // Basic text search
  async basicSearch(query, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        category = null,
        minPrice = null,
        maxPrice = null,
        sortBy = 'relevance',
        format = null
      } = options;

      const skip = (page - 1) * limit;
      const cacheKey = `search:basic:${JSON.stringify({ query, page, limit, category, minPrice, maxPrice, sortBy, format })}`;

      // Check cache first
      const cachedResult = await cacheService.get(cacheKey);
      if (cachedResult) {
        logger.debug(`Search cache hit for: ${query}`);
        return cachedResult;
      }

      // Build search query
      const searchQuery = {
        $text: { $search: query },
        isActive: true
      };

      // Add filters
      if (category) searchQuery.category = category;
      if (minPrice || maxPrice) {
        searchQuery.price = {};
        if (minPrice) searchQuery.price.$gte = minPrice;
        if (maxPrice) searchQuery.price.$lte = maxPrice;
      }
      if (format) searchQuery.format = format;

      // Build sort object
      let sort = {};
      switch (sortBy) {
        case 'relevance':
          sort = { score: { $meta: 'textScore' } };
          break;
        case 'price_asc':
          sort = { price: 1 };
          break;
        case 'price_desc':
          sort = { price: -1 };
          break;
        case 'rating':
          sort = { averageRating: -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'popular':
          sort = { totalRatings: -1 };
          break;
        default:
          sort = { score: { $meta: 'textScore' } };
      }

      // Execute search
      const [books, totalCount] = await Promise.all([
        Book.find(searchQuery, { score: { $meta: 'textScore' } })
          .select('title author coverImage price discount averageRating stockQuantity category')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Book.countDocuments(searchQuery)
      ]);

      const result = {
        books,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        query,
        filters: { category, minPrice, maxPrice, format },
        sortBy
      };

      // Cache result for 5 minutes
      await cacheService.set(cacheKey, result, 300);

      // Track search
      this.trackSearch(query);

      return result;
    } catch (error) {
      logger.error('Basic search error:', error);
      throw new Error('Search failed');
    }
  }

  // Advanced search with multiple criteria
  async advancedSearch(criteria, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'relevance'
      } = options;

      const skip = (page - 1) * limit;
      const cacheKey = `search:advanced:${JSON.stringify({ criteria, page, limit, sortBy })}`;

      // Check cache first
      const cachedResult = await cacheService.get(cacheKey);
      if (cachedResult) {
        logger.debug(`Advanced search cache hit`);
        return cachedResult;
      }

      // Build complex query
      const query = { isActive: true };
      const $and = [];

      // Text search
      if (criteria.query) {
        $and.push({ $text: { $search: criteria.query } });
      }

      // Category filter
      if (criteria.categories && criteria.categories.length > 0) {
        $and.push({ category: { $in: criteria.categories } });
      }

      // Price range
      if (criteria.minPrice || criteria.maxPrice) {
        const priceQuery = {};
        if (criteria.minPrice) priceQuery.$gte = criteria.minPrice;
        if (criteria.maxPrice) priceQuery.$lte = criteria.maxPrice;
        $and.push({ price: priceQuery });
      }

      // Rating filter
      if (criteria.minRating) {
        $and.push({ averageRating: { $gte: criteria.minRating } });
      }

      // Format filter
      if (criteria.formats && criteria.formats.length > 0) {
        $and.push({ format: { $in: criteria.formats } });
      }

      // Language filter
      if (criteria.languages && criteria.languages.length > 0) {
        $and.push({ language: { $in: criteria.languages } });
      }

      // Age group filter
      if (criteria.ageGroups && criteria.ageGroups.length > 0) {
        $and.push({ ageGroup: { $in: criteria.ageGroups } });
      }

      // Availability filter
      if (criteria.inStockOnly) {
        $and.push({ stockQuantity: { $gt: 0 } });
      }

      // Featured books only
      if (criteria.featuredOnly) {
        $and.push({ isFeatured: true });
      }

      // New releases only
      if (criteria.newReleasesOnly) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        $and.push({ 
          isNewRelease: true,
          createdAt: { $gte: thirtyDaysAgo }
        });
      }

      // Best sellers only
      if (criteria.bestSellersOnly) {
        $and.push({ isBestSeller: true });
      }

      // Publication date range
      if (criteria.publishedAfter || criteria.publishedBefore) {
        const dateQuery = {};
        if (criteria.publishedAfter) dateQuery.$gte = new Date(criteria.publishedAfter);
        if (criteria.publishedBefore) dateQuery.$lte = new Date(criteria.publishedBefore);
        $and.push({ publishDate: dateQuery });
      }

      // Combine conditions
      if ($and.length > 0) {
        query.$and = $and;
      }

      // Build sort object
      let sort = {};
      switch (sortBy) {
        case 'relevance':
          if (criteria.query) {
            sort = { score: { $meta: 'textScore' } };
          } else {
            sort = { createdAt: -1 };
          }
          break;
        case 'price_asc':
          sort = { price: 1 };
          break;
        case 'price_desc':
          sort = { price: -1 };
          break;
        case 'rating':
          sort = { averageRating: -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'popular':
          sort = { totalRatings: -1 };
          break;
        case 'title':
          sort = { title: 1 };
          break;
        case 'author':
          sort = { author: 1 };
          break;
        default:
          sort = { createdAt: -1 };
      }

      // Execute search
      const [books, totalCount] = await Promise.all([
        Book.find(query, criteria.query ? { score: { $meta: 'textScore' } } : {})
          .select('title author coverImage price discount averageRating stockQuantity category format language')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Book.countDocuments(query)
      ]);

      const result = {
        books,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        criteria,
        sortBy
      };

      // Cache result for 5 minutes
      await cacheService.set(cacheKey, result, 300);

      // Track search
      if (criteria.query) {
        this.trackSearch(criteria.query);
      }

      return result;
    } catch (error) {
      logger.error('Advanced search error:', error);
      throw new Error('Advanced search failed');
    }
  }

  // Search suggestions/autocomplete
  async getSearchSuggestions(query, limit = 10) {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const cacheKey = `search:suggestions:${query}`;
      const cachedResult = await cacheService.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Search in titles and authors
      const suggestions = await Book.aggregate([
        {
          $match: {
            isActive: true,
            $or: [
              { title: { $regex: query, $options: 'i' } },
              { author: { $regex: query, $options: 'i' } }
            ]
          }
        },
        {
          $project: {
            title: 1,
            author: 1,
            category: 1,
            score: {
              $cond: {
                if: { $regexMatch: { input: '$title', regex: query, options: 'i' } },
                then: 2,
                else: 1
              }
            }
          }
        },
        {
          $sort: { score: -1, title: 1 }
        },
        {
          $limit: limit
        }
      ]);

      // Cache suggestions for 1 hour
      await cacheService.set(cacheKey, suggestions, 3600);

      return suggestions;
    } catch (error) {
      logger.error('Search suggestions error:', error);
      return [];
    }
  }

  // Search filters and facets
  async getSearchFilters(query = null) {
    try {
      const cacheKey = `search:filters:${query || 'all'}`;
      const cachedResult = await cacheService.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      const baseQuery = { isActive: true };
      if (query) {
        baseQuery.$text = { $search: query };
      }

      const [
        categories,
        formats,
        languages,
        ageGroups,
        priceRange,
        ratingStats
      ] = await Promise.all([
        // Categories
        Book.aggregate([
          { $match: baseQuery },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),

        // Formats
        Book.aggregate([
          { $match: baseQuery },
          { $group: { _id: '$format', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),

        // Languages
        Book.aggregate([
          { $match: baseQuery },
          { $group: { _id: '$language', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),

        // Age groups
        Book.aggregate([
          { $match: baseQuery },
          { $group: { _id: '$ageGroup', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),

        // Price range
        Book.aggregate([
          { $match: baseQuery },
          {
            $group: {
              _id: null,
              minPrice: { $min: '$price' },
              maxPrice: { $max: '$price' },
              avgPrice: { $avg: '$price' }
            }
          }
        ]),

        // Rating statistics
        Book.aggregate([
          { $match: baseQuery },
          {
            $group: {
              _id: null,
              avgRating: { $avg: '$averageRating' },
              minRating: { $min: '$averageRating' },
              maxRating: { $max: '$averageRating' }
            }
          }
        ])
      ]);

      const filters = {
        categories: categories.map(cat => ({ name: cat._id, count: cat.count })),
        formats: formats.map(format => ({ name: format._id, count: format.count })),
        languages: languages.map(lang => ({ name: lang._id, count: lang.count })),
        ageGroups: ageGroups.map(age => ({ name: age._id, count: age.count })),
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 },
        ratingStats: ratingStats[0] || { avgRating: 0, minRating: 0, maxRating: 0 }
      };

      // Cache filters for 1 hour
      await cacheService.set(cacheKey, filters, 3600);

      return filters;
    } catch (error) {
      logger.error('Search filters error:', error);
      return {
        categories: [],
        formats: [],
        languages: [],
        ageGroups: [],
        priceRange: { minPrice: 0, maxPrice: 0, avgPrice: 0 },
        ratingStats: { avgRating: 0, minRating: 0, maxRating: 0 }
      };
    }
  }

  // Track search queries
  trackSearch(query) {
    if (!query || query.length < 2) return;

    const normalizedQuery = query.toLowerCase().trim();
    const count = this.searchHistory.get(normalizedQuery) || 0;
    this.searchHistory.set(normalizedQuery, count + 1);

    // Update popular searches
    if (count > 0) {
      this.popularSearches.set(normalizedQuery, count + 1);
    }
  }

  // Get popular searches
  getPopularSearches(limit = 10) {
    return Array.from(this.popularSearches.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }

  // Get search history for a user
  getUserSearchHistory(userId, limit = 20) {
    // This would typically be stored in a database
    // For now, return empty array
    return [];
  }

  // Save search history for a user
  saveUserSearchHistory(userId, query) {
    // This would typically be stored in a database
    // For now, just track globally
    this.trackSearch(query);
  }

  // Clear search cache
  async clearSearchCache() {
    try {
      await cacheService.delPattern('search:*');
      logger.info('Search cache cleared');
    } catch (error) {
      logger.error('Error clearing search cache:', error);
    }
  }

  // Search analytics
  async getSearchAnalytics(days = 30) {
    try {
      // This would typically be stored in a database
      // For now, return mock data
      return {
        totalSearches: this.searchHistory.size,
        popularSearches: this.getPopularSearches(10),
        searchTrends: [],
        noResultsQueries: []
      };
    } catch (error) {
      logger.error('Search analytics error:', error);
      return {
        totalSearches: 0,
        popularSearches: [],
        searchTrends: [],
        noResultsQueries: []
      };
    }
  }
}

// Create singleton instance
const searchService = new SearchService();

module.exports = {
  SearchService,
  searchService
};
