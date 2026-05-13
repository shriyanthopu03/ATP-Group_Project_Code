import { Schema, model, Types } from "mongoose";

const appointmentSchema = new Schema(
  {
    patient: { type: Types.ObjectId, ref: "patient", required: true },
    doctor: { type: Types.ObjectId, ref: "doctor", required: true },
    datetime: { type: Date, required: true },
    reason: { type: String },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

export const AppointmentModel = model("appointment", appointmentSchema);
