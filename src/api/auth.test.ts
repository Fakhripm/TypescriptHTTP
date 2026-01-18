import { describe, it, expect, beforeAll } from "vitest";
import {
  makeJWT,
  validateJWT,
  hashPassword,
  checkPasswordHash,
} from "./auth";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for an incorrect password", async () => {
    const result = await checkPasswordHash(password2, hash1);
    expect(result).toBe(false);
  });

  it("should produce different hashes for different passwords", () => {
    expect(hash1).not.toBe(hash2);
  });
});

describe("JWT Creation and Validation", () => {
  const userID = "user123";
  const secret = "my-secret-key";
  const expiresIn = 3600; // 1 hour
  let token: string;

  beforeAll(() => {
    token = makeJWT(userID, expiresIn, secret);
  });

  it("should create a valid JWT", () => {
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");
  });

  it("should validate a correct JWT and return the user ID", () => {
    const extractedUserID = validateJWT(token, secret);
    expect(extractedUserID).toBe(userID);
  });

  it("should reject a JWT signed with the wrong secret", () => {
    expect(() => {
      validateJWT(token, "wrong-secret");
    }).toThrow();
  });

  it("should reject an expired JWT", () => {
    const expiredToken = makeJWT(userID, 0, secret);
    // Wait 1000 ms to ensure the token is expired
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(() => {
          validateJWT(expiredToken, secret);
        }).toThrow();
        resolve(null);
      }, 1000);
    });
  });

  it("should reject a malformed JWT", () => {
    expect(() => {
      validateJWT("not.a.valid.jwt", secret);
    }).toThrow();
  });
});
