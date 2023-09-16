const userModel = require('../models/userModel')
const catModel = require('../models/categoryModel')
const productModel = require('../models/productModel')
const bannerModel = require('../models/bannerModel')
const dotenv = require('dotenv')
const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer")
const userOtpVerification = require('../models/userOtpVerification')
const { assign } = require('nodemailer/lib/shared')

dotenv.config();

const securePassword = async (password) => {
    try {
        // console.log(password);
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message);

    }
}



const loadRegister = async (req, res) => {
    try {
        let { message } = req.session
        req.session.message = ''
        res.render('registration', { message: message })
    } catch (error) {
        console.log(error.message)

    }

}
const postRegister = async (req, res) => {
    try {

        const existingUser = await userModel.findOne({
            $or: [{ email: req.body.email }, { mobile: req.body.number }]
        });

        if (existingUser) {
            req.session.message = "User already registered";
            res.redirect("/register");
        } else {

            const spassword = await securePassword(req.body.password)
            const user = new userModel({
                name: req.body.name,
                email: req.body.email,
                password: spassword,
                mobile: req.body.mobile,
                is_verified: false,
                is_blocked: false
            })
            const savedata = await user.save();
            if (savedata) {


                let otpVerification = await sendOtpEmailVerification(savedata.email, savedata._id)


                req.session.otpVerification = otpVerification


                res.redirect("/emailVerificationpage");
            } else {
                res.render('registration', { message: "OOps..!Something went wrong.Please Retry" })
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const sendOtpEmailVerification = async (email, user_id) => {

    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: true,
            auth: {
                user: process.env.email_user,
                pass: process.env.email_password
            }
        })
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`
        console.log(otp);

        const mailOptions = {
            from: 'afridp@gmail.com',
            to: email,
            subject: 'Verify Your Email',
            html: `${otp}`
        }

        const hashedOTP = await bcrypt.hash(otp, 10);

        const newVerificationOTP = new userOtpVerification({

            userId: user_id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,

        })

        let verified = await newVerificationOTP.save()

        await transporter.sendMail(mailOptions);

        return verified._id;

    } catch (error) {
        console.log(error.message);
    }
}

const emailVerificationPage = async (req, res) => {
    try {
        const { message, otpVerification } = req.session;
        req.session.otpVerification = null
        req.session.message = ""
        res.render("emailVerification", { message, otp: otpVerification })
    } catch (error) {
        res.redirect(error.message);
    }
}



const emailVerification = async (req, res) => {
    try {
        let { otp, userVerificationId } = req.body;
        let userId = userVerificationId;

        const UserOTPVerificationRecords = await userOtpVerification.find({ _id: userId })

        if (!userId || !otp) {

            await userModel.deleteMany({ _id: UserOTPVerificationRecords[0].userId });

            await userOtpVerification.deleteMany({ _id: userId });

            req.session.message = "Invalid OTP details,please try again";

            res.redirect("/emailVerificationpage");
        } else {

            if (UserOTPVerificationRecords.length <= 0) {
                req.session.message = "Invalid OTP,Please type again";
                res.redirect("/emailVerificationpage");

            } else {

                const { expiresAt } = UserOTPVerificationRecords[0];
                const hashedOTP = UserOTPVerificationRecords[0].otp;

                if (expiresAt < Date.now()) {
                    await userModel.deleteMany({ _id: UserOTPVerificationRecords[0].userId });
                    await userOtpVerification.deleteMany({ _id: userId });

                    req.session.message = "Invalid OTP,Please register again";
                    res.redirect("/register");

                } else {

                    const validOTP = await bcrypt.compare(otp, hashedOTP)


                    if (!validOTP) {
                        await userModel.deleteMany({ _id: UserOTPVerificationRecords[0].userId });

                        req.session.otpVerification = userVerificationId;
                        req.session.message = "Invalid OTP,Please register again";

                        res.redirect("/emailVerification");

                    } else {


                        // const user = await userModel.findOne({ _id: session })

                        req.session.userId = UserOTPVerificationRecords[0].userId.toString();
                        await userModel.updateOne(
                            { _id: UserOTPVerificationRecords[0].userId },
                            { $set: { is_verified: true } }
                        )
                        const userDetails = await userModel.findOne({ _id: UserOTPVerificationRecords[0].userId.toString() })
                        req.session.user_id = userDetails

                        await userOtpVerification.deleteMany({ _id: userId });

                        res.redirect("/");
                    }
                }
            }
        }
    } catch (error) {
        res.redirect(error.message);
    }
}





const loginLoad = async (req, res) => {
    try {
        let { message } = req.session
        req.session.message = ""
        let currentPage = 'login'
        let {userid} = req.session
        console.log(userid);
        res.render('login', { message,currentPage,userid})
    } catch (error) {
        console.log(error.message);
    } 
}


const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        // look single data doc that matches query

        const userData = await userModel.findOne({ email: email })

        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password)
            // const passwordMatch = await userModel.findOne({email:email,password:password})
            if (passwordMatch) {

                if (userData.is_verified === false) {
                    req.session.message = "email verification required"
                    res.redirect('/login' )
                } else {
                    // console.log("hello");
                    req.session.userid = userData._id

                    res.redirect("/");
                }

            } else {
                req.session.message = "Oops..username and password incorrect "
                res.redirect('/login')
            }
        } else {
            // console.log("hai");
            req.session.message =  "Oops.. User Is Not Registerd,Please register" 
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)

    }
}

const homeLoad = async (req, res) => {
    try {
        const { userid } = req.session;

        const user = await userModel.findOne({ _id: userid });
        const banner = await bannerModel.find({status : true})
        let currentPage = 'home'; // Define currentPage here
        console.log(banner,"bannners");
        res.render('index', { user, userid, currentPage,banner }); // Pass currentPage to the template
    } catch (error) {
        console.log(error.message);
    }
};

const shopLoad = async (req, res) => {
    try {
        // const categories = await catModel.find({ list: true })

        // const product = await productModel.find({ list: true })
        // const { userid } = req.session
        // const user = await userModel.findOne({ _id: userid, })
        // const { cat, search } = req.query
        // console.log(req.body,"this body");
        const { selectedCategories, selectedSize, selectedColors ,searchInput} = req.body
        // const condition = { list: true }
        

        if(selectedCategories || selectedColors || selectedSize || searchInput){
            // console.log(selectedColors);

            if (selectedCategories) {
                req.session.category = selectedCategories
                // console.log(req.session.category);

            }
            // if (search) {
            //     condition.name = { $regex: search, $options: "i" };
            // }
            if (selectedSize) {
                isSizeIn = await productModel.find({ size: selectedSize })
                if (isSizeIn) {
                   req.session.size = selectedSize
                }
                
            }
            if(selectedColors){
                isColorIn = await productModel.find({color:selectedColors})
                if(isColorIn){
                    req.session.color=selectedColors
                }
            } 
            if(searchInput){
                
                isSerchIn = await productModel.find({ name : { $regex: searchInput, $options: 'i' }})
                if(isSerchIn){
                    console.log(isSerchIn);
                    req.session.searchInput=searchInput
                }
            }

            res.json({success:true})
            
        }else{
            // console.log("haaai");
            
            
            
            // const product = await productModel.find({ list: true })
            const condition = { list: true }
            // console.log(req.session,'this is session');
            if ( req.session ){

                const { color,size,category,searchInput} = req.session

                if(searchInput){
                    // isSearchIn = await productModel.find({name : {$regex : searchInput ,$options:'i'} })
                    // if(isSearchIn){
                        condition.name = {$regex : searchInput ,$options:'i'} 
                    }
                    delete req.session.searchInput;

                
                if(category){
                    if(category==='All'){
                        condition.category
                    }else{
                    // console.log("hellllooooooooosdkjfhauklsdgfkjhasdfg");
                    // let categorys = category.join(', ') 
                    condition.category = category
                    }
                }
                delete req.session.category;


                if(color){
                    // let arrayAsString = color
                    let queryConditions = { $in: color } ;
                    isColorIn = await productModel.find({ color: queryConditions})
                    // console.log(color,"this is color");
                    if(isColorIn){
                    condition.color = queryConditions
                    }
                }

                delete req.session.color

                if(size){
                    // let arrayAsString = size
                    // console.log(arrayAsString,"asdhfjkasdhfkjlasdhfkjl;sdfja;klsdf");
                    let queryConditions = { $in: size } ;

                    isSizeIn = await productModel.find({size : queryConditions})
                    // console.log(isSizeIn,"this is in or not");
                    if(isSizeIn){
                    condition.size = queryConditions
                    }
                }
                delete req.session.size
            }

            const {userid} = req.session
            const user = await userModel.findOne({ _id: userid })
            // const { cat, search } = req.query
            // const { selectedCategories, selectedSize, selectedColors } = req.body
        
        // console.log(size)
        // if (cat) {
        //     condition.category = cat
        // }
        // if (search) {
        //     condition.name = { $regex: search, $options: "i" };
        // }
        // if (size) {
        //     isSizeIn = await productModel.find({ size: size })
        //     if (isSizeIn) {
        //         condition.size = size
        //     }

        // }
        // console.log(condition,"this is condition");

        const products = await productModel.find(condition).populate({
            path : 'offer',
            match :  { startingDate : { $lte : new Date() }, expiryDate : { $gte : new Date() }}
        }) .populate({
            path : 'category',
            populate : {
                path : 'offer',
                match : { startingDate : { $lte : new Date() }, expiryDate : { $gte : new Date() }}
            }
        })
        const productsCount = await productModel.find({ list: true }).populate("category").count()
        const count = await productModel.find(condition).populate("category").count()
        const categories = await catModel.find({ list: true })
        let currentPage = 'shop';
        res.render('shop',
            {
                userid, user,
                categories,
                products,
                currentPage,
                count, productsCount
            })
        }

    } catch (error) {
        console.log(error.message);
    }
}


const showProductDetails = async (req, res) => {
    try {
        const { userid } = req.session
        const user = await userModel.findOne({ _id: userid })

        const { id } = req.query
        let currentPage = 'shop';


        const product = await productModel.findById({ _id: id }).populate({
            path : 'offer',
            match :  { startingDate : { $lte : new Date() }, expiryDate : { $gte : new Date() }}
        }) .populate({
            path : 'category',
            populate : {
                path : 'offer',
                match : { startingDate : { $lte : new Date() }, expiryDate : { $gte : new Date() }}
            }
        })
    
        res.render('productDetails', { userid, product, user,currentPage })

    } catch (error) {
        console.log(error.message);
    }
}


const loadProfile = async (req, res) => {
    try {
        const { userid } = req.session

        const user = await userModel.findOne({ _id: userid })
        let currentPage = 'profile'
        res.render('profile', { user, userid,currentPage })
    } catch (error) {
        console.log(error.message);
    }
}

const manageAddress = async (req, res) => {
    try {
        const { userid } = req.session 
        const user = await userModel.findOne({ _id: userid })
        let currentPage = 'profile'
        res.render('address', { userid, user ,currentPage})
    } catch (error) {
        console.log(error.message);
    }
}

const addAddress = async (req, res) => {
    try {
        const { userid } = req.session
        const user = await userModel.findOne({ _id: userid })
        let currentPage = 'profile'
        res.render('addAddress', { userid, user,currentPage })
    } catch (error) {
        console.log(error.message);
    }
}
const loadLogout = async (req, res) => {
    try {
      req.session.userid = null;
      res.redirect("/");
    } catch (error) {
      console.log(error.message);
    }
  };

const postAddress = async (req, res) => {
    try {
        const { userid } = req.session;
        const { name, housename, city, state, phone, pincode } = req.body;
        await userModel.updateOne(
            { _id: userid },
            {
                $push: {
                    address: {
                        name: name,
                        housename: housename,
                        city: city,
                        state: state,
                        phone: phone,
                        pincode: pincode,
                    },
                },
            },
        )
        res.redirect("/manageAddress");
    } catch (error) {
        console.log(error.message);
    }
}

const editaddress = async (req, res) => {
    try {

        const { userid } = req.session;
        const { id } = req.query;
        const user = await userModel.findOne({ _id: userid })
        const userAddress = await userModel.findOne(
            { _id: userid },
            { address: { $elemMatch: { _id: id } } }
        );
        let currentPage = 'profile'
        res.render("editAddress", { userid, userAddress: userAddress, user,currentPage });
    } catch (error) {
        console.log(error.message);
    }
}

const updateAddress = async (req, res) => {
    try {
        const { userid } = req.session;
        // const user = await userModel.findOne({ _id: userid })
        const { id, name, housename, city, state, pincode, phone } = req.body;
        await userModel.updateOne(
            { _id: userid, "address._id": id },
            {
                $set: {
                    "address.$.name": name,
                    "address.$.housename": housename,
                    "address.$.city": city,
                    "address.$.state": state,
                    "address.$.pincode": pincode,
                    "address.$.phone": phone,
                },
            }
        )
        res.redirect("/manageAddress");
    } catch (error) {
        console.log(error.message);
    }
}

const deleteAddress = async (req, res) => {
    try {
        const { userid } = req.session;
        const { addId } = req.body;
        await userModel.updateOne(
            { _id: userid },
            { $pull: { address: { _id: addId } } }
        )
        res.status(201).json({ message: "success deleted" });
    } catch (error) {
        console.log(error.message);
    }
}
const editProfile = async (req, res) => {
    try {
        const { userid } = req.session
        let currentPage = 'profile'
        const user = await userModel.findById({ _id: userid })
        res.render('editProfile', { user, userid,currentPage })
    } catch (error) {
        console.log(error.message);
    }
}
const updateProfile = async (req, res) => {
    try {
        const { userid } = req.session
        const { name, mobile, email } = req.body
        console.log(name);
        await userModel.updateOne({ _id: userid },
            {
                $set: {
                    name: name,
                    email: email,
                    mobile: mobile
                },
            })

        res.redirect('/profile')
    } catch (error) {
        console.log(error.message);
    }
}

const changePassword = async (req, res) => {
    try {
        const { userid } = req.session
        let currentPage = 'profile'
        const user = await userModel.findById({ _id: userid })
        res.render('changePassword', { user, userid,currentPage })
    } catch (error) {
        console.log(error.message);
    }
}

const updatePassword = async (req, res) => {
    try {
        const { userid } = req.session
        const { currentPassword, newPassword, confirmNewPassword } = req.body
        const user = await userModel.findById({ _id: userid })
        const passwordMatch = await bcrypt.compare(currentPassword, user.password)

        if (passwordMatch) {

            if (newPassword === confirmNewPassword) {
                const hashPassword = await bcrypt.hash(newPassword, 10)
                await userModel.updateOne(
                    { _id: userid },
                    { $set: { password: hashPassword } }
                )
                // req.flash("success","password has changed")
                res.redirect('/profile')
            } else {
                req.session.message = "new password and confirm password didin't match"
                res.redirect('/changePassword')
            }
        } else {
            req.session.message = "currentPassword didin't match"
            res.redirect('/changePassword')
        }

    } catch (error) {
        console.log(error.message);
    }

}

const lostPassEmailPage = async (req, res) => {
    try {
        const { message } = req.session
        req.session.message = ''
        let currentPage = 'login'
        res.render('forgetPassEmail', { message ,currentPage})
    } catch (error) {
        console.log(error.message);
    }
}

const forgetPassSendOtp = async (req, res) => {
    try {
        const { email } = req.body
        const emailExist = await userModel.findOne({ email: email })
        // console.log(email);

        if (emailExist) {

            req.session.user = emailExist._id

            const otps = `${Math.floor(1000 + Math.random() * 9000)}`
            //send OTP to the mail
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: true,
                auth: {
                    user: process.env.email_user,
                    pass: process.env.email_password
                }
            })

            console.log(otps)

            const mailOptions = {
                from: 'afridp@gmail.com',
                to: email,
                subject: 'Otp For Seting New Password',
                html: `${otps}`
            }

            await transporter.sendMail(mailOptions);

            let hashedOtp = await bcrypt.hash(otps, 10)
            req.session.otp = hashedOtp

            res.redirect('/forgPassOtpEnter')
        } else {
            req.session.message = 'This Email Is not registered with Us,plaease register'
            res.redirect('/lostPassEmailPage');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const forgetPassOtpEnterPage = async (req, res) => {
    try {
        let { message, otp, user } = req.session
        let currentPage = 'login'
        req.session.message = ''
        res.render('forgPassOtpEnter', { message, otp, user,currentPage })

    } catch (error) {
        console.log(error.message);
    }
}

const postForgetPassOtpVerify = async (req, res) => {
    try {
        const { otp, userOtp, user } = req.body;
        let currentPage = 'login'
        if (!await bcrypt.compare(otp, userOtp)) {
            req.session.message = 'invalid otp,please try again'
            res.redirect('/forgPassOtpEnter')
        } else {
            res.render('setNewPassword', { user,currentPage })


        }
    } catch (error) {
        console.log(error.message);
    }
}

const updateNewPassword = async (req, res) => {
    try {
        const { user, newPassword, confirmPassword } = req.body
        // const userToUpdate = await userModel.findById({_id:user})
        console.log(confirmPassword);
        const hashedPassword = await bcrypt.hash(confirmPassword, 10)
        await userModel.updateOne({ _id: user }, { $set: { password: hashedPassword } })
        res.redirect('/login')

    } catch (error) {
        console.log(error.message);
    }
}





























module.exports = {
    homeLoad,
    shopLoad,
    loginLoad,
    loadLogout,
    verifyLogin,
    loadRegister,
    postRegister,
    emailVerificationPage,
    emailVerification,
    showProductDetails,
    loadProfile,
    manageAddress,
    addAddress,
    postAddress,
    editaddress,
    updateAddress,
    deleteAddress,
    editProfile,
    updateProfile,
    changePassword,
    updatePassword,
    lostPassEmailPage,
    forgetPassSendOtp,
    forgetPassOtpEnterPage,
    postForgetPassOtpVerify,
    updateNewPassword


}