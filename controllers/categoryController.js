
const catModel = require('../models/categoryModel')
const offerModel = require('../models/offerModel')


const loadCategories = async (req, res,next) => {
    try {
        let message = req.session.message
        req.session.message = ""
        // console.log(message);
        let categories = await catModel.find().populate('offer')
        const availableOffers = await offerModel.find({ expiryDate : { $gte : new Date() }})
        
        res.render('categories', { message, category: categories ,availableOffers})
    } catch (err) {
        next(err)
    }
}

const addCategory = async (req, res,next) => {

    try {
        const { category_name, category_description } = req.body
        // console.log(category_name);
        const existingCategory = await catModel.findOne({

            // name: { $regex: `^${category_name}$`, $options:"i" },
            name: { $regex: new RegExp(`^${category_name}$`, "i") }
        })
        // console.log(existingCategory);

        if (!existingCategory) {
            const categ = new catModel({
                name: category_name,
                description: category_description,
            })

            await categ.save()
            res.redirect("/admin/categories")

        } else {

            req.session.message = "This category is already Exist"
            res.redirect("/admin/categories")
        }
    } catch (err) {
        next(err)
        res.redirect("/error500")
    }
}


const listingCategory = async (req, res,next) => {
    try {
        const { categoryId } = req.body

        const category = await catModel.findById({ _id: categoryId })

        if (category.list === true) {

            await catModel.updateOne({ _id: categoryId }, { $set: { list: false } })
            res.status(201).json({ message: true })

        } else {

            await catModel.updateOne({ _id: categoryId }, { $set: { list: true } })
            res.status(201).json({ message: false });
        }
    } catch (err) {
        next(err)
    }
}

const editCategory = async(req,res,next)=>{
    try {
        const {id} = req.query
        let category = await catModel.findById({_id:id})
        res.render('editCategory',{category})
    } catch (err) {
        next(err)
    }
}

const updateCategory = async(req,res,next)=>{
    try {
        const { id, category_name, category_description } = req.body

        const updatedCategory = await catModel.findByIdAndUpdate(
          { _id: id },
          { $set: { name: category_name, description: category_description } }
        )
        await updatedCategory.save();
        
        res.redirect("/admin/categories");

    } catch (err) {
        next(err)
    }
}



module.exports = {
    
    loadCategories,
    addCategory,
    listingCategory,
    editCategory,
    updateCategory
}