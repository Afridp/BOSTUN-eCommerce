const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');
const razorpay =  require('razorpay')
const dotenv = require('dotenv')
dotenv.config()


 var instance = new razorpay({
    key_id: process.env.razorpay_id_key,
    key_secret:process.env.razorpay_secret_key
 })

const loadEditAddAddress = async (req, res) => {
    try {

        const { userid } = req.session;
        const { addressId } = req.query;

        const user = await userModel.findOne({ _id: userid });

        const userAddress = await userModel.findOne(
            { _id: userid },
            { address: { $elemMatch: { _id: addressId } } }
        );
        res.render('checkoutEditAddress', { userAddress: userAddress, userid, user })

    } catch (error) {
        console.log(error.message);
    }
}


const postEditCheckAddress = async (req, res) => {
    try {
        const { userid } = req.session;
        // const user = await userModel.findOne({ _id: userid })
        const { id, name, housename, city, state, pincode, phone } = req.body;
        await userModel.updateOne(
            { _id: userid, "address._id": id },
            {
                $set: {
                    "address.$.name": name,
                    "address.$.housename": housename,
                    "address.$.city": city,
                    "address.$.state": state,
                    "address.$.pincode": pincode,
                    "address.$.phone": phone,
                },
            }
        )
        res.redirect("/checkout");
    } catch (error) {
        console.log(error.message);
    }
}



const placeOrder = async (req, res) => {
    try {


        const bodyaddress = req.body.selectedAddress
        const total = req.body.total
        const payment = req.body.payment
        const userid = req.session.userid


        let status = payment == 'cod' ? 'placed' : 'pending'


        const user = await userModel.findOne({ _id: userid })
        const cartData = await cartModel.findOne({ userId: userid })

        const cartProducts = cartData.items
       
          
        const date = new Date ()
        const orderDate = date.toLocaleString()
        console.log(orderDate);
     
        const delivery = new Date(date.getTime() + (10 * 24 * 60 * 60 * 1000));

        const deliveryDate = delivery.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).replace(/\//g, '-');

        const order = new orderModel({
            user: userid,
            deliveryAddress: bodyaddress,
            userName: user.name,
            totalAmount: total,
            status: status,
            date: orderDate,
            payment: payment,
            items: cartProducts,
            expectedDelivery: deliveryDate
        })

        const orderData = await order.save()
        const orderid = orderData._id

        if (orderData.status === 'placed') {
            await cartModel.deleteOne({ userId: req.session.userid })
            //    await Coupon.findOneAndUpdate({ code: code }, { $push: { user: req.session.user_id } });

            for (let i = 0; i < cartProducts.length; i++) {
                const product_Id = cartProducts[i].product_Id
                const count = cartProducts[i].quantity

                await productModel.findByIdAndUpdate({ _id: product_Id }, { $inc: { quantity: -count } })
            }

            res.json({ success: true, params: orderid })
        } else {

            const orderid = orderData._id
            const total = orderData.totalAmount
            
            var options = {
                amount: total * 100,
                currency: 'INR',
                receipt: '' + orderid,
            };
            
            console.log(options);
            instance.orders.create(options, function (err, order) {

               return res.json({ success:false ,order:order });

            })
        }
    } catch (error) {
        console.log(error.message)
    }

}

const verifyPayment = async(req,res)=>{
    try {
        const userData = await userModel.findOne({_id:req.session.userid})
        const cartData = await cartModel.findOne({userId:req.session.userid})
        const cartProducts = cartData.items

        const details = req.body
        const crypto = require('crypto')

        let HMAC = crypto.createHmac('sha256',process.env.razorpay_secret_key)
        HMAC.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)
        const HMAC_FORMAT = HMAC.digest('hex')

        if(HMAC_FORMAT == details.payment.razorpay_signature){
            await orderModel.findByIdAndUpdate({_id : details.order.receipt},{$set:{paymentId:details.payment.razorpay_payment_id}})

            // managing stack
            for(let i=0;i< cartProducts.length;i++){
                const productId = cartProducts[i].product_Id
                const count = cartProducts[i].quantity
                await productModel.findByIdAndUpdate({_id :productId },{$inc:{quantity :-count }})
            }

            await orderModel.findByIdAndUpdate({ _id: details.order.receipt }, { $set: { status: "placed" } })
            await cartModel.deleteOne({userId :userData._id})
            // use coupon here 
            res.json({success:true, params:details.order.receipt  })

        }else{
            await orderModel.deleteOne({ _id: details.order.receipt });
            res.json({ success: false }); 
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadOrderPlaced = async (req, res) => {
    try {
        const userid = req.session.userid
        const id = req.params.id
        const order = await orderModel.findOne({ _id: id }).populate('items.product_Id')
        const user = await userModel.findOne({ _id: userid })
        res.render('orderPlaced', { userid: req.session.userid, order: order, user })

    } catch (error) {
        console.log(error.message)
    }
}
module.exports = {
    loadEditAddAddress,
    postEditCheckAddress,
    placeOrder,
    loadOrderPlaced,
    verifyPayment
}  