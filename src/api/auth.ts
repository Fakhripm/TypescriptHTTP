import * as argon2 from "argon2";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import { UnauthorizedError } from "./errors.js";
import crypto from "crypto";

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

export async function checkPasswordHash(
  password: string,
  hash: string
): Promise<boolean> {
  return await argon2.verify(hash, password);
}

export function getBearerToken(req: Request): string {
  const authHeader = req.get("Authorization");
  
  if (!authHeader) {
    throw new UnauthorizedError("Missing Authorization header");
  }
  
  const parts = authHeader.split(" ");
  
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new UnauthorizedError("Invalid Authorization header format");
  }
  
  return parts[1];
}

export function getAPIKey(req: Request): string {
  const authHeader = req.get("Authorization");
  
  if (!authHeader) {
    throw new UnauthorizedError("Missing Authorization header");
  }
  
  const parts = authHeader.split(" ");
  
  if (parts.length !== 2 || parts[0] !== "ApiKey") {
    throw new UnauthorizedError("Invalid Authorization header format");
  }
  
  return parts[1];
}

export function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string
): string {
  type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

  const iat = Math.floor(Date.now() / 1000);
  const payload: Payload = {
    iss: "chirpy",
    sub: userID,
    iat,
    exp: iat + expiresIn,
  };

  return jwt.sign(payload, secret);
}

export function makeRefreshToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function validateJWT(tokenString: string, secret: string): string {
  try {
    const decoded = jwt.verify(tokenString, secret) as JwtPayload;
    const userID = decoded.sub;

    if (!userID) {
      throw new Error("Invalid token: missing user ID");
    }

    return userID;
  } catch (err) {
    throw new Error(`Invalid token: ${(err as Error).message}`);
  }
}

