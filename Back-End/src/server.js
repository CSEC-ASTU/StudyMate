import fs from "fs";
import path from "path";
import app from "./app.js";
import { config } from "./config/server.js";
import { initQdrant } from "./config/qdrant.init.js";

const port = Number(config.server.port) || 3000;
const environment = config.server.environment;
const tmpDir = path.join(process.cwd(), "tmp");

if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

await initQdrant();
const server = app.listen(port, () => {
  console.log(`Server running on port ${port} (${environment})`);
});

const shutdown = () => {
  console.log("Shutting down server");
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default server;
