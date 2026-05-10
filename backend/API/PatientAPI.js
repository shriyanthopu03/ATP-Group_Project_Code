import exp from "express";
import { compare, hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { PatientModel } from "../Models/PatientModel.js";

config();

const { sign } = jwt;
export const patientApp = exp.Router();

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
	httpOnly: true,
	secure: isProd,
	sameSite: isProd ? "none" : "lax",
};

const jwtSecret = process.env.SECRET_KEY || process.env.JWT_SECRET;

patientApp.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		const patient = await PatientModel.findOne({ email });

		if (!patient) {
			return res.status(400).json({ message: "error occurred", error: "Invalid email" });
		}

		if (!patient.isPatientActive) {
			return res.status(403).json({ message: "error occurred", error: "User blocked" });
		}

		const isMatched = await compare(password, patient.password);

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
				id: patient._id,
				email: patient.email,
				role: "PATIENT",
				firstName: patient.firstName,
				lastName: patient.lastName,
				profileImageUrl: patient.profileImageUrl,
			},
			jwtSecret,
			{
				expiresIn: "1h",
			},
		);

		res.cookie("token", signedToken, cookieOptions);

		const patientObj = patient.toObject();
		delete patientObj.password;

		return res.status(200).json({
			message: "login success",
			payload: patientObj,
		});
	} catch (err) {
		return res.status(500).json({
			message: "error occurred",
			error: err.message,
		});
	}
});

patientApp.get("/logout", (req, res) => {
	res.clearCookie("token", cookieOptions);
	return res.status(200).json({ message: "Logout success" });
});

patientApp.get("/check-auth", async (req, res) => {
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
		const patient = await PatientModel.findById(decodedToken.id);

		if (!patient || !patient.isPatientActive) {
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
				id: patient._id,
				email: patient.email,
				role: "PATIENT",
				firstName: patient.firstName,
				lastName: patient.lastName,
				profileImageUrl: patient.profileImageUrl,
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

patientApp.post("/patients", async (req, res, next) => {
	try {
		const patientData = { ...req.body };

		if (patientData.password) {
			patientData.password = await hash(patientData.password, 12);
		}

		const newPatient = new PatientModel(patientData);
		await newPatient.save();

		const savedPatient = newPatient.toObject();
		delete savedPatient.password;

		return res.status(201).json({
			message: "Patient created successfully",
			payload: savedPatient,
		});
	} catch (err) {
		return next(err);
	}
});

patientApp.get("/patients", async (req, res, next) => {
	try {
		const query = {};

		if (req.query.active === "true") {
			query.isPatientActive = true;
		}

		if (req.query.active === "false") {
			query.isPatientActive = false;
		}

		const patients = await PatientModel.find(query).select("-password");

		return res.status(200).json({
			message: "Patients fetched successfully",
			payload: patients,
		});
	} catch (err) {
		return next(err);
	}
});

patientApp.get("/patients/:id", async (req, res, next) => {
	try {
		const patient = await PatientModel.findById(req.params.id).select("-password");

		if (!patient) {
			return res.status(404).json({ message: "Patient not found" });
		}

		return res.status(200).json({
			message: "Patient fetched successfully",
			payload: patient,
		});
	} catch (err) {
		return next(err);
	}
});

patientApp.put("/patients/:id", async (req, res, next) => {
	try {
		const patientData = { ...req.body };

		if (patientData.password) {
			patientData.password = await hash(patientData.password, 12);
		}

		const updatedPatient = await PatientModel.findByIdAndUpdate(req.params.id, patientData, {
			new: true,
			runValidators: true,
		}).select("-password");

		if (!updatedPatient) {
			return res.status(404).json({ message: "Patient not found" });
		}

		return res.status(200).json({
			message: "Patient updated successfully",
			payload: updatedPatient,
		});
	} catch (err) {
		return next(err);
	}
});

patientApp.patch("/patients/:id/status", async (req, res, next) => {
	try {
		const { isPatientActive } = req.body;
		const nextStatus = isPatientActive === true || isPatientActive === "true" || isPatientActive === 1 || isPatientActive === "1";

		const updatedPatient = await PatientModel.findByIdAndUpdate(
			req.params.id,
			{ isPatientActive: nextStatus },
			{
				new: true,
				runValidators: true,
			},
		).select("-password");

		if (!updatedPatient) {
			return res.status(404).json({ message: "Patient not found" });
		}

		return res.status(200).json({
			message: "Patient status updated successfully",
			payload: updatedPatient,
		});
	} catch (err) {
		return next(err);
	}
});

patientApp.delete("/patients/:id", async (req, res, next) => {
	try {
		const deletedPatient = await PatientModel.findByIdAndUpdate(
			req.params.id,
			{ isPatientActive: false },
			{
				new: true,
				runValidators: true,
			},
		).select("-password");

		if (!deletedPatient) {
			return res.status(404).json({ message: "Patient not found" });
		}

		return res.status(200).json({
			message: "Patient deactivated successfully",
			payload: deletedPatient,
		});
	} catch (err) {
		return next(err);
	}
});

