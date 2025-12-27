import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import shopRoute from '../../routes/shop.route';
import { prisma } from '../../db/db';
import {  DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import uploadImageOnCloudinary from '../../utils/imageUpload';
import { errorHandler } from '../../middlewares/errorHandler';

// Mock prisma
jest.mock('../../db/db', () => {
  const { mockDeep } = require('jest-mock-extended');
  return {
    __esModule: true,
    prisma: mockDeep(),
  };
});

// Mock isAuthenticated middleware
jest.mock('../../middlewares/isAuthenticated', () => ({
  isAuthenticated: jest.fn((req, res, next) => {
    req.id = '1'; // Mock user ID
    next();
  }),
}));

// Mock image upload
jest.mock('../../utils/imageUpload', () => jest.fn());

// Mock multer
jest.mock('../../middlewares/multer', () => ({
  single: () => (req: any, res: any, next: any) => {
    req.file = {
      path: 'mock/path/to/file',
      filename: 'mock-file',
    } as any;
    next();
  },
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/v1/shop', shopRoute);
app.use(errorHandler as any);

describe('Shop API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/shop', () => {
    it('should create a shop successfully', async () => {
      const shopData = {
        storeName: 'Test Shop',
        city: 'Test City',
        address: '123 Test St',
        deliveryTime: '30',
        latitude: '10.0',
        longitude: '20.0',
        description: 'A test shop',
      };

      (uploadImageOnCloudinary as jest.Mock).mockResolvedValue('http://cloudinary.com/image.jpg');

      prismaMock.shop.create.mockResolvedValue({
        id: 1,
        userId: 1,
        storeName: shopData.storeName,
        city: shopData.city.toLowerCase(),
        address: shopData.address,
        deliveryTime: 30,
        storeBanner: 'http://cloudinary.com/image.jpg',
        latitude: 10.0,
        longitude: 20.0,
        description: shopData.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const response = await request(app)
        .post('/api/v1/shop')
        .send(shopData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.shop.storeName).toBe(shopData.storeName);
      expect(prismaMock.shop.create).toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      const shopData = {
        storeName: 'Test Shop',
        // Missing city, address, etc.
      };

      const response = await request(app)
        .post('/api/v1/shop')
        .send(shopData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/shop', () => {
    it('should get shops for the logged in user', async () => {
      const mockShops = [
        { id: 1, storeName: 'Shop 1', userId: 1 },
        { id: 2, storeName: 'Shop 2', userId: 1 },
      ];

      prismaMock.shop.findMany.mockResolvedValue(mockShops as any);

      const response = await request(app)
        .get('/api/v1/shop');

      expect(response.status).toBe(200);
      expect(response.body.shops).toHaveLength(2);
      expect(prismaMock.shop.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 1 },
      }));
    });
  });
});
