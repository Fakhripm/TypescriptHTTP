import { Request, Response, NextFunction } from "express";
import { upgradeUserToChirpyRed } from "../db/query.js";
import { NotFoundError, UnauthorizedError } from "./errors.js";
import { getAPIKey } from "./auth.js";
import { config } from "../config.js";

interface WebhookData {
  event: string;
  data: {
    userId: string;
  };
}

export async function handlerPolkaWebhook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Verify API key
    const apiKey = getAPIKey(req);
    
    if (apiKey !== config.api.polkaKey) {
      throw new UnauthorizedError("Invalid API key");
    }

    const { event, data } = req.body as WebhookData;

    // If event is not user.upgraded, return 204
    if (event !== "user.upgraded") {
      res.status(204).send();
      return;
    }

    // Extract userId from data
    const { userId } = data;

    if (!userId || typeof userId !== "string") {
      res.status(204).send();
      return;
    }

    // Upgrade user to Chirpy Red
    const upgradedUser = await upgradeUserToChirpyRed(userId);

    if (!upgradedUser) {
      throw new NotFoundError("User not found");
    }

    // Return 204 No Content
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
