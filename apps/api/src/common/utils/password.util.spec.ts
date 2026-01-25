import * as bcrypt from 'bcrypt';
import { hashPassword, comparePassword } from './password.util';

describe('Password Utility', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce a valid bcrypt hash', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      // bcrypt hashes start with $2a$ or $2b$
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it('should use 12 salt rounds', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      // The hash should contain the cost factor (12) after $2b$ or $2a$
      expect(hash).toMatch(/^\$2[ab]\$12\$/);
    });

    it('should produce different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', async () => {
      const password = '';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[ab]\$12\$/);
    });

    it('should handle special characters', async () => {
      const password = 'P@$$w0rd!#%^&*()';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[ab]\$12\$/);
    });

    it('should handle unicode characters', async () => {
      const password = '密码パスワード';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[ab]\$12\$/);
    });

    it('should handle long passwords', async () => {
      const password = 'a'.repeat(72); // bcrypt max is 72 bytes
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[ab]\$12\$/);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      const result = await comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await hashPassword(password);

      const result = await comparePassword(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it('should return false for similar but different passwords', async () => {
      const password = 'testPassword123';
      const similarPassword = 'testPassword124';
      const hash = await hashPassword(password);

      const result = await comparePassword(similarPassword, hash);

      expect(result).toBe(false);
    });

    it('should be case sensitive', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);

      const lowerCaseResult = await comparePassword('testpassword123', hash);
      const upperCaseResult = await comparePassword('TESTPASSWORD123', hash);

      expect(lowerCaseResult).toBe(false);
      expect(upperCaseResult).toBe(false);
    });

    it('should handle empty string password', async () => {
      const password = '';
      const hash = await hashPassword(password);

      const result = await comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should return false when comparing empty string with non-empty hash', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      const result = await comparePassword('', hash);

      expect(result).toBe(false);
    });

    it('should handle special characters', async () => {
      const password = 'P@$$w0rd!#%^&*()';
      const hash = await hashPassword(password);

      const result = await comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should handle unicode characters', async () => {
      const password = '密码パスワード';
      const hash = await hashPassword(password);

      const result = await comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should work with externally generated bcrypt hash', async () => {
      // Pre-generated hash for 'testPassword123' with 12 rounds
      const password = 'knownPassword';
      const hash = await bcrypt.hash(password, 12);

      const result = await comparePassword(password, hash);

      expect(result).toBe(true);
    });
  });

  describe('integration', () => {
    it('should hash and verify multiple passwords correctly', async () => {
      const passwords = ['password1', 'password2', 'password3'];
      const hashes = await Promise.all(passwords.map(hashPassword));

      for (let i = 0; i < passwords.length; i++) {
        // Each password should match its own hash
        const matchResult = await comparePassword(passwords[i], hashes[i]);
        expect(matchResult).toBe(true);

        // Each password should not match other hashes
        for (let j = 0; j < hashes.length; j++) {
          if (i !== j) {
            const noMatchResult = await comparePassword(passwords[i], hashes[j]);
            expect(noMatchResult).toBe(false);
          }
        }
      }
    });
  });
});
