const mongoose = require("mongoose")

 const userSchema=new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    is_admin:{
        type:Number,
        default:0
    },
    is_verified:{
        type:Boolean,
    },
    is_blocked:{
        type:Boolean,
    }
})

module.exports=mongoose.model('user',userSchema)