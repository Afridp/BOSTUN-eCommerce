const couponModel = require('../models/couponModel')



const loadCoupon = async(req,res)=>{
    try {
        let coupon = await couponModel.find();
        res.render('coupon',{coupon})
        
    } catch (error) {
        console.log(error.message);
    }
}


const addCouponLoad = async(req,res)=>{
    try {
        let {message} = req.session
        req.session.message= ''
        res.render('addCoupon',{message})
    } catch (error) {
        console.log(error.message);
    }
}

const postCoupon = async(req,res)=>{
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
    } catch (error) {
        console.log(error.message);
    }
}

const couponRemove = async(req,res)=>{
    try {
        const { couponId } = req.body
                await couponModel.findByIdAndDelete(couponId)

               res.json( { success : "hai"  })

    } catch (error) {
        console.log(error.message);
    }
}
module.exports={
    loadCoupon,
    addCouponLoad,
    postCoupon,
    couponRemove


}