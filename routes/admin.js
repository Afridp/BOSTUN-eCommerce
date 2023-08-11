const express = require('express')
const admin_router = express()
const adminController = require("../controllers/adminController")
const categoryController = require("../controllers/categoryController")
const productController = require("../controllers/productController")
const isAdminLogin = require("../middleware/adminSession")
const upload = require("../middleware/uploadImage");






admin_router.set('views', './views/admin')

/* GET users listing. */


// login and dashboard manage
admin_router.get('/',adminController.loadLogin)

admin_router.post('/',adminController.verifyLogin)

admin_router.get('/dashboard',isAdminLogin,adminController.loadDashboard)

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

admin_router.post('/addProduct',isAdminLogin,upload.array("product_img",4),productController.addProduct)

admin_router.get('/productEdit',isAdminLogin,productController.editProduct)

admin_router.post('/productEdit',isAdminLogin,upload.array("product_img",4),productController.productEditUpdated)

admin_router.patch('/listProduct',isAdminLogin,productController.listProduct)



module.exports =  admin_router


