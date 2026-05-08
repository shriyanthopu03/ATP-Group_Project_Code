import express from "express";

const commonApp = express.Router();

// Common routes
commonApp.get("/status", (req, res) => {
  res.status(200).json({ message: "API is operational" });
});

export { commonApp };
