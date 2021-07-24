import mongoose from "mongoose";

const userSchema=new mongoose.Schema(
    {
        userEmail:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        }
    }
)

export const Users=mongoose.model("User",userSchema)