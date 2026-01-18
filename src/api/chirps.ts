import { Request, Response, NextFunction } from "express";
import { cleanProfanities } from "./profanity.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "./errors.js";
import { createChirp, getAllChirps, getChirpsByAuthorID, getChirpByID, deleteChirpByID } from "../db/query.js";
import { getBearerToken, validateJWT } from "./auth.js";
import { config } from "../config.js";

interface CreateChirpRequest {
  body: string;
}

export async function handlerCreateChirp(req: Request, res: Response, next: NextFunction) {
  try {
    const { body } = req.body as CreateChirpRequest;

    // Validate body
    if (typeof body !== "string") {
      throw new BadRequestError("Body must be a string");
    }

    if (body.length === 0) {
      throw new BadRequestError("Chirp cannot be empty");
    }

    if (body.length > 140) {
      throw new BadRequestError("Chirp is too long. Max length is 140");
    }

    // Get and validate JWT token
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.api.jwtSecret);

    // Clean profanities
    const cleanedBody = cleanProfanities(body);

    // Create chirp in database
    const chirp = await createChirp({
      body: cleanedBody,
      userId,
    });

    if (!chirp) {
      throw new BadRequestError("Failed to create chirp");
    }

    // Return 201 with the chirp
    res.status(201).json({
      id: chirp.id,
      createdAt: chirp.createdAt,
      updatedAt: chirp.updatedAt,
      body: chirp.body,
      userId: chirp.userId,
    });
  } catch (e) {
    next(e);
  }
}

export async function handlerGetAllChirps(req: Request, res: Response, next: NextFunction) {
  try {
    let authorId = "";
    let authorIdQuery = req.query.authorId;
    if (typeof authorIdQuery === "string") {
      authorId = authorIdQuery;
    }

    let allChirps;
    if (authorId) {
      allChirps = await getChirpsByAuthorID(authorId);
    } else {
      allChirps = await getAllChirps();
    }

    // Handle sorting
    let sortQuery = req.query.sort;
    let sortDirection = "asc";
    if (typeof sortQuery === "string" && (sortQuery === "asc" || sortQuery === "desc")) {
      sortDirection = sortQuery;
    }

    const sortedChirps = allChirps.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (sortDirection === "desc") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    res.status(200).json(
      sortedChirps.map((chirp) => ({
        id: chirp.id,
        createdAt: chirp.createdAt,
        updatedAt: chirp.updatedAt,
        body: chirp.body,
        userId: chirp.userId,
      }))
    );
  } catch (e) {
    next(e);
  }
}

export async function handlerGetChirpByID(req: Request, res: Response, next: NextFunction) {
  try {
    const { chirpID } = req.params;

    if (typeof chirpID !== "string") {
      throw new BadRequestError("Chirp ID must be a string");
    }

    const chirp = await getChirpByID(chirpID);

    if (!chirp) {
      res.status(404).json({ error: "Chirp not found" });
      return;
    }

    res.status(200).json({
      id: chirp.id,
      createdAt: chirp.createdAt,
      updatedAt: chirp.updatedAt,
      body: chirp.body,
      userId: chirp.userId,
    });
  } catch (e) {
    next(e);
  }
}

export async function handlerDeleteChirp(req: Request, res: Response, next: NextFunction) {
  try {
    const { chirpID } = req.params;

    if (typeof chirpID !== "string") {
      throw new BadRequestError("Chirp ID must be a string");
    }

    // Get and validate JWT token
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.api.jwtSecret);

    // Get the chirp to verify ownership
    const chirp = await getChirpByID(chirpID);

    if (!chirp) {
      throw new NotFoundError("Chirp not found");
    }

    // Check if user is the author
    if (chirp.userId !== userId) {
      throw new ForbiddenError("You can only delete your own chirps");
    }

    // Delete the chirp
    await deleteChirpByID(chirpID);

    // Return 204 No Content
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}