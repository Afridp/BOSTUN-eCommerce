const express = require('express')
const admin_router = express()
const adminController = require("../controllers/adminController")
const categoryController = require("../controllers/categoryController")
const productController = require("../controllers/productController")
const upload = require("../middleware/uploadImage");
const session = require("express-session")




admin_router.set('view engine', 'ejs')
admin_router.set('views', './views/admin')

/* GET users listing. */

// login and dashboard manage
admin_router.get('/',adminController.loadLogin)

admin_router.post('/',adminController.loadDashboard)

// user mange
admin_router.get('/users',adminController.loadUsers)

admin_router.patch('/userBlocked',adminController.usersBlocked)

// cetegory manage 
admin_router.get('/categories',categoryController.loadCategories)
 
admin_router.post('/categories',categoryController.addCategory)

admin_router.patch('/listCategory',categoryController.listingCategory)

admin_router.get('/editCategory',categoryController.editCategory)

admin_router.post('/editCategory',categoryController.updateCategory)

// product mange
admin_router.get('/products',productController.loadProducts)

admin_router.get('/addProduct',productController.addProductPage)

admin_router.post('/addProduct',upload.array("product_img",4),productController.addProduct)

admin_router.get('/productEdit',productController.editProduct)

admin_router.post('/productEdit',upload.array("product_img",4),productController.productEditUpdated)

admin_router.patch('/listProduct',productController.listProduct)



module.exports =  admin_router


