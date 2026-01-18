import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } from "./errors.js";

export function middlewareLogResponse(
    req: Request,
    res: Response,
    next: NextFunction
) {
    res.on("finish", () => {
        const statusCode = res.statusCode;

        if (statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
    });
    next();
}

export function middlewareMetricsInc(
    req: Request, 
    res: Response, 
    next: NextFunction) {
    res.on("finish", () => {
        config.api.fileserverHits += 1;
    });
    next();
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof BadRequestError) {
    res.status(400).json({ error: err.message });
  } else if (err instanceof UnauthorizedError) {
    res.status(401).json({ error: err.message });
  } else if (err instanceof ForbiddenError) {
    res.status(403).json({ error: err.message });
  } else if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
  } else if (err.message.includes("Invalid token") || err.message.includes("Missing Authorization")) {
    res.status(401).json({ error: err.message });
  } else {
    console.log(err.message);
    res.status(500).json({ error: "Something went wrong on our end" });
  }
}

