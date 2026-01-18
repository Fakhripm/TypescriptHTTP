import { Request, Response, NextFunction } from "express";
import { createUser, updateUser } from "../db/query.js";
import { hashPassword, getBearerToken, validateJWT } from "./auth.js";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { config } from "../config.js";

type UserResponse = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  isChirpyRed: boolean;
};

interface CreateUserRequest {
  email: string;
  password: string;
}

interface UpdateUserRequest {
  email?: string;
  password?: string;
}

export async function handlerCreateUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body as CreateUserRequest;

    if (!email || typeof email !== "string") {
      throw new BadRequestError("Email is required");
    }

    if (!password || typeof password !== "string") {
      throw new BadRequestError("Password is required");
    }

    const hashedPassword = await hashPassword(password);

    const user = await createUser({ email, hashedPassword });

    if (!user) {
      res.status(409).json({ error: "Email already exists" });
      return;
    }

    const userResponse: UserResponse = {
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email,
      isChirpyRed: user.isChirpyRed,
    };

    res.status(201).json(userResponse);
  } catch (e) {
    if (e instanceof BadRequestError) {
      res.status(400).json({ error: e.message });
    } else if (
      (e as any)?.message?.includes("duplicate key") ||
      (e as any)?.code === "23505"
    ) {
      res.status(409).json({ error: "Email already exists" });
    } else {
      throw e;
    }
  }
}

export async function handlerUpdateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get and validate JWT token
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.api.jwtSecret);

    const { email, password } = req.body as UpdateUserRequest;

    // Validate inputs
    if (email !== undefined && typeof email !== "string") {
      throw new BadRequestError("Email must be a string");
    }

    if (password !== undefined && typeof password !== "string") {
      throw new BadRequestError("Password must be a string");
    }

    if (!email && !password) {
      throw new BadRequestError("At least one field (email or password) is required");
    }

    // Prepare update data
    const updateData: Record<string, string> = {};

    if (email) {
      updateData.email = email;
    }

    if (password) {
      updateData.hashedPassword = await hashPassword(password);
    }

    // Update user in database
    const updatedUser = await updateUser(userId, updateData);

    if (!updatedUser) {
      throw new Error("Failed to update user");
    }

    const userResponse: UserResponse = {
      id: updatedUser.id,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      email: updatedUser.email,
      isChirpyRed: updatedUser.isChirpyRed,
    };

    res.status(200).json(userResponse);
  } catch (e) {
    next(e);
  }
}

