import exp from "express";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { DoctorModel } from "../Models/DoctorModel.js";

config();

const { sign } = jwt;
const doctorApp = exp.Router();

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
	httpOnly: true,
	secure: isProd,
	sameSite: isProd ? "none" : "lax",
};

const jwtSecret = process.env.SECRET_KEY || process.env.JWT_SECRET;

// Doctor login endpoint
doctorApp.post("/doctors/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		const doctor = await DoctorModel.findOne({ email });

		if (!doctor) {
			return res.status(400).json({ message: "error occurred", error: "Invalid email" });
		}

		if (!doctor.isDoctorActive) {
			return res.status(403).json({ message: "error occurred", error: "User blocked" });
		}

		const isMatched = await compare(password, doctor.password);

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
				id: doctor._id,
				email: doctor.email,
				role: "DOCTOR",
				firstName: doctor.firstName,
				lastName: doctor.lastName,
				profileImageUrl: doctor.profileImageUrl,
			},
			jwtSecret,
			{
				expiresIn: "1h",
			},
		);

		res.cookie("token", signedToken, cookieOptions);

		const doctorObj = doctor.toObject();
		delete doctorObj.password;

		return res.status(200).json({
			message: "login success",
			payload: doctorObj,
		});
	} catch (err) {
		return res.status(500).json({
			message: "error occurred",
			error: err.message,
		});
	}
});

doctorApp.post("/doctors", async (req, res, next) => {
	try {
		const doctorData = { ...req.body };

		if (doctorData.password) {
			doctorData.password = await hash(doctorData.password, 12);
		}

		const newDoctor = new DoctorModel(doctorData);
		await newDoctor.save();

		const savedDoctor = newDoctor.toObject();
		delete savedDoctor.password;

		return res.status(201).json({
			message: "Doctor created successfully",
			payload: savedDoctor,
		});
	} catch (err) {
		return next(err);
	}
});

doctorApp.get("/doctors", async (req, res, next) => {
	try {
		const query = {};

		if (req.query.active === "true") {
			query.isDoctorActive = true;
		}

		if (req.query.active === "false") {
			query.isDoctorActive = false;
		}

		const doctors = await DoctorModel.find(query).select("-password");

		return res.status(200).json({
			message: "Doctors fetched successfully",
			payload: doctors,
		});
	} catch (err) {
		return next(err);
	}
});

doctorApp.get("/doctors/:id", async (req, res, next) => {
	try {
		const doctor = await DoctorModel.findById(req.params.id).select("-password");

		if (!doctor) {
			return res.status(404).json({ message: "Doctor not found" });
		}

		return res.status(200).json({
			message: "Doctor fetched successfully",
			payload: doctor,
		});
	} catch (err) {
		return next(err);
	}
});

doctorApp.put("/doctors/:id", async (req, res, next) => {
	try {
		const doctorData = { ...req.body };

		if (doctorData.password) {
			doctorData.password = await hash(doctorData.password, 12);
		}

		const updatedDoctor = await DoctorModel.findByIdAndUpdate(req.params.id, doctorData, {
			new: true,
			runValidators: true,
		}).select("-password");

		if (!updatedDoctor) {
			return res.status(404).json({ message: "Doctor not found" });
		}

		return res.status(200).json({
			message: "Doctor updated successfully",
			payload: updatedDoctor,
		});
	} catch (err) {
		return next(err);
	}
});

doctorApp.patch("/doctors/:id/status", async (req, res, next) => {
	try {
		const { isDoctorActive } = req.body;

		const updatedDoctor = await DoctorModel.findByIdAndUpdate(
			req.params.id,
			{ isDoctorActive: Boolean(isDoctorActive) },
			{
				new: true,
				runValidators: true,
			},
		).select("-password");

		if (!updatedDoctor) {
			return res.status(404).json({ message: "Doctor not found" });
		}

		return res.status(200).json({
			message: "Doctor status updated successfully",
			payload: updatedDoctor,
		});
	} catch (err) {
		return next(err);
	}
});

doctorApp.delete("/doctors/:id", async (req, res, next) => {
	try {
		const deletedDoctor = await DoctorModel.findByIdAndUpdate(
			req.params.id,
			{ isDoctorActive: false },
			{
				new: true,
				runValidators: true,
			},
		).select("-password");

		if (!deletedDoctor) {
			return res.status(404).json({ message: "Doctor not found" });
		}

		return res.status(200).json({
			message: "Doctor deactivated successfully",
			payload: deletedDoctor,
		});
	} catch (err) {
		return next(err);
	}
});

export { doctorApp as DoctorAPI };
