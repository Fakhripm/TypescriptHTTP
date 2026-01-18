import { Request, Response, NextFunction } from "express";
import { getBearerToken } from "./auth.js";
import { revokeRefreshToken } from "../db/query.js";

export async function handlerRevoke(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get refresh token from Authorization header
    const refreshToken = getBearerToken(req);

    // Revoke the token
    await revokeRefreshToken(refreshToken);

    // Return 204 No Content
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
