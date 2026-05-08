import exp from "express";
import { hash } from "bcryptjs";
import { DoctorModel } from "../Models/DoctorModel.js";

const doctorApp = exp.Router();

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
