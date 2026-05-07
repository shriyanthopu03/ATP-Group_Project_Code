import { Schema, model } from "mongoose";

const doctorSchema = new Schema(
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
      unique: [true, "Email already existed"],
    },
    password: {
      type: String,
      required: [true, "Password required"],    
  },
    age:{
        type:Number,
        required:[true,"age must be required"],
    },  
    phoneNumber:{
        type:String,
        required:[true,"phone number must be required"],
        unique:[true,"phone number already exists"]
    },
    experience:{
        type:Number,
        required:[true,"experience must be required"],
    },
    specialization:{
        type:String,
        required:[true,"specialization must be required"],
    },
    degree:{
        type:String,
        required:[true,"degree must be required"],
    },
    
    profileImageUrl: {
      type: String,
    },
    isDoctorActive:{
        type:Boolean,
        default:true
    }

},
  {
    timestamps: true,
    versionKey: false
  }
);


export const DoctorModel = model("doctor", doctorSchema);
