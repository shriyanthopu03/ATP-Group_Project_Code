import exp from "express";
import { MedicalHistoryModel } from "../Models/MedicalHistoryModel.js";

const historyApp = exp.Router();

const toHistoryEntry = (body) => ({
  date: body.date || body.visitDate,
  doctor: body.doctor ?? body.doctorId,
  notes: body.notes,
  diagnosis: body.diagnosis || body.condition,
  treatment: body.treatment,
});

historyApp.post("/medical-history", async (req, res, next) => {
  try {
    const data = req.body;
    const patientId = data.patient ?? data.patientId;
    const entries = Array.isArray(data.entries) ? data.entries : [toHistoryEntry(data)];
    // ensure a medical history document exists per patient
    let doc = await MedicalHistoryModel.findOne({ patient: patientId });
    if (!doc) {
      doc = new MedicalHistoryModel({ patient: patientId, entries });
    } else {
      doc.entries = doc.entries.concat(entries);
    }
    await doc.save();
    return res.status(201).json({ message: "Medical history updated", payload: doc });
  } catch (err) {
    return next(err);
  }
});

historyApp.get("/medical-history/:patientId", async (req, res, next) => {
  try {
    const doc = await MedicalHistoryModel.findOne({ patient: req.params.patientId }).populate("patient entries.doctor");
    if (!doc) return res.status(404).json({ message: "Medical history not found" });
    return res.status(200).json({ message: "Medical history fetched", payload: doc });
  } catch (err) {
    return next(err);
  }
});

export { historyApp as MedicalHistoryAPI };
