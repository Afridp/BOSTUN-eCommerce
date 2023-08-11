const mongoose = require("mongoose");


const cartSchema = new mongoose.Schema({

    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required : true
    },

    items : [{
        product_Id : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Product',
            required : true
        },

        quantity : {
            type : Number,
            default : 1
        },

        price : {
            type : Number,
            required: true
        },

        totalPrice : {
            type : Number,
            required : true
        }
    }]
})

module.exports = mongoose.model('Cart' , cartSchema)