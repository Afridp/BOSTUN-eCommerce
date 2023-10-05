const couponModel = require('../models/couponModel')



const loadCoupon = async(req,res,next)=>{
    try {
        let coupon = await couponModel.find();
        res.render('coupon',{coupon})
        
    } catch (err) {
        next(err)
    }
}


const addCouponLoad = async(req,res,next)=>{
    try {
        let {message} = req.session
        req.session.message= ''
        res.render('addCoupon',{message})
    } catch (err) {
        next(err)
    }
}

const postCoupon = async(req,res,next)=>{
    try {
        const {name,couponCode,couponDescription,couponCount,discountAmount} = req.body
        
        const couponExist = await couponModel.findOne({ name : name })

        if( couponExist ) {
            req.session.message='coupon already exist'
            res.redirect('/admin/coupon')
        }else{
         const coupon = new couponModel({
            name : name,
            code : couponCode, 
            description : couponDescription,
            availabilty : couponCount,
            value : discountAmount,
            status : true
            // search : search,
            // page : page
         }) 
         await coupon.save()
         req.session.message="saved" 
         res.redirect('/admin/addCoupon')
        }
    } catch (err) {
        next(err)
    }
}

const couponRemove = async(req,res,next)=>{
    try {
        const { couponId } = req.body
                await couponModel.findByIdAndDelete(couponId)

               res.json( { success : "hai"  })

    } catch (err) {
        next(err)
    }
}
module.exports={
    loadCoupon,
    addCouponLoad,
    postCoupon,
    couponRemove


}