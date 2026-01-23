import fs from "fs";
import path from "path";
import app from "./app.js";
import { config } from "./config/server.js";
import { initQdrant } from "./config/qdrant.init.js";
import { initializeDatabase } from "./config/database.init.js";

const port = Number(config.server.port) || 3000;
const environment = config.server.environment;
const tmpDir = path.join(process.cwd(), "tmp");

if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

async function startServer() {
  try {
    // Initialize database connection with wake-up
    await initializeDatabase();

    // Initialize Qdrant (if needed)
    try {
      await initQdrant();
    } catch (error) {
      console.warn("⚠️ Failed to initialize Qdrant. Proceeding without Vector DB.", error.message);
    }

    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port} (${environment})`);
      console.log(`✅ Health check: http://localhost:${port}/health`);
      console.log(`✅ Manual DB wake: POST http://localhost:${port}/api/wake-db`);
    });

    const shutdown = () => {
      console.log("Shutting down server");
      server.close(() => process.exit(0));
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
