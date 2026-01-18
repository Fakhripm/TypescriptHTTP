import { Response } from "express";

export function handleJsonError(res: Response, statusCode: number, errorMessage: string): void {
  res.status(statusCode).json({ error: errorMessage });
}

export function handleJsonResponse(res: Response, statusCode: number, payload: any): void {
  res.header("Content-Type", "application/json");
  res.status(statusCode).json(payload);
}
