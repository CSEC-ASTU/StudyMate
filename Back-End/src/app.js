import express from "express";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";
import { config } from "./config/server.js";
import LiveLectureRoute from "./routes/lecture.routes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.server.corsOrigin,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

import AuthRoute from "./routes/auth.routes.js";
import ProfileRoute from "./routes/profile.routes.js";

app.use("/api/auth", AuthRoute);
app.use("/api/profile", ProfileRoute);
app.use("/api/lectures", LiveLectureRoute);

export default app;  
