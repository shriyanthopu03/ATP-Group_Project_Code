import { Schema, model, Types } from "mongoose";

const medicationSchema = new Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String },
    duration: { type: String },
    instructions: { type: String },
  },
  { _id: false }
);

const prescriptionSchema = new Schema(
  {
    appointment: { type: Types.ObjectId, ref: "appointment" },
    patient: { type: Types.ObjectId, ref: "patient", required: true },
    doctor: { type: Types.ObjectId, ref: "doctor", required: true },
    medications: { type: [medicationSchema], default: [] },
    notes: { type: String },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);

export const PrescriptionModel = model("prescription", prescriptionSchema);
