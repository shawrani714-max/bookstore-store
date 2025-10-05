#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Generating secure secrets for your application...\n');

// Generate JWT Secret (64 bytes = 512 bits)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET=' + jwtSecret);

// Generate Session Secret (32 bytes = 256 bits)
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('SESSION_SECRET=' + sessionSecret);

// Generate API Key (32 bytes)
const apiKey = crypto.randomBytes(32).toString('hex');
console.log('API_KEY=' + apiKey);

// Generate Encryption Key (32 bytes for AES-256)
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('ENCRYPTION_KEY=' + encryptionKey);

// Generate CSRF Secret (32 bytes)
const csrfSecret = crypto.randomBytes(32).toString('hex');
console.log('CSRF_SECRET=' + csrfSecret);

console.log('\n✅ All secrets generated successfully!');
console.log('\n📝 Instructions:');
console.log('1. Copy these values to your .env file');
console.log('2. Never commit these secrets to version control');
console.log('3. Use different secrets for each environment (dev, test, prod)');
console.log('4. Store production secrets securely (e.g., AWS Secrets Manager, Azure Key Vault)');
console.log('\n⚠️  Security Tips:');
console.log('- Use at least 32 characters for secrets');
console.log('- Use different secrets for each environment');
console.log('- Rotate secrets regularly');
console.log('- Never share secrets in plain text');
