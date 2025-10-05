#!/usr/bin/env node

const { cdnService } = require('../services/cdnService');
const path = require('path');
const fs = require('fs');

console.log('🚀 Setting up CDN for Bookworld India...\n');

async function setupCDN() {
  try {
    // Check CDN health
    console.log('📡 Checking CDN health...');
    const health = await cdnService.healthCheck();
    
    if (!health.healthy) {
      console.error('❌ CDN is not healthy:', health.error);
      console.log('\n💡 Please check your AWS credentials and configuration.');
      console.log('   Make sure the following environment variables are set:');
      console.log('   - AWS_ACCESS_KEY_ID');
      console.log('   - AWS_SECRET_ACCESS_KEY');
      console.log('   - AWS_S3_BUCKET');
      console.log('   - AWS_REGION');
      process.exit(1);
    }
    
    console.log('✅ CDN is healthy');
    console.log(`   Bucket: ${health.bucket}`);
    console.log(`   CloudFront: ${health.cloudFront ? 'Enabled' : 'Disabled'}`);
    
    // Upload static assets
    console.log('\n📦 Uploading static assets...');
    const uploadResult = await cdnService.uploadStaticAssets();
    
    if (uploadResult.success) {
      console.log(`✅ Uploaded ${uploadResult.count} static assets`);
      console.log('   Assets uploaded:');
      uploadResult.assets.forEach(asset => {
        console.log(`   - ${asset.key} → ${asset.url}`);
      });
    } else {
      console.error('❌ Failed to upload static assets:', uploadResult.error);
    }
    
    // Create CDN configuration file
    console.log('\n📝 Creating CDN configuration...');
    const cdnConfig = {
      enabled: true,
      baseUrl: cdnService.cloudFrontDomain || `https://${cdnService.bucketName}.s3.amazonaws.com`,
      bucket: cdnService.bucketName,
      region: process.env.AWS_REGION || 'us-east-1',
      cloudFront: {
        enabled: !!cdnService.cloudFrontDomain,
        domain: cdnService.cloudFrontDomain,
        distributionId: cdnService.cloudFrontDistributionId
      },
      uploads: {
        maxSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
          'application/pdf',
          'text/plain',
          'application/json'
        ]
      },
      cache: {
        defaultTTL: 31536000, // 1 year
        invalidationPaths: ['/*']
      }
    };
    
    const configPath = path.join(__dirname, '../config/cdn.json');
    fs.writeFileSync(configPath, JSON.stringify(cdnConfig, null, 2));
    console.log(`✅ CDN configuration saved to ${configPath}`);
    
    // Test CDN functionality
    console.log('\n🧪 Testing CDN functionality...');
    
    // Test file upload
    const testBuffer = Buffer.from('Hello, CDN!', 'utf8');
    const testKey = `test/test-${Date.now()}.txt`;
    
    const uploadTest = await cdnService.uploadBuffer(
      testBuffer,
      testKey,
      'text/plain',
      {
        metadata: {
          test: 'true',
          uploadedAt: new Date().toISOString()
        }
      }
    );
    
    if (uploadTest.success) {
      console.log('✅ Test upload successful');
      console.log(`   URL: ${uploadTest.url}`);
      
      // Test file deletion
      const deleteTest = await cdnService.deleteFile(testKey);
      if (deleteTest.success) {
        console.log('✅ Test deletion successful');
      } else {
        console.log('⚠️  Test deletion failed:', deleteTest.error);
      }
    } else {
      console.log('❌ Test upload failed:', uploadTest.error);
    }
    
    // Test cache invalidation (if CloudFront is configured)
    if (cdnService.cloudFrontDistributionId) {
      console.log('\n🔄 Testing cache invalidation...');
      const invalidationTest = await cdnService.invalidateCache(['/test/*']);
      
      if (invalidationTest.success) {
        console.log('✅ Cache invalidation successful');
        console.log(`   Invalidation ID: ${invalidationTest.invalidationId}`);
      } else {
        console.log('⚠️  Cache invalidation failed:', invalidationTest.error);
      }
    }
    
    console.log('\n🎉 CDN setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your frontend to use CDN URLs');
    console.log('2. Configure CloudFront distribution (if not already done)');
    console.log('3. Set up monitoring and alerts');
    console.log('4. Test CDN performance in production');
    
  } catch (error) {
    console.error('❌ CDN setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupCDN();
