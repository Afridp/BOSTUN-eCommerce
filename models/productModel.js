const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  size:{
    type:Array
  },
  color:{
    type : Array
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  image: {
    type: Array,
    required: true,
  },
  stock: {
    type:Number,
    required : true
  },
  list: {
    type: Boolean,
    default: true,
    required: true,
  },
  offer:{
    type : mongoose.Schema.Types.ObjectId,
    ref:"offer"
  }

})

module.exports = mongoose.model("Product", productSchema)
