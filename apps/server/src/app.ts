import cors from "cors";
import express, { type Express } from "express";
import { config } from "./config.js";

/**
 * Build the Express HTTP application.
 *
 * Only handles plain HTTP. Socket.IO is attached to the same HTTP server
 * separately in `index.ts` so the two concerns stay readable.
 */
export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: config.clientOrigins,
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}
