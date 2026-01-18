import { Request, Response, NextFunction } from "express";
import { getBearerToken, makeJWT } from "./auth.js";
import { getUserFromRefreshToken } from "../db/query.js";
import { UnauthorizedError } from "./errors.js";
import { config } from "../config.js";

type RefreshResponse = {
  token: string;
};

export async function handlerRefresh(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get refresh token from Authorization header
    const refreshToken = getBearerToken(req);

    // Look up user from refresh token
    const user = await getUserFromRefreshToken(refreshToken);

    if (!user) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // Generate new access token (expires in 1 hour)
    const ONE_HOUR_SECONDS = 3600;
    const accessToken = makeJWT(user.id, ONE_HOUR_SECONDS, config.api.jwtSecret);

    // Return new access token
    const response: RefreshResponse = {
      token: accessToken,
    };

    res.status(200).json(response);
  } catch (e) {
    next(e);
  }
}
