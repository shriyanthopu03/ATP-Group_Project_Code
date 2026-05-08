import exp from "express";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { PatientModel } from "../Models/PatientModel.js";
import { DoctorModel } from "../Models/DoctorModel.js";
import { AdminModel } from "../Models/AdminModel.js";

config();

const { sign } = jwt;
export const commonApp = exp.Router();

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
	httpOnly: true,
	secure: isProd,
	sameSite: isProd ? "none" : "lax",
};

const jwtSecret = process.env.SECRET_KEY || process.env.JWT_SECRET;

// Unified login endpoint for all roles
commonApp.post("/login", async (req, res) => {
	try {
		const { email, password, role } = req.body;

		if (!email || !password || !role) {
			return res.status(400).json({
				message: "error occurred",
				error: "Email, password, and role are required",
			});
		}

		let user = null;
		let userRole = role.toUpperCase();
		let model = null;

		// Route to correct model based on role
		if (userRole === "PATIENT") {
			user = await PatientModel.findOne({ email });
			model = PatientModel;
		} else if (userRole === "DOCTOR") {
			user = await DoctorModel.findOne({ email });
			model = DoctorModel;
		} else if (userRole === "ADMIN") {
			user = await AdminModel.findOne({ email });
			model = AdminModel;
		} else {
			return res.status(400).json({
				message: "error occurred",
				error: "Invalid role. Must be PATIENT, DOCTOR, or ADMIN",
			});
		}

		if (!user) {
			return res.status(400).json({
				message: "error occurred",
				error: "Invalid email or role",
			});
		}

		// Check if user is active (for Patient and Doctor)
		if (userRole === "PATIENT" && !user.isPatientActive) {
			return res.status(403).json({
				message: "error occurred",
				error: "User blocked",
			});
		}

		if (userRole === "DOCTOR" && !user.isDoctorActive) {
			return res.status(403).json({
				message: "error occurred",
				error: "User blocked",
			});
		}

		// Verify password
		const isMatched = await compare(password, user.password);
		if (!isMatched) {
			return res.status(400).json({
				message: "error occurred",
				error: "Invalid password",
			});
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

		// Add additional fields for patient and doctor
		if (userRole === "PATIENT") {
			tokenPayload.firstName = user.firstName;
			tokenPayload.lastName = user.lastName;
			tokenPayload.profileImageUrl = user.profileImageUrl;
		} else if (userRole === "DOCTOR") {
			tokenPayload.firstName = user.firstName;
			tokenPayload.lastName = user.lastName;
			tokenPayload.profileImageUrl = user.profileImageUrl;
		}

		const signedToken = sign(tokenPayload, jwtSecret, {
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

// Logout endpoint
commonApp.get("/logout", (req, res) => {
	res.clearCookie("token", cookieOptions);
	return res.status(200).json({ message: "Logout success" });
});

export { commonApp };
