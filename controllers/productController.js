const productModel = require('../models/productModel')
const catModel = require('../models/categoryModel')
const offerModel = require('../models/offerModel')

const path = require('path')
const fs = require('fs');
// const fs = require('file-system')
const sharp = require('sharp')
const colorConvert = require('color-convert')
const { log } = require('console')

const loadProducts = async (req, res, next) => {
    try {
        if (req.session.product_Id) {
            delete req.session.product_Id
        }

        const product = await productModel.find().populate("category").populate('offer')
        const availableOffers = await offerModel.find({ expiryDate: { $gte: new Date() } })

        res.render('products', { product, availableOffers, succ: req.flash('success') })
    } catch (err) {
        next(err)
    }
}

const addProductPage = async (req, res, next) => {
    try {
        let { product_Id } = req.session
        console.log(product_Id,"hjsdafsd");
        if (product_Id) {

            var product = await productModel.findOne({ _id: product_Id })

        }


        const categories = await catModel.find()

        res.render('addProduct', { categories, product })
    } catch (err) {
        next(err)
    }
}

const addProduct = async (req, res, next) => {
    try {
        const {
            product_name,
            product_description,
            product_price,
            product_quantity,
            product_category,
            product_color,
            product_size,
        } = req.body

        const existingProduct = await productModel.findOne({

            name: { $regex: new RegExp(`^${product_name}$`, "i") }

        })
        if (!existingProduct) {


            const product = new productModel({
                name: product_name,
                description: product_description,
                price: product_price,
                quantity: product_quantity,
                category: product_category,
                color: product_color,
                size: product_size,
                // image: imageArr,
                stock: true,
                list: false
            })
            await product.save()            // res.redirect('/admin/products')s
            req.session.productId = product._id
            res.status(200).json({ productId: product._id });
        } else {
            res.status(400).json({ message: "This product already exists." });
        }
    } catch (err) {
        next(err)
    }
}


const addImages = async (req, res, next) => {
    try {
        let { productId } = req.query

        res.render('imageAdd', { productId })
    } catch (err) {
        next(err)
    }
}


const imageCropped = async (req, res, next) => {
    try {
        let { dataUrl, product_Id } = req.body
        const product = await productModel.findOne({ _id: product_Id });
        const imageCount = product.image.length;

        if (imageCount < 4) {
            const imageBuffer = Buffer.from(dataUrl.split(",")[1], 'base64'); // Decode the base64 data
            const uniqueFileName = `${Date.now()}_image.jpg`;
            const imagePath = path.join(__dirname, '../public/images', uniqueFileName);
            fs.writeFileSync(imagePath, imageBuffer);
            const filename = path.basename(imagePath);

            await productModel.findByIdAndUpdate(
                { _id: product_Id },
                {
                    $push: {
                        image: filename
                    }
                }
            );
            req.session.product_Id = product_Id
            res.status(200).json({ message: "Image saved successfully" });
        } else {
            req.session.product_Id = product_Id
            res.status(400).json({ message: "Only four images allowed" })
        }
        console.log("haaaaaijkdsfnsakjdfn");


    } catch (err) {
        next(err)
    }
}


const errorImage = async (req, res, next) => {
    try {
        res.render('imageOnlyAllowed')
    } catch (err) {
        next(err)
    }
}



const addAndListProduct = async (req, res, next) => {
    try {
        const { product_Id } = req.session
        await productModel.findByIdAndUpdate({ _id: product_Id },

            {
                $set:
                    { list: true }
            })
        req.flash('success', 'Product saved succesfully')
        res.redirect('/admin/products')
    } catch (err) {
        next()
    }
}

const listProduct = async (req, res, next) => {
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
    } catch (err) {
        next(err)
    }
}

const editProduct = async (req, res, next) => {
    try {
        const { id } = req.query

        const product = await productModel.findById({ _id: id }).populate("category")
        const category = await catModel.find();


        res.render("editProduct", {
            product_id: id,
            categories: category,
            product,
        })
 
    } catch (err) {
        next(err)
    }
}


const productEditUpdated = async (req, res, next) => {
    try {

        const {
            product_id,
            product_name,
            product_quantity,
            product_price,
            product_category,
            product_description,
            product_color,
            product_size,
        } = req.body;
        console.log(product_id,
            product_name,
            product_quantity,
            product_price,
            product_category,
            product_description,
            product_color,
            product_size,);
        // console.log(req.files,"this is file");

        // let imageArra = []

        // if (req.files && req.files.length > 0) {

        //     for (let i = 0; i < req.files.length; i++) {

        //         const filePath = path.join(__dirname, "../public/images", req.files[i].filename)

        //         await sharp(req.files[i].path)

        //             .toFile(filePath);
        //         imageArra.push(req.files[i].filename);
        //     }
        // }

        // if (req.files.length) {
        //     await productModel.findByIdAndUpdate(
        //         { _id: product_id },
        //         {
        //             $set: {
        //                 name: product_name,
        //                 price: product_price,
        //                 quantity: product_quantity,
        //                 category: product_category,
        //                 description: product_description,
        //                 size: product_size,
        //                 color: product_color,
        //                 image: imageArra,
        //             }
        //         })
        //     res.redirect("/admin/products");
        // } else/

        await productModel.findByIdAndUpdate(
            { _id: product_id },
            {
                $set: {
                    name: product_name,
                    quantity: product_quantity,
                    price: product_price,
                    description: product_description,
                    category: product_category,
                    size: product_size,
                    color: product_color
                }
            }
        )
        res.redirect("/admin/products");

    } catch (err) {
        next(err)
    }

}

    const deleteImages = async (req, res, next) => {
        try {
            const { img, prdtId } = req.body;
            fs.unlink(path.join(__dirname, "../public/images", img), () => { });
            const deleted = await productModel.updateOne(
                { _id: prdtId },
                { $pull: { image: img } }
            );
            res.send({ success: true })
        } catch (err) {
            res.status(500).send({ success: false, error: err.message });
            console.log(err.message);
        }
    }

    module.exports = {
        loadProducts,
        addProductPage,
        addProduct,
        editProduct,
        listProduct,
        productEditUpdated,
        addImages,
        errorImage,
        imageCropped,
        addAndListProduct,
        deleteImages

    }




