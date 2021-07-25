import express from "express"
import bcrypt from "bcrypt"
import mongoose from "mongoose";
import {Users} from "./models/userSchema.js"
// import {Tokens} from "./models/tokenSchema.js"
import jwt from "jsonwebtoken"
import cors from "cors"
import {handleSendEmail} from "./controllers/handleSendEmail.js"

const app=express()
const port= process.env.PORT || 3001
app.use(express.json())
app.use(cors())

//connection to mongodb
const url=process.env.MONGODB_URI || 'mongodb://localhost:27017/UserLoginDB';
mongoose.connect(url, 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true
    }
);

//api for signup
app.post("/register",async(req,res)=>{
    const {userEmail,password}=req.body
    if(await Users.findOne({userEmail:userEmail})){
        res.status(500).json("This user already exists")
    }
    else{
        try{
        
            const salt = await bcrypt.genSalt(10)
            const passwordHash= await bcrypt.hash(password,salt)
            
            const user=new Users({
                userEmail:userEmail,
                password:passwordHash
            })
            await user.save()
            res.status(200).json(user)
        } catch(err){
            res.status(500).json(err)
        }
    }
    
})

//api for login
app.post("/login",async(req,res)=>{
    const {userEmail,password}=req.body;
    try{
        const user=await Users.findOne({userEmail:userEmail})
        const flag=await bcrypt.compare(password,user.password)
        if(flag){
            res.status(200).json("login Success")
        }else{
            res.status(500).json("Invalid Credentils")
        }
    }catch(err){
        res.status(500).json(err)
    }
})

//api for forgot password
app.post("/forgot_password",async(req,res)=>{
    const {userEmail}=req.body;
    try{
        if(await Users.findOne({userEmail:userEmail})){
            const user=await Users.findOne({userEmail:userEmail})
            const secret=process.env.SECRET_KEY || "my_secret";
            const key=secret+user.password;
            const payload={
                email:user.userEmail,
                id:user._id
            }
            const token=jwt.sign(payload,key,{expiresIn:"5m"});
            //store token(this is not necessary since jwt itself manages verification for current requirement)
            // const storeToken=new Tokens({
            //     userId:user._id,
            //     token:token
            // })
            // await storeToken.save();
            const link=`${process.env.CLIENT_BASE_URL}/reset_password/${user._id}/${token}`
            // const link=`http://localhost:3000/reset_password/${user._id}/${token}`
            
            // send link to user email
            handleSendEmail(user.userEmail,link)
            res.status(200).json("Passwork reset link sent")
        } else{
            res.status(500).json("Invalid User")
        }
    }catch(err){
        res.status(500).json(err)
    }

    
})

//verification of expiration of reset password link 
app.post("/reset_password/:id/:token",async(req,res)=>{
    const {id, token}=req.params;
    try{
        // const storedTokenEntry=await Tokens.findOne({userId:id});
        
        const user=await Users.findById(id);
        const secret=process.env.SECRET_KEY || "my_secret";
        const key=secret+user.password;
        const payload=jwt.verify(token,key)
        
        res.status(200).json("user verified, redirecting to password reset page")
    }catch(err){
        res.status(500).json(err)
    }
    

})

//api to update password
app.patch("/change_password/:id/:token",async(req,res)=>{
    const {id, token}=req.params;
    const {newPassword}=req.body;
    try{
        const user=await Users.findById(id);
        const secret=process.env.SECRET_KEY || "my_secret";
        const key=secret+user.password;
        const payload=jwt.verify(token,key)
        
        const salt=await bcrypt.genSalt(10)
        const newPasswordHash=await bcrypt.hash(newPassword,salt)
        user.password=newPasswordHash
        await user.save()
        res.json(user)
    }catch(err){
        res.status(500).json(err)
    }
})


app.listen(port,()=>{console.log("server started at port",port)})