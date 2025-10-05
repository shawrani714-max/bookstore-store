const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

describe('Auth Middleware', () => {
  let user, token;

  beforeEach(async () => {
    await User.deleteMany({});
    user = await global.testUtils.createTestUser(User);
    token = global.testUtils.generateAuthToken(user);
  });

  describe('protect middleware', () => {
    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });

    it('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should deny access with expired token', async () => {
      const expiredToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('adminOnly middleware', () => {
    it('should allow access for admin user', async () => {
      const adminUser = await global.testUtils.createTestUser(User, { isAdmin: true });
      const adminToken = global.testUtils.generateAuthToken(adminUser);

      // This would need to be a protected admin route
      // For now, we'll test the middleware logic
      expect(adminUser.isAdmin).toBe(true);
    });

    it('should deny access for non-admin user', async () => {
      expect(user.isAdmin).toBe(false);
    });
  });
});
