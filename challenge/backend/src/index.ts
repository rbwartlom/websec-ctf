/** @file The main server file, add routers and middleware as needed. This file should not house business logic */
import express, { NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import { checkENVs, PORT, SafeError } from "./config.js";
import exampleRouter from "./routers/example.js";
import { swaggerSpec } from "./swagger.js";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function startServer() {
  const app = express();
  checkENVs(); //throws if required ENVs are missing

  // Usual express server here
  const corsSettings =
    process.env.NODE_ENV === "development"
      ? {
          origin: ["http://localhost:5173"],
          credentials: true,
        }
      : {};
  // Usual express server here
  app.use(cors(corsSettings));
  app.use(express.json());

  app.use("/api/example", exampleRouter);

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use("/api/*", (req, res) => {
    res.status(404).send("Not Found");
  });

  const fePath = path.join(__dirname, "../../dist/frontend");
  app.use(express.static(fePath));

  app.use((err: any, req: any, res: any, next: NextFunction) => {
    if (err instanceof SafeError) {
      return res.status(err.responseCode).json({ message: err.message });
    } else {
      return res.status(500).json({ message: `Internal Server Error` });
    }
  });

  return app;
}

// Only start the server if we are not in a test environment. Otherwise, the server will be in the test file
if (process.env.NODE_ENV !== "test") {
  const app = startServer();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
