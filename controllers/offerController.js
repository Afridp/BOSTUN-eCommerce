const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const catModel = require('../models/categoryModel')
const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');
const offerModel = require('../models/offerModel')

const offerPage = async (req,res)=>{
    try {
        let {message} = req.session
        req.session.message= ''
      
         res.render('addOffer',{message})
    } catch (error) {
        console.log(error.message);
    }
}

const addOffer = async(req,res)=>{
    try {
        const {name,startingDate,expiryDate,percentage} = req.body

        const offerExist = await offerModel.findOne({ name : name })

        if( offerExist ) {
            req.session.message='offer already exist'
            res.redirect('/admin/offers')
        }else{
         const offer = new offerModel({
            name : name,
            startingDate : startingDate, 
            expiryDate : expiryDate,
            percentage : percentage,
            // search : search,
            // page : page
         }) 
         await offer.save()
         req.session.message="saved"
         res.redirect('/admin/offers')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const applyProductOffer = async  (req,res) => {
    try {

        const { offerId, productId } = req.body
        await productModel.updateOne({ _id : productId },{
            $set : {
                offer : offerId
            }
        })
         await productModel.find({_id:productId})

        res.json({ success : true})
    } catch (error) {
        console.log(error.message);

    }
}

const removeProductOffer = async(req,res)=>{
    try {
        const { productId } = req.body
             await productModel.updateOne({ _id : productId },{
                $unset : {
                    offer : ""
                }
            })
            res.json({ success : true })
    } catch (error) {
        console.log(error.message);
    }
}

const applycategoryOffer = async(req,res)=>{
    try {
        const {offerId,categoryId}=req.body
        await catModel.updateOne({_id:categoryId },{
            $set:{
                offer:offerId
            }
        })
        res.json({success:true})

    } catch (error) {
        console.log(error.message);
    }
}

const removeCategoryOffer = async(req,res)=>{
    try {
        const { categoryId } = req.body
             await catModel.updateOne({ _id : categoryId },{
                $unset : {
                    offer : ""
                }
            })
            res.json({ success : true })
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    offerPage, // export the function to be used in other files
    addOffer,
    applyProductOffer,//export the function for applying offers on products,
    removeProductOffer,
    applycategoryOffer,
    removeCategoryOffer


}