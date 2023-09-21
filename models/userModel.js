const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  mobile: {
    type: Number,
    required: true
  },
  is_admin: {
    type: Number,
    default: 0
  },
  is_verified: {
    type: Boolean,
  },
  is_blocked: {
    type: Boolean,
  },


  
  address: [
    {
      name: {
        type: String,
      },
      housename: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      phone: {
        type: Number,
      },
      pincode: {
        type: Number,
      },
    },
  ],
  wallet: {
    type: Number,
    default: 0,
  }
},
  {timestamps:true},
)

module.exports = mongoose.model('user', userSchema)