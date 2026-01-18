import { Request, Response, NextFunction } from "express";
import { getUserByEmail, createRefreshToken } from "../db/query.js";
import { checkPasswordHash, makeJWT, makeRefreshToken } from "./auth.js";
import { UnauthorizedError, BadRequestError } from "./errors.js";
import { config } from "../config.js";

interface LoginRequest {
  email: string;
  password: string;
}

type UserResponse = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  token: string;
  refreshToken: string;
  isChirpyRed: boolean;
};

export async function handlerLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validate inputs
    if (typeof email !== "string" || typeof password !== "string") {
      throw new BadRequestError("Email and password must be strings");
    }

    // Look up user by email
    const user = await getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedError("Incorrect email or password");
    }

    // Check password hash
    const passwordMatch = await checkPasswordHash(password, user.hashedPassword);

    if (!passwordMatch) {
      throw new UnauthorizedError("Incorrect email or password");
    }

    // Generate access token (expires in 1 hour)
    const ONE_HOUR_SECONDS = 3600;
    const accessToken = makeJWT(user.id, ONE_HOUR_SECONDS, config.api.jwtSecret);

    // Generate refresh token
    const refreshTokenString = makeRefreshToken();
    
    // Save refresh token to database (expires in 60 days)
    const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + SIXTY_DAYS_MS);

    await createRefreshToken({
      token: refreshTokenString,
      userId: user.id,
      expiresAt,
    });

    // Return user with tokens
    const userResponse: UserResponse = {
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email,
      token: accessToken,
      refreshToken: refreshTokenString,
      isChirpyRed: user.isChirpyRed,
    };

    res.status(200).json(userResponse);
  } catch (e) {
    next(e);
  }
}
