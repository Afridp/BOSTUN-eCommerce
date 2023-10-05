const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');


const orders = async (req, res,next) => {
    try {
        const { userid } = req.session;

        // let currentDateObj = new Date();
        // currentDateObj.setDate(currentDateObj.getDate());
        // const currentDate = currentDateObj.toLocaleString("en-IN", {
        //     weekday: "long",
        //     year: "numeric",
        //     month: "long",
        //     day: "numeric",
        //     hour: "numeric",
        //     minute: "numeric",
        //     timeZone: "Asia/Kolkata",
        // });
     
        let currentPage = 'profile'
        const user = await userModel.findById({ _id: userid })
        const orders = await orderModel.find({ user: userid })
            .populate("items")
            .populate("user")

            // .sort({ createdAt: -1 });

        res.render("orders", { orders,user,userid,currentPage });
    } catch (err) {
       next(err)
    }
};

const viewOrdered = async (req, res,next) => {
  try {
    const { userid } = req.session;
    const { id } = req.query;
    let currentPage = ''
    const user = await userModel.findById({ _id: userid })
    const order = await orderModel.findById({ _id: id })
      .populate("user")
      .populate("items.product_Id");
    res.render("viewOrdered", { order: order,user,userid,currentPage });
  } catch (err) {
    next(err)
  }
};

// ADMIN SIDE

const adminOrder = async (req,res,next)=>{
    try {
        const orders = await orderModel.find().populate("user")
    
        const hasCancelReasonAndNotForCancellation = orders.some(order => order.cancelReason !== undefined && order.status === 'req:Canceled');
console.log(hasCancelReasonAndNotForCancellation);
        res.render('orders',{orders,hasCancelReasonAndNotForCancellation})
    } catch (err) {
        next(err)
    }
}

const changeStatus = async (req, res,next) => {
    try {
      const { status, orderId } = req.body;
    //   const currentDate = new Date();
    //   currentDate.setDate(currentDate.getDate() + 10);
    //   const dateInTenDays = currentDate.toLocaleString("en-IN", {
    //     weekday: "long",
    //     year: "numeric",
    //     month: "long",
    //     day: "numeric",
    //     hour: "numeric",
    //     minute: "numeric",
    //     timeZone: "Asia/Kolkata",
    //   });
    //   if (status === "Delivered") {
    //     await Order.updateOne(
    //       { _id: orderId },
    //       { $set: { orderStatus: status, expiredDate: dateInTenDays } }
    //     );
    //   } else
    //    {
        await orderModel.updateOne(
          { _id: orderId },
          { $set: { status: status } }
        );
      
      res.status(201).json({ success: true });
    } catch (err) {
      next(err)
    }
  };

const orderItems = async(req,res,next)=>{
    try {
       const {id} = req.query
       
       const order = await orderModel.findById({_id:id}).populate('user').populate('items.product_Id')

    res.json({success:true,order})

    } catch (err) {
        next(err)
    }
}

module.exports ={
    orders,
    adminOrder,
    changeStatus,
    orderItems,
    viewOrdered
}