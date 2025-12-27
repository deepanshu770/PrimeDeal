import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import userRoute from '../../routes/user.route';
import { prisma } from '../../db/db';
import {  DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { errorHandler } from '../../middlewares/errorHandler';

// Mock the prisma client
jest.mock('../../db/db', () => {
  const { mockDeep } = require('jest-mock-extended');
  return {
    __esModule: true,
    prisma: mockDeep(),
  };
});

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/v1/user', userRoute);
app.use(errorHandler as any);

// Mock bcrypt to avoid slow hashing during tests
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('User API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/user/signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        fullname: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        contact: '1234567890',
        admin: false,
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 1,
        fullname: userData.fullname,
        email: userData.email,
        phoneNumber: userData.contact,
        passwordHash: 'hashedPassword',
        profilePicture: null,
        admin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const response = await request(app)
        .post('/api/v1/user/signup')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(userData.email);
      expect(prismaMock.user.create).toHaveBeenCalled();
    });

    it('should return 400 if user already exists', async () => {
      const userData = {
        fullname: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        contact: '1234567890',
      };

      prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: userData.email } as any);

      const response = await request(app)
        .post('/api/v1/user/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists'); // Adjust based on actual error handling
    });
  });

  describe('POST /api/v1/user/login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        fullname: 'Test User',
        email: loginData.email,
        passwordHash: 'hashedPassword',
        phoneNumber: '1234567890',
        admin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.update.mockResolvedValue(mockUser as any);

      const response = await request(app)
        .post('/api/v1/user/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 400 for incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 1,
        email: loginData.email,
        passwordHash: 'hashedPassword',
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/v1/user/login')
        .send(loginData);

      expect(response.status).toBe(400);
    });
  });
});
