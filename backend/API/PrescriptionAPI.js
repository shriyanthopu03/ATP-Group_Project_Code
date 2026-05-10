import exp from "express";
import { PrescriptionModel } from "../Models/PrescriptionModel.js";

const prescriptionApp = exp.Router();

const toPrescriptionPayload = (body) => ({
  ...body,
  patient: body.patient ?? body.patientId,
  doctor: body.doctor ?? body.doctorId,
  medications: body.medications || body.medicines || [],
  issuedAt: body.issuedAt || body.prescribedAt,
});

prescriptionApp.post("/prescriptions", async (req, res, next) => {
  try {
    const data = toPrescriptionPayload(req.body);
    const presc = new PrescriptionModel(data);
    await presc.save();
    return res.status(201).json({ message: "Prescription created", payload: presc });
  } catch (err) {
    return next(err);
  }
});

prescriptionApp.get("/prescriptions", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.patient || req.query.patientId) query.patient = req.query.patient || req.query.patientId;
    const list = await PrescriptionModel.find(query).populate("patient doctor");
    return res.status(200).json({ message: "Prescriptions fetched", payload: list });
  } catch (err) {
    return next(err);
  }
});

prescriptionApp.get("/prescriptions/:id", async (req, res, next) => {
  try {
    const p = await PrescriptionModel.findById(req.params.id).populate("patient doctor");
    if (!p) return res.status(404).json({ message: "Prescription not found" });
    return res.status(200).json({ message: "Prescription fetched", payload: p });
  } catch (err) {
    return next(err);
  }
});

export { prescriptionApp as PrescriptionAPI };
