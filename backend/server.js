import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { config } from "dotenv";
import { DoctorAPI } from "./API/DoctorAPI.js";
import { adminApp} from "./API/AdminAPI.js";
import { patientApp} from "./API/PatientAPI.js";
import { commonApp} from "./API/CommonAPI.js";
import { AppointmentAPI } from "./API/AppointmentAPI.js";
import { PrescriptionAPI } from "./API/PrescriptionAPI.js";
import { MedicalHistoryAPI } from "./API/MedicalHistoryAPI.js";

config();

//create express app
const app = exp();
//enable cors
app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}))
//add cookie parser middeleware
app.use(cookieParser())
//body parser middleware
app.use(exp.json());
//path level middlewares





//connect to db
const connectDB = async () => {
  try {
    await connect(process.env.DB_URL);
    console.log("DB server connected");
    //assign port
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`server listening on ${port}..`));
  } catch (err) {
    console.log("err in db connect", err);
  }
};

connectDB();

//to handle invalid path
app.use((req, res, next) => {
  console.log(req.url);
  res.status(404).json({ message: `path ${req.url} is invalid` });
});

//Error handling middleware
app.use((err, req, res, next) => {
  console.log("error is ",err)
  console.log("Full error:", JSON.stringify(err, null, 2));
  //ValidationError
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }
  //CastError
  if (err.name === "CastError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }
  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  //send server side error
  res.status(500).json({ message: "error occurred", error: "Server side error" });
});


