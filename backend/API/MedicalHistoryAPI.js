import exp from "express";
import { MedicalHistoryModel } from "../Models/MedicalHistoryModel.js";

const historyApp = exp.Router();

historyApp.post("/medical-history", async (req, res, next) => {
  try {
    const data = req.body;
    // ensure a medical history document exists per patient
    let doc = await MedicalHistoryModel.findOne({ patient: data.patient });
    if (!doc) {
      doc = new MedicalHistoryModel({ patient: data.patient, entries: data.entries || [] });
    } else {
      doc.entries = doc.entries.concat(data.entries || []);
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
