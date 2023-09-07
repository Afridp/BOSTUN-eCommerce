const mongoose = require("mongoose")

let categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  list: {
    type: Boolean,
    default: true,
    required: true,
  },
  offer : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'offer'
}
})

module.exports = mongoose.model("Category", categorySchema)