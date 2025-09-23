import getToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt, { hash } from "bcryptjs"
//SignUp controller
export const signUp = async (req,res) => {
  
try{
   const {name,email,password} = req.body 
   const existEmail = await User.findOne({email})
  
   if(existEmail){
    return res.status(400).json({message:"email already exists !!"})
    //

   }

   if(password.length < 6){
    return res.status(400).json({message:"password must be at least 6 charecters"})

   }

   const hashPassword = await bcrypt.hash(password,10)
   const user = await User.create({name,password:hashPassword,email})
   
   const token = await getToken(user._id)

   res.cookie("token",token,{
    httpOnly:true,
    maxAge:7*24*60*60*1000,
    sameSite:"strict",
    secure:false
   })

   return res.status(201).json(user)
}
catch(err){
    
    return res.status(500).json({message:`sign up error ${err}`})

}
}


//Login controller

export const Login = async (req,res) => {
  
try{
   const {email,password} = req.body 
   const user = await User.findOne({email})

   if(!user){
    return res.status(400).json({message:"email doesn't exists !!"})

   }
   
   const isMatch = await bcrypt.compare(password,user.password)

   if(!isMatch){
    return res.status(400).json({message:"Incorrect password !"})

   }

   
   
   const token = await getToken(user._id)

   res.cookie("token",token,{
    httpOnly:true,
    maxAge:7*24*60*60*1000,
    sameSite:"strict",
    secure:false
   })

   return res.status(200).json(user)
}
catch(err){
    return res.status(500).json({message:`Log in error ${err}`})

}
}

//Lot out controller

export const logOut = async (req,res) => {
    try{
        res.clearCookie("token")
        return res.status(200).json({message:"log out successfully"})
    }
    catch(err){
        return res.status(500).json({message:`logout err ${err}`})
    }
}
