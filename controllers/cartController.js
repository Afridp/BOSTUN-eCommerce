const userModel = require('../models/userModel')
const catModel = require('../models/categoryModel')
const productModel = require('../models/productModel')
const cartModel = require('../models/cartModel')
const mongoose = require('mongoose')


const loadCart = async (req, res) => {
    try {
        const { userid } = req.session
       
        const user = await userModel.findById({ _id: userid })


        const cartData = await cartModel.findOne({ userId: user }).populate(
            "items.product_Id"
        );

        let total = 0

        if (cartData) {
            cartData.items.forEach((product) => {
                total = total + product.price * product.quantity
            })
        }

        res.render('shoppingCart', { user, userid, cartData, total })
    } catch (error) {
        console.log(error.message);
    }
}

const addToCart = async (req, res) => {
    try {
        const { productId } = req.body
        const { userid } = req.session

        const product = await productModel.findOne({ _id: productId })

        const cart = await cartModel.findOne({ userId: userid })
        // checking that this user has cart 

        if (cart) {

            const existProduct = cart.items.find((x) => x.product_Id.toString() === productId)

            if (existProduct) {

                await cartModel.findOneAndUpdate({ userId: userid, 'items.product_Id': productId },
                    {
                        $inc: {
                            'items.$.quantity': req.body.quantity,
                            'items.$.totalPrice': req.body.quantity * product.price

                        }
                    }
                )
            } else {
                const total = req.body.quantity * product.price
                await cartModel.findOneAndUpdate({ userId: userid },
                    {
                        $push: {
                            items: {
                                product_Id: req.body.productId,
                                quantity: req.body.quantity,
                                price: product.price,
                                totalPrice: total
                            }
                        }
                    }
                )
            }

        } else {
            // don't have cart so we create
            const total = req.body.quantity * product.price
            const cartData = new cartModel({
                userId: req.session.userid,
                items: [{
                    product_Id: new mongoose.Types.ObjectId(productId),
                    quantity: req.body.quantity,
                    price: product.price,
                    totalPrice: total
                }]
            })

            await cartData.save()
        }
        res.json({ success: true })
    } catch (error) {
        console.log(error.message);
    }
}


const deleteItems = async (req, res) => {
    try {
        const { userid } = req.session
        const { productId } = req.body
        const userCart = await cartModel.findOne({ userId: userid })

        if (userCart.items.length === 1) {
            await cartModel.deleteOne({ userId: userid })
        } else {
            await cartModel.updateOne({ userId: userid },
                {
                    $pull: {
                        items: { _id: productId }
                    }
                })
        }
        res.json({ success: true })
    } catch (error) {
        console.log(error.message);
    }
}

const loadCheckout = async (req, res) => {
    try {
        const { userid } = req.session;
        // const moment = require("moment");
        req.session.couponApplied = false;
        req.session.discountAmount = 0;
        const currentDate = new Date();
        req.session.message = "";
        const cart = await cartModel.findOne({ userId: userid }).populate(
            "items.product_Id"
        );
        let total = 0;
        let grandTotal = 0;

        if (cart) {
                cart.items.forEach((product) => {
                total = total + product.price * product.quantity;
                grandTotal = grandTotal + product.price * product.quantity;
            })
        }
        const coupon = null
        // await Coupon.find({
        //     expireDate: { $gte: new Date(currentDate) },
        // });
        const user = await userModel.findOne({ _id: userid });
        res.render("checkout", {
            address: user,
            cart: cart,
            coupon: coupon,
            // wallet: user.wallet,
            currentDate: currentDate,
            // moment: moment,
            userid,user,grandTotal,total
        });
    } catch (error) {
        console.log(error.message);
    }
 };



module.exports = {
    loadCart,
    addToCart,
    deleteItems,
    loadCheckout
}