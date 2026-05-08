import express from "express";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { AdminModel } from "../Models/AdminModel.js";
import { DoctorModel } from "../Models/DoctorModel.js";
import { PatientModel } from "../Models/PatientModel.js";

config();

const commonApp = express.Router();

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
};

const jwtSecret = process.env.SECRET_KEY || process.env.JWT_SECRET;

// Common routes
commonApp.get("/status", (req, res) => {
  res.status(200).json({ message: "API is operational" });
});

// Unified login endpoint
commonApp.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }

    let user;
    let userModel;
    const userRole = role.toUpperCase();

    // Find user based on role
    if (userRole === "ADMIN") {
      userModel = AdminModel;
      user = await AdminModel.findOne({ email });
    } else if (userRole === "DOCTOR") {
      userModel = DoctorModel;
      user = await DoctorModel.findOne({ email });
    } else if (userRole === "PATIENT") {
      userModel = PatientModel;
      user = await PatientModel.findOne({ email });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!user) {
      return res.status(400).json({ message: "error occurred", error: "Invalid email or role mismatch" });
    }

    // Check if user is active (for doctors and patients)
    if (userRole === "DOCTOR" && user.isDoctorActive === false) {
      return res.status(403).json({ message: "error occurred", error: "User account is inactive" });
    }

    if (userRole === "PATIENT" && user.isPatientActive === false) {
      return res.status(403).json({ message: "error occurred", error: "User blocked" });
    }

    // Compare passwords
    const isMatched = await compare(password, user.password);

    if (!isMatched) {
      return res.status(400).json({ message: "Invalid password" });
    }

    if (!jwtSecret) {
      return res.status(500).json({
        message: "error occurred",
        error: "Server misconfigured: missing JWT secret",
      });
    }

    // Create JWT token
    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: userRole,
    };

    // Add role-specific fields
    if (userRole === "PATIENT") {
      tokenPayload.firstName = user.firstName;
      tokenPayload.lastName = user.lastName;
      tokenPayload.profileImageUrl = user.profileImageUrl;
    } else if (userRole === "DOCTOR") {
      tokenPayload.firstName = user.firstName;
      tokenPayload.lastName = user.lastName;
      tokenPayload.profileImageUrl = user.profileImageUrl;
    }

    const signedToken = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: "1h",
    });

    res.cookie("token", signedToken, cookieOptions);

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      message: "login success",
      payload: userObj,
    });
  } catch (err) {
    return res.status(500).json({
      message: "error occurred",
      error: err.message,
    });
  }
});

export { commonApp };
