/** @file Defines the swagger schema, and writes it to the parent directory when this file is ran/imported */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import swaggerJSDoc, { SwaggerDefinition, type Options } from "swagger-jsdoc";
import { PORT } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// bad typescript because swagger-jsdoc does not provide a spec type
/** Prefixes the `paths` elements of an OpenAPI spec with the supplied prefix */
const prefixPaths = (spec: any, prefix: string) => {
    const paths = Object.keys(spec.paths).reduce((acc, path) => {
      const newPath = `${prefix}${path}`;
      acc[newPath] = spec.paths[path]; // Assign the path object to the new prefixed path
      return acc;
    }, {} as any);
  
    return { ...spec, paths }; // Return a new spec object with updated paths
  };
  
  const getBaseDefinition = (
    title: string,
    description: string,
  ): SwaggerDefinition => {
    const result: SwaggerDefinition = {
      failOnErrors: true,
      openapi: "3.0.0",
      info: {
        title,
        version: "1.0.0",
        description,
      },
      servers: [
        {
          url: process.env.NODE_ENV === 'production' ? process.env.BASE_URL : `localhost:${PORT}`, //TODO: configure this from env
          description: "Main server",
        },
      ],
      components: {},
      security: [],
    };
  
    // TODO: configure this schema's authentication
  
    return result;
  };
  
  const swaggerApiDocsOptionsAdmin: Options = {
    definition: getBaseDefinition(
      "Name", //TODO: fill this API
      "Description"
    ),
    tags: [
      //TODO: add tag descriptions here
    ],
    apis: [
      //TODO: import paths to routers here, in the router spec there should be a tag for each endpoint
      "./src/routers/example.ts",
    ],
  };
  
  export const swaggerSpec = prefixPaths(
    swaggerJSDoc(swaggerApiDocsOptionsAdmin),
    "api/"
  );


const swaggerOutputPath = path.join(__dirname, '../../dist/swagger.json'); //export to the parent directory of the backend
fs.writeFileSync(swaggerOutputPath, JSON.stringify(swaggerSpec, null, 2));
console.log(`Swagger schema written to ${swaggerOutputPath}`);