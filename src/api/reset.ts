import { Request, Response } from "express";
import { config } from "../config.js";
import { deleteAllUsers } from "../db/query.js";

export async function handlerReset(_req: Request, res: Response) {
  if (config.api.platform !== "dev") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  config.api.fileserverHits = 0;
  await deleteAllUsers();
  res.send("Metrics reset");
}
