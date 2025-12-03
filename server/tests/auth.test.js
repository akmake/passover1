import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import authRoutes from '../routes/authRoutes.js';
import User from '../models/userModel.js';
import cookieParser from 'cookie-parser'; // <-- 1. ייבוא של cookie-parser

// --- Setup Test Server ---
const app = express();
app.use(cookieParser()); // <-- 2. הוספת ה-middleware לאפליקציית הבדיקות
app.use(express.json());
app.use('/api/auth', authRoutes);

// --- In-Memory MongoDB Setup ---
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

// --- Test Suite for Authentication ---
describe('Authentication API - /api/auth', () => {

  // --- Test for User Registration ---
  describe('POST /register', () => {

    it('should register a new user successfully with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // 1. Check for successful response
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.role).toBe('user');

      // 2. Check that cookies were set
      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = response.headers['set-cookie'];
      expect(cookies.some(cookie => cookie.startsWith('access_token='))).toBe(true);
      expect(cookies.some(cookie => cookie.startsWith('refresh_token='))).toBe(true);

      // 3. Verify the user was actually created in the database
      const dbUser = await User.findOne({ email: userData.email });
      expect(dbUser).not.toBeNull();
      expect(dbUser.name).toBe(userData.name);
    });

    it('should fail to register if email already exists', async () => {
      await User.create({
          name: 'Existing User',
          email: 'exists@example.com',
          passwordHash: 'somehash'
      });

      const userData = {
        name: 'Another User',
        email: 'exists@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('משתמש עם כתובת אימייל זו כבר קיים');
    });

    it('should fail to register with a weak password', async () => {
        const userData = {
            name: 'Test User',
            email: 'weakpass@example.com',
            password: '123',
        };

        const response = await request(app)
            .post('/api/auth/register')
            .send(userData);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('הסיסמה חייבת להכיל לפחות 8 תווים');
    });

    it('should fail to register if required fields are missing', async () => {
        const userData = {
            name: 'Test User',
        };

        const response = await request(app)
            .post('/api/auth/register')
            .send(userData);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('שם, אימייל וסיסמה הם שדות חובה');
    });
  });

});