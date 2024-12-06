import mongoose from "mongoose";

const eventSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    slug:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    info:{
        type:String
    },
    tagline:{
        type:String
    },
    TS:{
        type:String
    },
    poster:{
        type:String,
        default:""
    },
    session:{
        type:String
    },
    winners:[
        {
            type:String
        }
    ],
    rules:[
        {
            type:String
        }
    ],
    instagram_post:[
        {
            type:String
        }
    ]

},{timestamps:true})

export const Event=mongoose.model("Event",eventSchema)