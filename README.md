Environment setup
1) Copy config.env to .env and remove secrets from version control.
2) Required variables:
   - MONGO_URI
   - JWT_SECRET
   - JWT_EXPIRE (e.g., 7d)
   - RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS
   - CLOUDINARY_* and EMAIL_* if used
3) Start in dev: npm run dev


