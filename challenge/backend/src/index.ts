/** @file Application entry point */
import "./types.js"; // Load type augmentations
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { checkENVs, MONGODB_URI, PORT, SafeError } from "./config.js";
import { swaggerSpec } from "./swagger.js";
import usersRouter from "./routers/users.js";
import notesRouter from "./routers/notes.js";
import helmet from "helmet";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── App Factory ─────────────────────────────────────────────────────────────

export function createApp() {
  const app = express();

  app.use(helmet());
  // CORS
  const corsOptions =
    process.env.NODE_ENV === "development"
      ? { origin: ["http://localhost:5173"], credentials: true }
      : { origin: process.env.BASE_URL, credentials: true };
  app.use(cors(corsOptions));
  app.use(express.json());

  // API routes
  app.use("/api/users", usersRouter);
  app.use("/api/notes", notesRouter);
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // API 404
  app.use("/api/*", (_req, res) => {
    res.status(404).json({ message: "Not Found" });
  });

  // Static frontend
  const fePath = path.join(__dirname, "../../dist/frontend");
  app.use(express.static(fePath));

  // Error handler
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SafeError) {
      res.status(err.responseCode).json({ message: err.message });
    } else {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return app;
}

// ─── Database ────────────────────────────────────────────────────────────────

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

if (process.env.NODE_ENV !== "test") {
  checkENVs();
  connectDB().then(() => {
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  });
}
