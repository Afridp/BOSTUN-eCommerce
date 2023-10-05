
const mongoose = require('mongoose')
const { array } = require('../middleware/uploadImage')

const orderSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

    deliveryAddress: {
        type: String,
        required: true
    },

    userName: {
        type: String,
        required: true
    },

    totalAmount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        required: true
    },

    date: {
        type: String,
        required: true
    },

    payment: {
        type: String,
        required: true
    },

    expectedDelivery : {
        type : Date,
        required : true
    },
    
    paymentId : {
        type : String
    },

    items: [{
        product_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },

        quantity: {
            type: Number,
            required: true
        },
        color : {
            type :Array,
            required: true
        },
        size : {
            type : Array,
            required : true
        },

        price: {
            type: Number,
            required: true
        },

        totalPrice: {
            type: Number,
            required: true
        },

        status : {
            type : String,
            default : 'processing'
        },

        // cancelReason : {
        //     type : String
        // },

        // returnReason : {
        //     type : String
        // }

    }],
    total:{
        type:Number
    },
    cancelReason: {
        type: String,
      },

},
{timestamps:true})

module.exports = mongoose.model('order', orderSchema)