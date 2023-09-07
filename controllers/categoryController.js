
const catModel = require('../models/categoryModel')
const offerModel = require('../models/offerModel')


const loadCategories = async (req, res) => {
    try {
        let message = req.session.message
        req.session.message = ""
        // console.log(message);
        let categories = await catModel.find().populate('offer')
        const availableOffers = await offerModel.find({ expiryDate : { $gte : new Date() }})
        
        res.render('categories', { message, category: categories ,availableOffers})
    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async (req, res) => {

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
    } catch (error) {
        console.log(error.message)
        res.redirect("/error500")
    }
}


const listingCategory = async (req, res) => {
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
    } catch (error) {
        console.log(error.message)
    }
}

const editCategory = async(req,res)=>{
    try {
        const {id} = req.query
        let category = await catModel.findById({_id:id})
        res.render('editCategory',{category})
    } catch (error) {
        console.log(error.message);
    }
}

const updateCategory = async(req,res)=>{
    try {
        const { id, category_name, category_description } = req.body

        const updatedCategory = await catModel.findByIdAndUpdate(
          { _id: id },
          { $set: { name: category_name, description: category_description } }
        )
        await updatedCategory.save();
        
        res.redirect("/admin/categories");

    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    
    loadCategories,
    addCategory,
    listingCategory,
    editCategory,
    updateCategory
}