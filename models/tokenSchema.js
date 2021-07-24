import mongoose from "mongoose"

//this schema is not necessory because nodeMailer can handle the current requirement
const tokenSchema=new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    token:{
        type:String,
        required:true
    }
})

export const Tokens=mongoose.model("Token",tokenSchema)