// lib/middleware/errorHandler.ts
import { NextApiResponse, NextApiRequest } from "next";
import { AppError } from "@/lib/errors";

export function errorHandler(
  err: Error,
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error("Erreur inattendue:", err);
  return res.status(500).json({ message: "Erreur interne du serveur" });
}
