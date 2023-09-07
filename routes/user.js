const express = require('express');
const user_router = express()
const userController=require('../controllers/userController')
const cartController = require('../controllers/cartController')
const checkoutController = require('../controllers/checkoutController')
const orderController = require('../controllers/orderController')
const auth = require('../middleware/userSession') 






// view engine setup

user_router.set('views', './views/user');


/* GET home page. */
user_router.get('/',userController.homeLoad)

user_router.get('/shop',userController.shopLoad)

user_router.post('/shop',userController.shopLoad)

user_router.get('/login',auth.isLogout,userController.loginLoad)

user_router.post('/login',auth.isLogout,userController.verifyLogin)

user_router.get('/logout',userController.loadLogout)

user_router.get('/register',userController.loadRegister)

user_router.post('/register',userController.postRegister)

user_router.get('/emailVerificationpage',userController.emailVerificationPage)

user_router.post('/emailVerification',userController.emailVerification)

user_router.get('/productDetails',userController.showProductDetails)

user_router.get('/profile',auth.isLogin,userController.loadProfile)

user_router.get('/manageAddress',auth.isLogin,userController.manageAddress)

user_router.get('/addAddress',auth.isLogin,userController.addAddress)

user_router.post('/addAddress',auth.isLogin,userController.postAddress)

user_router.get('/editAddress',auth.isLogin,userController.editaddress)

user_router.post('/editAddress',auth.isLogin,userController.updateAddress)

user_router.put('/deleteAddress',auth.isLogin,userController.deleteAddress)

user_router.get('/editProfile',auth.isLogin,userController.editProfile)

user_router.post('/editProfile',auth.isLogin,userController.updateProfile)

user_router.get('/changePassword',auth.isLogin,userController.changePassword)

user_router.post('/changePassword',auth.isLogin,userController.updatePassword)



user_router.get('/lostPassEmailPage',userController.lostPassEmailPage)

user_router.post('/forgetPassPostEmail',userController.forgetPassSendOtp)

user_router.get('/forgPassOtpEnter',userController.forgetPassOtpEnterPage)

user_router.post('/forgetPassOtpVerification',userController.postForgetPassOtpVerify)

user_router.post('/newPasswordSubmit',userController.updateNewPassword)



user_router.get('/loadCart',auth.isLogin,cartController.loadCart)

user_router.post('/addToCart',auth.isLogin,cartController.addToCart)

user_router.post('/deleteItems',auth.isLogin,cartController.deleteItems)

user_router.get('/checkout',auth.isLogin,cartController.loadCheckout)

user_router.post('/checkout',auth.isLogin,checkoutController.placeOrder)

user_router.post('/verifyPayment',checkoutController.verifyPayment)  

user_router.post('/changes',auth.isLogin,cartController.qtyChanges)


user_router.get('/check-edit-address',auth.isLogin,checkoutController.loadEditAddAddress)

user_router.post('/postCheckEditAddress',auth.isLogin,checkoutController.postEditCheckAddress)

user_router.get('/order-placed/:id',auth.isLogin, checkoutController.loadOrderPlaced)

user_router.get('/orders',orderController.orders)

user_router.get('/viewOrdered',orderController.viewOrdered)


module.exports = user_router;
