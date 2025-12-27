import { AppError } from '../../utils/asyncHandler';

describe('AppError', () => {
  it('should create an error with default status code 500 and isOperational true', () => {
    const message = 'Something went wrong';
    const error = new AppError(message);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
  });

  it('should create an error with specified status code', () => {
    const message = 'Not Found';
    const statusCode = 404;
    const error = new AppError(message, statusCode);

    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
    expect(error.isOperational).toBe(true);
  });

  it('should create an error with specified isOperational flag', () => {
    const message = 'System Error';
    const statusCode = 500;
    const isOperational = false;
    const error = new AppError(message, statusCode, isOperational);

    expect(error.isOperational).toBe(isOperational);
  });

  it('should capture stack trace', () => {
    const error = new AppError('Test Error');
    expect(error.stack).toBeDefined();
  });
});
