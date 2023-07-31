const express = require('express');
const user_router = express()
const userController=require('../controllers/userController')
const session=require('express-session')
const auth = require('../middleware/auth')
const config = require("../config/config")


user_router.use(
  session({
      secret:config.sessionSecret,
      saveUninitialized:true,
      resave:true
  })
)

// view engine setup
user_router.set('view engine', 'ejs')
user_router.set('views', './views/user');


/* GET home page. */
user_router.get('/',userController.homeLoad)

user_router.get('/shop',userController.shopLoad)

user_router.get('/login',userController.loginLoad)

user_router.post('/login',userController.verifyLogin)

user_router.get('/register',userController.loadRegister)

user_router.post('/register',userController.postRegister)

user_router.get('/emailVerificationpage',userController.emailVerificationPage)

user_router.post('/emailVerification',userController.emailVerification)

user_router.get('/productDetails',userController.showProductDetails)

module.exports = user_router;
