// users.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');

describe('Users API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany();
  });

  it('should create a user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ username: 'testuser', email: 'test@example.com', password: 'secret123' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
  });

  it('should get all users', async () => {
    await User.create({ username: 'testuser', email: 'test@example.com', password: 'secret123' });
    const res = await request(app).get('/users');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a user by id', async () => {
    const user = await User.create({ username: 'testuser', email: 'test@example.com', password: 'secret123' });
    const res = await request(app).get(`/users/${user._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.email).toBe('test@example.com');
  });

  it('should update a user', async () => {
    const user = await User.create({ username: 'testuser', email: 'test@example.com', password: 'secret123' });
    const res = await request(app)
      .put(`/users/${user._id}`)
      .send({ username: 'updateduser' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.username).toBe('updateduser');
  });

  it('should delete a user', async () => {
    const user = await User.create({ username: 'testuser', email: 'test@example.com', password: 'secret123' });
    const res = await request(app).delete(`/users/${user._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.msg).toBe('Deleted successfully');
  });

  it('should not create user with invalid email', async () => {
    const res = await request(app)
      .post('/users')
      .send({ username: 'testuser', email: 'invalid', password: 'secret123' });
    expect(res.statusCode).toEqual(400);
  });
});
