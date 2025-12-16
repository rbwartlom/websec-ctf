/** @file Application entry point */
import "./types.js"; // Load type augmentations
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";

import { checkENVs, MONGODB_URI, NODE_ENV, PORT, SafeError } from "./config.js";
import { swaggerSpec } from "./swagger.js";
import usersRouter from "./routers/users.js";
import notesRouter from "./routers/notes.js";
import flagRouter from "./routers/flag.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── App Factory ─────────────────────────────────────────────────────────────

export function createApp() {
  const app = express();

  app.use(helmet());
  // CORS
  const corsOptions =
    NODE_ENV === "development"
      ? {
          origin: [
            // localhost:517{3-9}, which are ports likely assigned by vite in dev
            ...Array.from({ length: 9 - 3 }, (_, i) => `http://localhost:517${i + 3}`),
          ],
          credentials: true,
        }
      : { origin: process.env.BASE_URL, credentials: true };
  app.use(cors(corsOptions));
  app.use(express.json());

  // API routes
  app.use("/api/users", usersRouter);
  app.use("/api/notes", notesRouter);
  app.use("/api/flag", flagRouter);
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api/docs.json", (_req, res) => {
    res.json(swaggerSpec);
  });

  // API 404
  app.use("/api/*", (_req, res) => {
    res.status(404).json({ message: "Not Found" });
  });

  // Static frontend
  const fePath = path.join(__dirname, "../../dist/frontend");

  // Serve static files from the frontend
  app.use(express.static(fePath));

  // All other GET requests not handled before will return our frontend app
  app.get("*", (req, res) => {
    res.sendFile(path.join(fePath, "index.html"));
  });

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

if (NODE_ENV !== "test" && NODE_ENV !== "schema" && NODE_ENV !== "init-db") {
  checkENVs();
  connectDB().then(() => {
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  });
}
