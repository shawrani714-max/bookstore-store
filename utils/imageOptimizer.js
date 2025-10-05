const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { uploadImage } = require('../config/cloudinary');

class ImageOptimizer {
  constructor() {
    this.supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
    this.maxWidth = 1200;
    this.maxHeight = 1200;
    this.quality = 85;
    this.thumbnailSize = 300;
  }

  // Validate image file
  validateImage(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (!this.supportedFormats.includes(ext)) {
      throw new Error(`Unsupported image format: ${ext}`);
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Image size too large. Maximum size is 10MB');
    }

    return true;
  }

  // Optimize image with Sharp
  async optimizeImage(inputBuffer, options = {}) {
    try {
      const {
        width = this.maxWidth,
        height = this.maxHeight,
        quality = this.quality,
        format = 'jpeg',
        fit = 'inside'
      } = options;

      let sharpInstance = sharp(inputBuffer);

      // Get image metadata
      const metadata = await sharpInstance.metadata();
      
      // Resize if needed
      if (metadata.width > width || metadata.height > height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit,
          withoutEnlargement: true
        });
      }

      // Convert format and optimize
      switch (format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({
            quality,
            progressive: true,
            mozjpeg: true
          });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({
            quality,
            progressive: true,
            compressionLevel: 9
          });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({
            quality,
            effort: 6
          });
          break;
        case 'gif':
          sharpInstance = sharpInstance.gif();
          break;
        default:
          sharpInstance = sharpInstance.jpeg({
            quality,
            progressive: true
          });
      }

      return await sharpInstance.toBuffer();
    } catch (error) {
      throw new Error(`Image optimization failed: ${error.message}`);
    }
  }

  // Generate thumbnail
  async generateThumbnail(inputBuffer, size = this.thumbnailSize) {
    try {
      return await sharp(inputBuffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({
          quality: 80,
          progressive: true
        })
        .toBuffer();
    } catch (error) {
      throw new Error(`Thumbnail generation failed: ${error.message}`);
    }
  }

  // Generate multiple sizes
  async generateMultipleSizes(inputBuffer) {
    try {
      const sizes = [
        { name: 'thumbnail', width: 150, height: 150 },
        { name: 'small', width: 300, height: 300 },
        { name: 'medium', width: 600, height: 600 },
        { name: 'large', width: 1200, height: 1200 }
      ];

      const results = {};

      for (const size of sizes) {
        results[size.name] = await this.optimizeImage(inputBuffer, {
          width: size.width,
          height: size.height,
          quality: size.name === 'thumbnail' ? 70 : this.quality
        });
      }

      return results;
    } catch (error) {
      throw new Error(`Multiple sizes generation failed: ${error.message}`);
    }
  }

  // Process and upload image to Cloudinary
  async processAndUpload(file, folder = 'bookworld-india', options = {}) {
    try {
      this.validateImage(file);

      // Optimize main image
      const optimizedBuffer = await this.optimizeImage(file.buffer, options);
      
      // Generate thumbnail
      const thumbnailBuffer = await this.generateThumbnail(file.buffer);

      // Upload main image
      const mainImageResult = await this.uploadToCloudinary(optimizedBuffer, folder, 'main');
      
      // Upload thumbnail
      const thumbnailResult = await this.uploadToCloudinary(thumbnailBuffer, folder, 'thumb');

      return {
        success: true,
        main: mainImageResult,
        thumbnail: thumbnailResult,
        originalSize: file.size,
        optimizedSize: optimizedBuffer.length,
        compressionRatio: ((file.size - optimizedBuffer.length) / file.size * 100).toFixed(2)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload buffer to Cloudinary
  async uploadToCloudinary(buffer, folder, type) {
    try {
      // Convert buffer to base64 data URL
      const base64 = buffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      const result = await uploadImage(dataUrl, `${folder}/${type}`);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  // Process book cover image
  async processBookCover(file) {
    try {
      this.validateImage(file);

      // Book cover specific optimization
      const optimizedBuffer = await this.optimizeImage(file.buffer, {
        width: 400,
        height: 600,
        quality: 90,
        fit: 'cover'
      });

      // Generate thumbnail for book cards
      const thumbnailBuffer = await this.generateThumbnail(file.buffer, 200);

      // Upload to Cloudinary
      const mainResult = await this.uploadToCloudinary(optimizedBuffer, 'bookworld-india/books', 'cover');
      const thumbResult = await this.uploadToCloudinary(thumbnailBuffer, 'bookworld-india/books', 'thumb');

      return {
        success: true,
        coverImage: mainResult.url,
        thumbnailImage: thumbResult.url,
        originalSize: file.size,
        optimizedSize: optimizedBuffer.length,
        compressionRatio: ((file.size - optimizedBuffer.length) / file.size * 100).toFixed(2)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process user avatar
  async processUserAvatar(file) {
    try {
      this.validateImage(file);

      // Avatar specific optimization (square)
      const optimizedBuffer = await this.optimizeImage(file.buffer, {
        width: 300,
        height: 300,
        quality: 85,
        fit: 'cover'
      });

      // Upload to Cloudinary
      const result = await this.uploadToCloudinary(optimizedBuffer, 'bookworld-india/avatars', 'avatar');

      return {
        success: true,
        avatarUrl: result.url,
        originalSize: file.size,
        optimizedSize: optimizedBuffer.length,
        compressionRatio: ((file.size - optimizedBuffer.length) / file.size * 100).toFixed(2)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process banner image
  async processBanner(file) {
    try {
      this.validateImage(file);

      // Banner specific optimization
      const optimizedBuffer = await this.optimizeImage(file.buffer, {
        width: 1200,
        height: 400,
        quality: 85,
        fit: 'cover'
      });

      // Upload to Cloudinary
      const result = await this.uploadToCloudinary(optimizedBuffer, 'bookworld-india/banners', 'banner');

      return {
        success: true,
        bannerUrl: result.url,
        originalSize: file.size,
        optimizedSize: optimizedBuffer.length,
        compressionRatio: ((file.size - optimizedBuffer.length) / file.size * 100).toFixed(2)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get image info
  async getImageInfo(buffer) {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: buffer.length,
        hasAlpha: metadata.hasAlpha,
        channels: metadata.channels
      };
    } catch (error) {
      throw new Error(`Failed to get image info: ${error.message}`);
    }
  }

  // Convert image format
  async convertFormat(inputBuffer, targetFormat, quality = 85) {
    try {
      let sharpInstance = sharp(inputBuffer);

      switch (targetFormat.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality, progressive: true });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality, effort: 6 });
          break;
        default:
          throw new Error(`Unsupported target format: ${targetFormat}`);
      }

      return await sharpInstance.toBuffer();
    } catch (error) {
      throw new Error(`Format conversion failed: ${error.message}`);
    }
  }

  // Batch process images
  async batchProcess(files, options = {}) {
    try {
      const results = [];
      
      for (const file of files) {
        const result = await this.processAndUpload(file, options.folder, options);
        results.push({
          filename: file.originalname,
          ...result
        });
      }

      return {
        success: true,
        results,
        totalFiles: files.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const imageOptimizer = new ImageOptimizer();

module.exports = {
  ImageOptimizer,
  imageOptimizer
};
