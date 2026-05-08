import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { config } from "dotenv";

// Import API routers
import { DoctorAPI } from "./API/DoctorAPI.js";
import { adminApp as AdminAPI } from "./API/AdminAPI.js";
import { patientApp as PatientAPI } from "./API/PatientAPI.js";
import { commonApp as CommonAPI } from "./API/CommonAPI.js";

config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hospital";

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// API Routes
app.use("/api", CommonAPI);
app.use("/api", AdminAPI);
app.use("/api", DoctorAPI);
app.use("/api", PatientAPI);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      message: "Validation error",
      errors: messages,
    });
  }

  if (err.name === "MongoError" || err.code === 11000) {
    return res.status(400).json({
      message: "Database error",
      error: "Duplicate key or database constraint violation",
    });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "production" ? undefined : err,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
