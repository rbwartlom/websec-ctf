/** @file Swagger/OpenAPI schema generation */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import swaggerJSDoc, { SwaggerDefinition, Options } from "swagger-jsdoc";
import { NODE_ENV, PORT } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl =
  NODE_ENV === "development"
    ? `http://localhost:${PORT}`
    : process.env.BASE_URL;
if (!baseUrl) {
  throw new Error("BASE_URL is not set");
}
// `/` is fine, but ending with / is not
if (baseUrl !== "/" && baseUrl.endsWith("/")) {
  throw new Error("BASE_URL must not end with a slash");
}

const getBaseDefinition = (): SwaggerDefinition => ({
  openapi: "3.0.0",
  info: {
    title: "Notes API",
    version: "1.0.0",
    description: "API for user authentication and note management",
  },
  servers: [
    {
      url: baseUrl,
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
  apis: [
    "./src/routers/users.ts",
    "./src/routers/notes.ts",
    "./src/routers/flag.ts",
  ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Write spec to file when run directly
const swaggerOutputPath = path.join(__dirname, "../../dist/swagger.json");
fs.writeFileSync(swaggerOutputPath, JSON.stringify(swaggerSpec, null, 2));
console.log(`Schema written to ${swaggerOutputPath}`);
