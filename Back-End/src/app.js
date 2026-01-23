import express from "express";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";
import { config } from "./config/server.js";
import LiveLectureRoute from "./routes/lecture.routes.js";
import uploadRoute from "./routes/upload.routes.js";


const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.server.corsOrigin,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/lectures", LiveLectureRoute);
app.use("/api/upload", uploadRoute);

export default app;  
