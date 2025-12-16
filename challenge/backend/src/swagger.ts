/** @file Swagger/OpenAPI schema generation */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import swaggerJSDoc, { SwaggerDefinition, Options } from "swagger-jsdoc";
import { PORT } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getBaseDefinition = (): SwaggerDefinition => ({
  openapi: "3.0.0",
  info: {
    title: "Notes API",
    version: "1.0.0",
    description: "API for user authentication and note management",
  },
  servers: [
    {
      url:
        process.env.NODE_ENV === "production"
          ? process.env.BASE_URL
          : `http://localhost:${PORT}`,
      description: "Main server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
});

const swaggerOptions: Options = {
  definition: getBaseDefinition(),
  apis: ["./src/routers/users.ts", "./src/routers/notes.ts", "./src/routers/flag.ts"],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Write spec to file when run directly
const swaggerOutputPath = path.join(__dirname, "../../dist/swagger.json");
fs.writeFileSync(swaggerOutputPath, JSON.stringify(swaggerSpec, null, 2));
console.log(`Schema written to ${swaggerOutputPath}`);
