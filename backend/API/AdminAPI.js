import exp from "express";
import { compare, hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { AdminModel } from "../Models/AdminModel.js";

config();

const { sign } = jwt;
export const adminApp = exp.Router();

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
	httpOnly: true,
	secure: isProd,
	sameSite: isProd ? "none" : "lax",
};

const jwtSecret = process.env.SECRET_KEY || process.env.JWT_SECRET;

adminApp.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		const admin = await AdminModel.findOne({ email });

		if (!admin) {
			return res.status(400).json({ message: "error occurred", error: "Invalid email" });
		}

		const isMatched = await compare(password, admin.password);

		if (!isMatched) {
			return res.status(400).json({ message: "Invalid password" });
		}

		if (!jwtSecret) {
			return res.status(500).json({
				message: "error occurred",
				error: "Server misconfigured: missing JWT secret",
			});
		}

		const signedToken = sign(
			{
				id: admin._id,
				email: admin.email,
				role: "ADMIN",
			},
			jwtSecret,
			{
				expiresIn: "1h",
			},
		);

		res.cookie("token", signedToken, cookieOptions);

		const adminObj = admin.toObject();
		delete adminObj.password;

		return res.status(200).json({
			message: "login success",
			payload: adminObj,
		});
	} catch (err) {
		return res.status(500).json({
			message: "error occurred",
			error: err.message,
		});
	}
});

adminApp.get("/logout", (req, res) => {
	res.clearCookie("token", cookieOptions);
	return res.status(200).json({ message: "Logout success" });
});

adminApp.get("/check-auth", async (req, res) => {
	try {
		const token = req.cookies?.token;

		if (!token || !jwtSecret) {
			return res.status(200).json({
				message: "unauthenticated",
				authenticated: false,
				payload: null,
			});
		}

		const decodedToken = jwt.verify(token, jwtSecret);
		const admin = await AdminModel.findById(decodedToken.id);

		if (!admin) {
			res.clearCookie("token", cookieOptions);
			return res.status(200).json({
				message: "unauthenticated",
				authenticated: false,
				payload: null,
			});
		}

		return res.status(200).json({
			message: "authenticated",
			authenticated: true,
			payload: {
				id: admin._id,
				email: admin.email,
				role: "ADMIN",
			},
		});
	} catch (err) {
		return res.status(200).json({
			message: "unauthenticated",
			authenticated: false,
			payload: null,
		});
	}
});

adminApp.post("/admins", async (req, res, next) => {
	try {
		const adminData = { ...req.body };

		if (adminData.password) {
			adminData.password = await hash(adminData.password, 12);
		}

		const newAdmin = new AdminModel(adminData);
		await newAdmin.save();

		const savedAdmin = newAdmin.toObject();
		delete savedAdmin.password;

		return res.status(201).json({
			message: "Admin created successfully",
			payload: savedAdmin,
		});
	} catch (err) {
		return next(err);
	}
});

