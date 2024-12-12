const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const catModel = require('../models/categoryModel')
const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');
const offerModel = require('../models/offerModel')

const offerPage  = async (req,res,next)=>{
    try {
        let {message} = req.session
        req.session.message= ''
      
         res.render('addOffer',{message})
    } catch (err) {
        next(err)
    }
}

const addOffer = async(req,res,next)=>{
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
    } catch (err) {
        next(err)
    }
}

const applyProductOffer = async  (req,res,next) => {
    try {

        const { offerId, productId } = req.body
        await productModel.updateOne({ _id : productId },{
            $set : {
                offer : offerId
            }
        })
         await productModel.find({_id:productId})

        res.json({ success : true})
    } catch (err) {
        next(err)

    }
}

const removeProductOffer = async(req,res,next)=>{
    try {
        const { productId } = req.body
             await productModel.updateOne({ _id : productId },{
                $unset : {
                    offer : ""
                }
            })
            res.json({ success : true })
    } catch (err) {
        next(err)
    }
}

const applycategoryOffer = async(req,res,next)=>{
    try {
        const {offerId,categoryId}=req.body
        await catModel.updateOne({_id:categoryId },{
            $set:{
                offer:offerId
            }
        })
        res.json({success:true})

    } catch (err) {
        next(err)
    }
}

const removeCategoryOffer = async(req,res,next)=>{
    try {
        const { categoryId } = req.body
             await catModel.updateOne({ _id : categoryId },{
                $unset : {
                    offer : ""
                }
            })
            res.json({ success : true })
    } catch (err) {
        next(err)
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