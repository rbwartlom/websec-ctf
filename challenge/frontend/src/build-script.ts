import { createClient } from "@hey-api/openapi-ts";
import path from "path";

createClient({
  client: "@hey-api/client-axios",
  input: path.join(__dirname, "../../dist/swagger.json"),
  output: path.join(__dirname, "./services/api-service"),
});
