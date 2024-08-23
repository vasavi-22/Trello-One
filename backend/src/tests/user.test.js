const request = require('supertest');
const app = require('../../index'); // Assuming Express app is exported from index.js

describe('User Endpoints', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/signup')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(201);
  });

  it('should not create a user with invalid email', async () => {
    const res = await request(app)
      .post('/api/signup')
      .send({
        email: 'not-an-email',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(400);
  });
});
