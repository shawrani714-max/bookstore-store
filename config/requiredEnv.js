// Minimal environment validation to avoid booting with missing secrets
const REQUIRED_VARS = [
  'JWT_SECRET',
  'MONGO_URI',
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key] || process.env[key].trim() === '');
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    throw new Error('Environment validation failed. Set required variables.');
  }
}

module.exports = { validateEnv };


