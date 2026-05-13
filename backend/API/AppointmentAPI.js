import exp from "express";
import { AppointmentModel } from "../Models/AppointmentModel.js";

const appointmentApp = exp.Router();

const toAppointmentPayload = (body) => {
  const patient = body.patient ?? body.patientId;
  const doctor = body.doctor ?? body.doctorId;
  const datetime = body.datetime || (body.appointmentDate ? new Date(`${body.appointmentDate}T${body.appointmentTime || "00:00"}:00`) : undefined);
  const status = body.status;

  let isActive = body.isActive;
  if (status === "completed" || status === "cancelled") {
    isActive = false;
  } else if (status === "scheduled") {
    isActive = true;
  }

  const payload = {
    reason: body.reason || body.notes || "",
  };

  if (patient !== undefined) payload.patient = patient;
  if (doctor !== undefined) payload.doctor = doctor;
  if (datetime !== undefined) payload.datetime = datetime;
  if (status !== undefined) payload.status = status;
  if (isActive !== undefined) payload.isActive = isActive;

  return payload;
};

appointmentApp.post("/appointments", async (req, res, next) => {
  try {
    const data = toAppointmentPayload(req.body);
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
    if (req.query.patient || req.query.patientId) query.patient = req.query.patient || req.query.patientId;
    if (req.query.doctor || req.query.doctorId) query.doctor = req.query.doctor || req.query.doctorId;
    if (req.query.isActive === "true" || req.query.active === "true") query.isActive = true;
    if (req.query.isActive === "false" || req.query.active === "false") query.isActive = false;
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
    const updated = await AppointmentModel.findByIdAndUpdate(req.params.id, toAppointmentPayload(req.body), { new: true, runValidators: true });
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
