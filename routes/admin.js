const express = require('express')
const admin_router = express()
const adminController = require("../controllers/adminController")
const categoryController = require("../controllers/categoryController")
const productController = require("../controllers/productController")
const orderController = require("../controllers/orderController")
const offerController = require('../controllers/offerController')
const couponController = require('../controllers/couponController')
const bannerController = require('../controllers/bannerController')
const isAdminLogin = require("../middleware/adminSession")
const upload = require("../middleware/uploadImage");
const bannerModel = require('../models/bannerModel')






admin_router.set('views', './views/admin')

/* GET users listing. */


// login and dashboard manage
admin_router.get('/',adminController.loadLogin)

admin_router.post('/',adminController.verifyLogin)

admin_router.get('/logout',adminController.loadLogout)

admin_router.get('/dashboard',isAdminLogin,adminController.loadDashboard)

admin_router.get('/salesReport',isAdminLogin,adminController.salesReport)

admin_router.post('/salesReport',adminController.datePicker)

// user mange
admin_router.get('/users',isAdminLogin,adminController.loadUsers)

admin_router.patch('/userBlocked',isAdminLogin,adminController.usersBlocked)

// cetegory manage 
admin_router.get('/categories',isAdminLogin,categoryController.loadCategories)
 
admin_router.post('/categories',isAdminLogin,categoryController.addCategory)

admin_router.patch('/listCategory',isAdminLogin,categoryController.listingCategory)

admin_router.get('/editCategory',isAdminLogin,categoryController.editCategory)

admin_router.post('/editCategory',isAdminLogin,categoryController.updateCategory)

// product mange
admin_router.get('/products',isAdminLogin,productController.loadProducts)

admin_router.get('/addProduct',isAdminLogin,productController.addProductPage)

admin_router.post('/addProduct',isAdminLogin,productController.addProduct)

admin_router.get('/addImages',isAdminLogin,productController.addImages)

admin_router.post('/addAndListProduct',isAdminLogin,productController.addAndListProduct)

admin_router.get('/productEdit',isAdminLogin,productController.editProduct)

admin_router.post('/uploadCropped',productController.imageCropped)

admin_router.post('/productEdit',isAdminLogin,productController.productEditUpdated)

admin_router.put('/deleteImage',isAdminLogin,productController.deleteImages)

admin_router.patch('/listProduct',isAdminLogin,productController.listProduct)

admin_router.get('/errorPage',productController.errorImage)

// order mange

admin_router.get('/orders',isAdminLogin,orderController.adminOrder)

admin_router.patch('/changeStatus',isAdminLogin,orderController.changeStatus)

admin_router.get('/orderItems',isAdminLogin,orderController.orderItems)

// offer Manage

admin_router.get('/offers',isAdminLogin,offerController.offerPage)

admin_router.post('/addOffer',isAdminLogin,offerController.addOffer)
    
// offer apply

admin_router.patch('/applyProductOffer',offerController.applyProductOffer)

admin_router.patch('/removeProductOffer',offerController.removeProductOffer)

admin_router.patch('/applycategoryOffer',offerController.applycategoryOffer)

admin_router.patch('/removeCategoryOffer',offerController.removeCategoryOffer)

// coupon manage

admin_router.get('/coupon',isAdminLogin,couponController.loadCoupon)

admin_router.get('/addCoupon',isAdminLogin,couponController.addCouponLoad)

admin_router.post('/addCoupon',couponController.postCoupon)

admin_router.patch('/couponRemove',couponController.couponRemove)


// banner management 

admin_router.get('/bannerLoad',isAdminLogin,bannerController.loadBanner)

admin_router.get('/addBanner',isAdminLogin,bannerController.addBanner)

admin_router.patch('/bannerRemove',bannerController.removeBanner)

admin_router.post('/addBanner',upload.array("bannerImage", 1),bannerController.postBanner)

admin_router.get('/bannerEdit',isAdminLogin,bannerController.loadEditBanner)

admin_router.post('/bannerEdit',upload.array("bannerImage",1 ),bannerController.editBanner)


module.exports =  admin_router


