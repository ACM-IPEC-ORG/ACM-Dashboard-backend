const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=> next(err))
    }
}

export {asyncHandler}

class ApiResponse{
    constructor(
        statusCode,
        data,
        message="Success"
    ){
        this.statusCode=statusCode,
        this.data=data
        this.message=message
        this.success=statusCode <400
    }
}
export {ApiResponse}

class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        stack=""
    ){
        super(message)
        this.statusCode=statusCode
        this.data=null,
        this.message=message
        this.success=false;
        this.errors=errors

        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export {ApiError}

import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary=async(localFilePath)=>{
    try {
        if(!localFilePath) return null
        // upload the file on cloudinary
        const response =await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })
        
        console.log("File has been uploaded on Cloudinary successfully",response)
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        // remove the locally saved temporary file as the uploade operation got failed
        console.log("Error: ",error)
        fs.unlinkSync(localFilePath)
        return null;
    }
}

export {uploadOnCloudinary}

import { google } from "googleapis";

/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
 * from the client_secret.json file. To get these credentials for your application, visit
 * https://console.cloud.google.com/apis/credentials.
 */
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  "postmessage"
);

export {oauth2Client}