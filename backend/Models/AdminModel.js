import {model, Schema} from 'mongoose';

const adminSchema = new Schema( 
    {
        email: {    
            type:String,
            required: [true, "Email is required"],
            unique: [true, "Email already exists"],
        },
        password: {
            type:String,
            required: [true, "Password is required"],   
        }

    },
    {
    timestamps: true,
    versionKey: false
  }
);
export const AdminModel = model("admin", adminSchema);