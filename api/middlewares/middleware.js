import { asyncHandler,ApiError,ApiResponse } from "../utils/utils.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { User } from "../models/User.models.js";


export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken||req.body?.token || req.header("Authorization")?.replace("Bearer ","")

        if(!token) throw new ApiError(401, "Unauthorized Request");
        
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user) throw new ApiError(401,"Invalid Access Token");
    
        req.user=user;
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Tokens")   
    }
})

import multer from "multer"
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ storage })