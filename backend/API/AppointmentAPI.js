import exp from "express";
import { AppointmentModel } from "../Models/AppointmentModel.js";

const appointmentApp = exp.Router();

appointmentApp.post("/appointments", async (req, res, next) => {
  try {
    const data = req.body;
    const appointment = new AppointmentModel(data);
    await appointment.save();
    return res.status(201).json({ message: "Appointment created", payload: appointment });
  } catch (err) {
    return next(err);
  }
});

appointmentApp.get("/appointments", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.patient) query.patient = req.query.patient;
    if (req.query.doctor) query.doctor = req.query.doctor;
    const list = await AppointmentModel.find(query).populate("patient doctor");
    return res.status(200).json({ message: "Appointments fetched", payload: list });
  } catch (err) {
    return next(err);
  }
});

appointmentApp.get("/appointments/:id", async (req, res, next) => {
  try {
    const appt = await AppointmentModel.findById(req.params.id).populate("patient doctor");
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    return res.status(200).json({ message: "Appointment fetched", payload: appt });
  } catch (err) {
    return next(err);
  }
});

appointmentApp.put("/appointments/:id", async (req, res, next) => {
  try {
    const updated = await AppointmentModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Appointment not found" });
    return res.status(200).json({ message: "Appointment updated", payload: updated });
  } catch (err) {
    return next(err);
  }
});

appointmentApp.delete("/appointments/:id", async (req, res, next) => {
  try {
    await AppointmentModel.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Appointment deleted" });
  } catch (err) {
    return next(err);
  }
});

export { appointmentApp as AppointmentAPI };
