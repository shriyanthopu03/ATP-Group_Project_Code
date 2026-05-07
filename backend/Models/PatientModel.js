import { Schema, model } from "mongoose";

const patientSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email required"],
      unique: [true, "Email already exists"],
    },
    password: {
      type: String,
      required: [true, "Password required"],
    },
    age:{
      type:Number,
      required:[true,"age must be required"]
    },
    address:{
      type:String,
      required:[true,"address must be required"]
    },
    phoneNumber:{
      type:String,
      required:[true,"phone number must be required"],
      unique:[true,"phone number already exists"]
    },
    profileImageUrl: {
      type: String,
    },
    isPatientActive:{
        type:Boolean,
        default:true
    }
  },
  {
    timestamps: true,
    versionKey: false
  },
);


export const PatientModel = model("patient", patientSchema);
