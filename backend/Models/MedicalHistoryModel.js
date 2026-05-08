import { Schema, model, Types } from "mongoose";

const historyEntrySchema = new Schema(
  {
    date: { type: Date, default: Date.now },
    doctor: { type: Types.ObjectId, ref: "doctor" },
    notes: { type: String },
    diagnosis: { type: String },
    treatment: { type: String },
  },
  { _id: false }
);

const medicalHistorySchema = new Schema(
  {
    patient: { type: Types.ObjectId, ref: "patient", required: true, unique: true },
    entries: { type: [historyEntrySchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

export const MedicalHistoryModel = model("medicalhistory", medicalHistorySchema);
