const productModel = require('../models/productModel')
const catModel = require('../models/categoryModel')
const path = require('path')
const sharp = require('sharp')

const loadProducts = async (req, res) => {
    try {
        
        const product = await productModel.find().populate("category")

        res.render('products', { product })
    } catch (error) {
        console.log(error.message);
    }
}

const addProductPage = async (req, res) => {
    try {
        let message = req.session.message
        req.session.message = ""
        const categories = await catModel.find()
        // console.log(categories);
        res.render('addProduct', { categories,message })
    } catch (error) {
        console.log(error.message);
    }
}

const addProduct = async (req, res) => {
    try {
        const {
            product_name,
            product_description,
            product_price,
            product_quantity,
            product_category,
        } = req.body

        const existingProduct = await productModel.findOne({

            name: { $regex: new RegExp(`^${product_name}$`, "i") }

        })
        if (!existingProduct) {


            let imageArr = []

            if (req.files && req.files.length > 0) {

                for (let i = 0; i < req.files.length; i++) {

                    const filePath = path.join(__dirname, "../public/images", req.files[i].filename);

                    await sharp(req.files[i].path)

                        .resize({ width: 250, height: 250 })

                        .toFile(filePath);

                    imageArr.push(req.files[i].filename);
                }
            }

            const product = new productModel({
                name: product_name,
                description: product_description,
                price: product_price,
                quantity: product_quantity,
                category: product_category,
                image: imageArr,
                stock: true,
            })
            await product.save()
            res.redirect('/admin/products')
        } else {
            req.session.message = "this product is already exist"
            res.redirect('/admin/addProduct')
        }

    } catch (error) {
        console.log(error.message);
    }
}

const listProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await productModel.findById({ _id: productId })

        if (product.list === true) {

            await productModel.updateOne({ _id: productId }, { $set: { list: false } });

            res.status(201).json({ unlistSuccess: true });
        } else {

            await productModel.updateOne({ _id: productId }, { $set: { list: true } });

            res.status(201).json({ listSuccess: true });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const editProduct = async (req, res) => {
    try {
        const { id } = req.query

        const product = await productModel.findById({ _id: id });
        const category = await catModel.find();
        // console.log(category);
        res.render("editProduct", {
            product_id: id,
            categories: category,
            product,
        })

    } catch (error) {
        console.log(error.message);
    }
}


const productEditUpdated = async (req, res) => {
    try {
        console.log("haaaa");
        const {
            product_id,
            product_name,
            product_quantity,
            product_price,
            product_category,
            product_description,
        } = req.body;
        console.log(product_name);
        
            let imageArra = [] 

        if (req.files && req.files.length > 0) {

            for (let i = 0; i < req.files.length; i++) {

                const filePath = path.join(__dirname,"../public/images",req.files[i].filename)

                await sharp(req.files[i].path)
                    .resize({ width: 250, height: 250 })
                    .toFile(filePath);
                imageArra.push(req.files[i].filename);
            }
        }
        console.log(imageArra);

        if (req.files.length) {
            await productModel.findByIdAndUpdate(
                { _id: product_id },
                {
                    $set: {
                        name: product_name,
                        price: product_price,
                        quantity: product_quantity,
                        category: product_category,
                        description: product_description,
                        image: imageArra,
                    }
                })
            res.redirect("/admin/products");
        } else {
            await productModel.findByIdAndUpdate(
                { _id: product_id },
                {
                    $set: {
                        name: product_name,
                        quantity: product_quantity,
                        price: product_price,
                        description: product_description,
                        category: product_category,
                    }
                }
            )
            res.redirect("/admin/products");
            }
    } catch (error) {
        console.log(error.message);;
    }

}



module.exports = {
    loadProducts,
    addProductPage,
    addProduct,
    editProduct,
    listProduct,
    productEditUpdated
}




