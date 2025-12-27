import { generateToken } from '../../utils/generatToken';
import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('generateToken', () => {
  let mockRes: Partial<Response>;
  let mockUser: User;

  beforeEach(() => {
    mockRes = {
      cookie: jest.fn(),
    };
    mockUser = {
      id: 1,
      email: 'test@example.com',
    } as User; // Cast to User since we don't need all properties for this test
  });

  it('should generate a token and set it as a cookie', () => {
    const mockToken = 'mock.jwt.token';
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    const token = generateToken(mockRes as Response, mockUser);

    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: mockUser.id },
      expect.any(String),
      { expiresIn: '1d' }
    );

    expect(mockRes.cookie).toHaveBeenCalledWith('token', mockToken, expect.objectContaining({
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    }));

    expect(token).toBe(mockToken);
  });
});
