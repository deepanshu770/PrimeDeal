import { genVerificationCode } from '../../utils/genVerificationCode';

describe('genVerificationCode', () => {
  it('should generate a code of default length 6', () => {
    const code = genVerificationCode();
    expect(code).toHaveLength(6);
    expect(typeof code).toBe('string');
  });

  it('should generate a code of specified length', () => {
    const length = 10;
    const code = genVerificationCode(length);
    expect(code).toHaveLength(length);
  });

  it('should contain only allowed characters', () => {
    const allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const code = genVerificationCode(100);
    for (const char of code) {
      expect(allowedChars).toContain(char);
    }
  });

  it('should generate different codes on subsequent calls', () => {
    const code1 = genVerificationCode();
    const code2 = genVerificationCode();
    expect(code1).not.toBe(code2);
  });
});
