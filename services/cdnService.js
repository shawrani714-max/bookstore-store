const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

class CDNService {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    this.cloudFrontClient = new CloudFrontClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    this.bucketName = process.env.AWS_S3_BUCKET;
    this.cloudFrontDistributionId = process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID;
    this.cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;
    
    this.isConfigured = !!(this.bucketName && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  }

  // Upload file to S3
  async uploadFile(file, key, options = {}) {
    try {
      if (!this.isConfigured) {
        logger.warn('CDN not configured, skipping upload');
        return { success: false, error: 'CDN not configured' };
      }

      const {
        contentType = 'application/octet-stream',
        metadata = {},
        cacheControl = 'public, max-age=31536000' // 1 year
      } = options;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: metadata,
        CacheControl: cacheControl,
        ACL: 'public-read'
      });

      await this.s3Client.send(command);
      
      const url = this.getCDNUrl(key);
      logger.info(`File uploaded to CDN: ${key}`);
      
      return {
        success: true,
        url: url,
        key: key,
        bucket: this.bucketName
      };
    } catch (error) {
      logger.error('CDN upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload file from buffer
  async uploadBuffer(buffer, key, contentType, options = {}) {
    try {
      if (!this.isConfigured) {
        logger.warn('CDN not configured, skipping upload');
        return { success: false, error: 'CDN not configured' };
      }

      const {
        metadata = {},
        cacheControl = 'public, max-age=31536000'
      } = options;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata,
        CacheControl: cacheControl,
        ACL: 'public-read'
      });

      await this.s3Client.send(command);
      
      const url = this.getCDNUrl(key);
      logger.info(`Buffer uploaded to CDN: ${key}`);
      
      return {
        success: true,
        url: url,
        key: key,
        bucket: this.bucketName
      };
    } catch (error) {
      logger.error('CDN buffer upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload file from local path
  async uploadFromPath(filePath, key, options = {}) {
    try {
      if (!this.isConfigured) {
        logger.warn('CDN not configured, skipping upload');
        return { success: false, error: 'CDN not configured' };
      }

      const fileStream = fs.createReadStream(filePath);
      const contentType = this.getContentType(filePath);
      
      return await this.uploadFile(fileStream, key, { ...options, contentType });
    } catch (error) {
      logger.error('CDN file upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete file from S3
  async deleteFile(key) {
    try {
      if (!this.isConfigured) {
        logger.warn('CDN not configured, skipping delete');
        return { success: false, error: 'CDN not configured' };
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      await this.s3Client.send(command);
      logger.info(`File deleted from CDN: ${key}`);
      
      return { success: true };
    } catch (error) {
      logger.error('CDN delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get signed URL for private files
  async getSignedUrl(key, expiresIn = 3600) {
    try {
      if (!this.isConfigured) {
        return { success: false, error: 'CDN not configured' };
      }

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      
      return {
        success: true,
        url: signedUrl,
        expiresIn: expiresIn
      };
    } catch (error) {
      logger.error('CDN signed URL error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // List files in bucket
  async listFiles(prefix = '', maxKeys = 1000) {
    try {
      if (!this.isConfigured) {
        return { success: false, error: 'CDN not configured' };
      }

      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys
      });

      const response = await this.s3Client.send(command);
      
      const files = response.Contents?.map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
        url: this.getCDNUrl(obj.Key)
      })) || [];

      return {
        success: true,
        files: files,
        count: files.length,
        isTruncated: response.IsTruncated
      };
    } catch (error) {
      logger.error('CDN list files error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Invalidate CloudFront cache
  async invalidateCache(paths = ['/*']) {
    try {
      if (!this.isConfigured || !this.cloudFrontDistributionId) {
        logger.warn('CloudFront not configured, skipping invalidation');
        return { success: false, error: 'CloudFront not configured' };
      }

      const command = new CreateInvalidationCommand({
        DistributionId: this.cloudFrontDistributionId,
        InvalidationBatch: {
          Paths: {
            Quantity: paths.length,
            Items: paths
          },
          CallerReference: `invalidation-${Date.now()}`
        }
      });

      const response = await this.cloudFrontClient.send(command);
      logger.info(`CloudFront cache invalidated: ${paths.join(', ')}`);
      
      return {
        success: true,
        invalidationId: response.Invalidation.Id,
        status: response.Invalidation.Status
      };
    } catch (error) {
      logger.error('CloudFront invalidation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get CDN URL for a key
  getCDNUrl(key) {
    if (this.cloudFrontDomain) {
      return `https://${this.cloudFrontDomain}/${key}`;
    }
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }

  // Get content type from file path
  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.ico': 'image/x-icon',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.xml': 'application/xml',
      '.zip': 'application/zip'
    };
    
    return contentTypes[ext] || 'application/octet-stream';
  }

  // Upload static assets
  async uploadStaticAssets() {
    try {
      const staticDir = path.join(__dirname, '../public');
      const assets = [];

      // Upload CSS files
      const cssFiles = this.getFilesByExtension(staticDir, '.css');
      for (const file of cssFiles) {
        const key = `assets/css/${path.basename(file)}`;
        const result = await this.uploadFromPath(file, key, {
          cacheControl: 'public, max-age=31536000' // 1 year
        });
        if (result.success) assets.push(result);
      }

      // Upload JS files
      const jsFiles = this.getFilesByExtension(staticDir, '.js');
      for (const file of jsFiles) {
        const key = `assets/js/${path.basename(file)}`;
        const result = await this.uploadFromPath(file, key, {
          cacheControl: 'public, max-age=31536000' // 1 year
        });
        if (result.success) assets.push(result);
      }

      // Upload images
      const imageFiles = this.getFilesByExtension(staticDir, ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']);
      for (const file of imageFiles) {
        const key = `assets/images/${path.basename(file)}`;
        const result = await this.uploadFromPath(file, key, {
          cacheControl: 'public, max-age=31536000' // 1 year
        });
        if (result.success) assets.push(result);
      }

      logger.info(`Uploaded ${assets.length} static assets to CDN`);
      return {
        success: true,
        assets: assets,
        count: assets.length
      };
    } catch (error) {
      logger.error('Static assets upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get files by extension
  getFilesByExtension(dir, extensions) {
    const files = [];
    const extArray = Array.isArray(extensions) ? extensions : [extensions];
    
    const scanDir = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          if (extArray.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };
    
    scanDir(dir);
    return files;
  }

  // Health check
  async healthCheck() {
    try {
      if (!this.isConfigured) {
        return {
          healthy: false,
          error: 'CDN not configured'
        };
      }

      // Try to list objects to test connection
      const result = await this.listFiles('', 1);
      
      return {
        healthy: result.success,
        bucket: this.bucketName,
        cloudFront: !!this.cloudFrontDomain,
        error: result.success ? null : result.error
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const cdnService = new CDNService();

module.exports = {
  CDNService,
  cdnService
};
