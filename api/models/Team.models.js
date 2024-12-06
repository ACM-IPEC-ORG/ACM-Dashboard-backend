import mongoose from "mongoose";

const teamDetailSchema=new mongoose.Schema({
    img:{
        type:String
    },
    fullName:{
        type:String,
        required:true
    },
    designation:{
        type:String,
        required:true
    },
    department:{
        type:String,
    },
    position:{
        type:String,
        enum:["HOD","conveyner","prime","core","founder"]
    },
    social_links:[
        {
            type:String
        }
    ],
    
},{timestamps:true});

export const TeamDetail=mongoose.model("TeamDetail",teamDetailSchema)