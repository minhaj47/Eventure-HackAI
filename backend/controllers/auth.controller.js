import bcrypt from "bcryptjs";
import getToken from "../config/token.js";
import User from "../models/user.model.js";

//Google Auth controller
export const googleAuth = async (req, res) => {
    try {
        const { googleId, name, email, image } = req.body;
        
        if (!googleId || !email || !name) {
            return res.status(400).json({ message: "Missing required Google auth data" });
        }

        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId });
        
        if (!user) {
            // Check if user exists with this email (might be a local account)
            const existingUser = await User.findOne({ email });
            
            if (existingUser && existingUser.authProvider === 'local') {
                // Link Google account to existing local account
                existingUser.googleId = googleId;
                existingUser.image = image;
                existingUser.authProvider = 'google';
                user = await existingUser.save();
            } else {
                // Create new Google user
                user = await User.create({
                    googleId,
                    name,
                    email,
                    image,
                    authProvider: 'google'
                });
            }
        } else {
            // Update existing Google user info
            user.name = name;
            user.email = email;
            user.image = image;
            await user.save();
        }

        const token = await getToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
            authProvider: user.authProvider
        });

    } catch (err) {
        console.error('Google auth error:', err);
        return res.status(500).json({ message: `Google authentication error: ${err.message}` });
    }
}

//SignUp controller
export const signUp = async (req,res) => {
  
try{
   const {name,email,password} = req.body 
   const existEmail = await User.findOne({email})
  
   if(existEmail){
    return res.status(400).json({message:"email already exists !!"})
   }

   if(!password || password.length < 6){
    return res.status(400).json({message:"password must be at least 6 characters"})
   }

   const hashPassword = await bcrypt.hash(password,10)
   const user = await User.create({
       name,
       password:hashPassword,
       email,
       authProvider: 'local'
   })
   
   const token = await getToken(user._id)

   res.cookie("token",token,{
    httpOnly:true,
    maxAge:7*24*60*60*1000,
    sameSite:"strict",
    secure: process.env.NODE_ENV === "production"
   })

   return res.status(201).json({
       _id: user._id,
       name: user.name,
       email: user.email,
       authProvider: user.authProvider
   })
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

   if(user.authProvider === 'google'){
    return res.status(400).json({message:"This account uses Google Sign-In. Please use Google to log in."})
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
    secure: process.env.NODE_ENV === "production"
   })

   return res.status(200).json({
       _id: user._id,
       name: user.name,
       email: user.email,
       authProvider: user.authProvider
   })
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

//Get current user controller
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ message: `Get current user error: ${err}` });
    }
}
