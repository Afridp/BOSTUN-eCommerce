const mongoose = require( 'mongoose' ) 

const Schema = mongoose.Schema


const couponSchema = Schema({
    name : {
        type : String,
        required : true
    },

    code: {
        type : String,
        required : true
    },
    description: {
        type : String,
        required : true
    },
    availabilty: {
        type : Number,
        required : true
    },
    value : {
        type : Number,
        required : true
    },
    status : {
        type : Boolean, 
        default : true
    }

})


module.exports = mongoose.model('coupon', couponSchema )