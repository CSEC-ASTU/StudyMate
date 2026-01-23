import express from "express";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";
import RagRoute from "./routes/rag.routes.js";


import { config } from "./config/server.js";
import { ensureDBAwake } from './middleware/dbMiddleware.js';
import { wakeNeonDB } from './utils/dbWakeUp.js';
import { PrismaClient } from '@prisma/client';

import AuthRoute from "./routes/auth.routes.js";
import ProfileRoute from "./routes/profile.routes.js";
import SemesterRoute from "./routes/semester.routes.js";
import CourseRoute from "./routes/course.routes.js";
import AssessmentRoute from "./routes/assessment.routes.js";
import AnalysisRoute from "./routes/analysis.routes.js";
import LiveLectureRoute from "./routes/lecture.routes.js";
import uploadRoute from "./routes/upload.routes.js";
import materialRoutes from './routes/material.routes.js';
import ragRoutes from './routes/rag.routes.js';


const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.server.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Health check endpoint (doesn't need DB wake-up)
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Wake DB endpoint (manual trigger)
app.post('/api/wake-db', async (req, res) => {
  try {
    const result = await wakeNeonDB();
    res.json({ 
      success: result, 
      message: result ? 'Database waking up' : 'Failed to wake database',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply DB wake-up middleware to all API routes
// app.use('/api', ensureDBAwake);

// Your routes
app.use("/api/auth", AuthRoute);
app.use("/api/profile", ProfileRoute);
app.use("/api/lectures", LiveLectureRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/semesters", SemesterRoute);
app.use("/api/courses", CourseRoute);
app.use("/api/materials", materialRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api", AssessmentRoute); 
app.use("/api", AnalysisRoute);


export default app;


