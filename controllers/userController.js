const userModel = require('../models/userModel')
const catModel = require('../models/categoryModel')
const productModel = require('../models/productModel')
const bannerModel = require('../models/bannerModel')
const whishlistModel = require('../models/whishlistModel')
const dotenv = require('dotenv')
const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer")
const userOtpVerification = require('../models/userOtpVerification')
const { assign } = require('nodemailer/lib/shared')
const orderModel = require('../models/orderModel')
const crypto = require('crypto');
dotenv.config();

const securePassword = async (password) => {
    try {
        // console.log(password);
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (err) {
        next(err)

    }
}

const generateRandomOTP = () => {
    const otpLength = 4; // You can adjust the length of the OTP as needed
    const otpBuffer = crypto.randomBytes(otpLength);
    const otp = otpBuffer.toString('hex').slice(0, otpLength); // Convert to hexadecimal and take the first N characters
    return otp;
};

const loadRegister = async (req, res,next) => {
    try {
        let { message } = req.session
        req.session.message = ''
        res.render('registration', { message: message })
    } catch (err) {
        next(err)

    }

}
const postRegister = async (req, res, next) => {
    try {
   
        const existingUser = await userModel.findOne({
            $or: [{ email: req.body.email }, { mobile: req.body.mobile }]
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

                req.session.successMessage = "Otp send success"
                res.redirect("/emailVerificationpage");
            } else {
                res.render('registration', { message: "OOps..!Something went wrong.Please Retry" })
            }
        }
    } catch (err) {
        next(err)
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
        const otp = generateRandomOTP(); 

        console.log(otp);

        const mailOptions = {
            from: 'afridp@gmail.com',
            to: email,
            subject: 'Verify Your Email For Boston ',
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

    } catch (err) {
        next(err)
    }
}

const emailVerificationPage = async (req, res,next) => {
    try {
        const { successMessage,message, otpVerification } = req.session;
        
        //NOTE - commanded because to keep the otp verification details available when refreshing the page 
        // req.session.otpVerification = null  
        
        if (req.session) {
            req.session.message = "";
            req.session.successMessage = "";
        }
        
        
        res.render("emailVerification", {successMessage, message, otp: otpVerification })
    } catch (err) {
        next(err)
    }
}



const emailVerification = async (req, res,next) => {
    try {
        let { otp, userVerificationId } = req.body;
        req.session.successMessage = null
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
                       

                        req.session.otpVerification = userVerificationId;
                        req.session.message = "Invalid OTP,Please try again";

                        res.redirect("/emailVerificationpage");

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
                            req.session.successMessage = "Registered Successfully, Login to continue"
                        res.redirect("/login");
                    }
                }
            }
        }
    } catch (err) {
        next(err)
    }
}





const loginLoad = async (req, res,next) => {
    try {
        let { message } = req.session
        req.session.message = ""
        let successMessage = req.session.successMessage 
        console.log(req.session.successMessage);
        let currentPage = 'login'
        let { userid } = req.session

        res.render('login', { successMessage,message, currentPage, userid })
    } catch (err) {
        next(err)
    }
}


const verifyLogin = async (req, res,next) => {
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
                    res.redirect('/login')
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
            req.session.message = "Oops.. User Is Not Registerd,Please register"
            res.redirect('/login')
        }
    } catch (err) {
        next(err)

    }
}

const homeLoad = async (req, res,next) => {
    try {
        const { userid } = req.session;

        const user = await userModel.findOne({ _id: userid });
        const banner = await bannerModel.find({ status: true })
        let currentPage = 'home'; // Define currentPage here
        const bestSellers = await productModel.find({list : true}).limit(8)
        


        res.render('index', { user, userid, currentPage, banner, bestSellers }); // Pass currentPage to the template
    } catch (err) {
        next(err)
    }
};

const shopLoad = async (req, res,next) => {
    try {
        let { selectedCategories, selectedSize, selectedColors, searchInput, pageno, minPrice, maxPrice } = req.body

        // console.log(pageno,"haaai");
        if (selectedCategories || selectedColors || selectedSize || searchInput || pageno || minPrice || maxPrice) {
            if (selectedCategories) {
                req.session.category = selectedCategories
            }

            if (selectedSize) {
                let isSizeIn = await productModel.find({ size: selectedSize })
                if (isSizeIn) {
                    req.session.size = selectedSize
                }
            }
            if (selectedColors) {
                let isColorIn = await productModel.find({ color: selectedColors })
                if (isColorIn) {
                    req.session.color = selectedColors
                }
            }
            if (searchInput) {
                let isSerchIn = await productModel.find({ name: { $regex: searchInput, $options: 'i' } })
                if (isSerchIn) {

                    req.session.searchInput = searchInput
                }
            }
            if (pageno) {
                req.session.pageno = pageno
            }

            if (minPrice && maxPrice) {
                let productsInRange = await productModel.find({
                    price: {
                        $gte: minPrice, // Greater than or equal to minPrice
                        $lte: maxPrice, // Less than or equal to maxPrice
                    },
                });
                if (productsInRange) {
                    req.session.minPrice = minPrice
                    req.session.maxPrice = maxPrice
                }
            }
            res.json({ success: true })
        } else {
            const condition = { list: true }




            let skip = 0
            if (req.session) {
                const { color, size, category, searchInput, pageno, minPrice, maxPrice } = req.session

                if (searchInput) {

                    condition.name = { $regex: searchInput, $options: 'i' }
                }
                delete req.session.searchInput;
                if (category) {
                    if (category === 'All') {
                        condition.category
                    } else {
                        condition.category = category
                    }
                }
                delete req.session.category;
                if (color) {
                    let queryConditions = { $in: color };
                    let isColorIn = await productModel.find({ color: queryConditions })
                    if (isColorIn) {
                        condition.color = queryConditions
                    }
                }

                delete req.session.color
                if (size) {
                    let queryConditions = { $in: size };
                    let isSizeIn = await productModel.find({ size: queryConditions })
                    if (isSizeIn) {
                        condition.size = queryConditions
                    }
                }
                delete req.session.size

                if (minPrice && maxPrice) {
                    let queryConditions = {
                        $gte: minPrice, // Greater than or equal to minPrice
                        $lte: maxPrice // Less than or equal to maxPrice
                    }
                    let isPrizeIn = await productModel.find({ price: queryConditions })
                    if (isPrizeIn) {
                        condition.price = queryConditions
                    }
                }
                delete req.session.minPrice
                delete req.session.maxPrice
                if (pageno) {
                    let page = (pageno == undefined || pageno === 1) ? 1 : pageno
                    skip = (page === 1) ? 0 : (page - 1) * 6;
                }
                delete req.session.pageno

            }



            const { userid } = req.session
            const user = await userModel.findOne({ _id: userid })
            const products = await productModel.find(condition).populate({
                path: 'offer',
                match: { startingDate: { $lte: new Date() }, expiryDate: { $gte: new Date() } }
            }).populate({
                path: 'category',
                populate: {
                    path: 'offer',
                    match: { startingDate: { $lte: new Date() }, expiryDate: { $gte: new Date() } }
                }
            }).skip(skip).limit(6)

            const productsCount = await productModel.find(condition).populate("category").count()
            let totalPages = Math.ceil(productsCount / 6)
            const count = await productModel.find(condition).populate("category").count()
            const categories = await catModel.find({ list: true })
            const currentPage = 'shop';
            res.render('shop',
                {
                    userid, user,
                    categories,
                    products,
                    currentPage,
                    count, productsCount,
                    totalPages
                })
        }
    } catch (err) {
        next(err)
    }
}


const showProductDetails = async (req, res,next) => {
    try {
        const { userid } = req.session
        const user = await userModel.findOne({ _id: userid })

        const { id } = req.query
        let currentPage = 'shop';


        const product = await productModel.findById({ _id: id }).populate({
            path: 'offer',
            match: { startingDate: { $lte: new Date() }, expiryDate: { $gte: new Date() } }
        }).populate({
            path: 'category',
            populate: {
                path: 'offer',
                match: { startingDate: { $lte: new Date() }, expiryDate: { $gte: new Date() } }
            }
        })

        res.render('productDetails', { userid, product, user, currentPage })

    } catch (err) {
        next(err)
    }
}


const loadProfile = async (req, res,next) => {
    try {
        const { userid } = req.session

        const user = await userModel.findOne({ _id: userid })
        let currentPage = 'profile'
        res.render('profile', { user, userid, currentPage })
    } catch (err) {
        next(err)
    }
}

const manageAddress = async (req, res,next) => {
    try {
        const { userid } = req.session
        const user = await userModel.findOne({ _id: userid })
        let currentPage = 'profile'
        res.render('address', { userid, user, currentPage })
    } catch (err) {
        next(err)
    }
}

const addAddress = async (req, res,next) => {
    try {
        const { userid } = req.session
        const user = await userModel.findOne({ _id: userid })
        let currentPage = 'profile'
        res.render('addAddress', { userid, user, currentPage })
    } catch (err) {
        next(err)
    }
}
const loadLogout = async (req, res,next) => {
    try {
        req.session.userid = null;
        res.redirect("/");
    } catch (err) {
        next(err)
    }
};

const postAddress = async (req, res,next) => {
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
    } catch (err) {
        next(err)
    }
}

const editaddress = async (req, res,next) => {
    try {

        const { userid } = req.session;
        const { id } = req.query;
        const user = await userModel.findOne({ _id: userid })
        const userAddress = await userModel.findOne(
            { _id: userid },
            { address: { $elemMatch: { _id: id } } }
        );
        let currentPage = 'profile'
        res.render("editAddress", { userid, userAddress: userAddress, user, currentPage });
    } catch (err) {
        next(err)
    }
}

const updateAddress = async (req, res,next) => {
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
    } catch (err) {
        next(err)
    }
}

const deleteAddress = async (req, res,next) => {
    try {
        const { userid } = req.session;
        const { addId } = req.body;
        await userModel.updateOne(
            { _id: userid },
            { $pull: { address: { _id: addId } } }
        )
        res.status(201).json({ message: "success deleted" });
    } catch (err) {
        next(err)
    }
}
const editProfile = async (req, res,next) => {
    try {
        const { userid } = req.session
        let currentPage = 'profile'
        const user = await userModel.findById({ _id: userid })
        res.render('editProfile', { user, userid, currentPage })
    } catch (err) {
        next(err)
    }
}
const updateProfile = async (req, res,next) => {
    try {
        const { userid } = req.session
        const { name, mobile, email } = req.body

        await userModel.updateOne({ _id: userid },
            {
                $set: {
                    name: name,
                    email: email,
                    mobile: mobile
                },
            })

        res.redirect('/profile')
    } catch (err) {
        next(err)
    }
}

const changePassword = async (req, res,next) => {
    try {
        const { userid } = req.session
        let currentPage = 'profile'
        const user = await userModel.findById({ _id: userid })
        res.render('changePassword', { user, userid, currentPage })
    } catch (err) {
        next(err)
    }
}

const updatePassword = async (req, res,next) => {
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
                
                res.redirect('/profile')
            } else {
                req.session.message = "new password and confirm password didin't match"
                res.redirect('/changePassword')
            }
        } else {
            req.session.message = "currentPassword didin't match"
            res.redirect('/changePassword')
        }

    } catch (err) {
        next(err)
    }

}

const lostPassEmailPage = async (req, res,next) => {
    try {
        const { message } = req.session
        req.session.message = ''
        let currentPage = 'login'
        res.render('forgetPassEmail', { message, currentPage })
    } catch (err) {
        next(err)
    }
}

const forgetPassSendOtp = async (req, res,next) => {
    try {
        const { email } = req.body
        const emailExist = await userModel.findOne({ email: email })
       

        if (emailExist) {

            req.session.user = emailExist._id

            const otps = generateRandomOTP();
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
    } catch (err) {
        next(err)
    }
}

const forgetPassOtpEnterPage = async (req, res,next) => {
    try {
        let { message, otp, user } = req.session
        let currentPage = 'login'
        req.session.message = ''
        res.render('forgPassOtpEnter', { message, otp, user, currentPage })

    } catch (err) {
        next(err)
    }
}

const postForgetPassOtpVerify = async (req, res,next) => {
    try {
        const { otp, userOtp, user } = req.body;
        let currentPage = 'login'
        if (!await bcrypt.compare(otp, userOtp)) {
            req.session.message = 'invalid otp,please try again'
            res.redirect('/forgPassOtpEnter')
        } else {
            res.render('setNewPassword', { user, currentPage })


        }
    } catch (err) {
        next(err)
    }
}

const updateNewPassword = async (req, res,next) => {
    try {
        const { user, newPassword, confirmPassword } = req.body
        // const userToUpdate = await userModel.findById({_id:user})
        console.log(confirmPassword);
        const hashedPassword = await bcrypt.hash(confirmPassword, 10)
        await userModel.updateOne({ _id: user }, { $set: { password: hashedPassword } })
        res.redirect('/login')

    } catch (err) {
        next(err)
    }
}


const loadWhishlist = async (req, res,next) => {
    try {
        const { userid } = req.session
        const user = await userModel.findById({ _id: userid })
        const wishlist = await whishlistModel.findOne({ userId: userid }).populate(
            "items.product_Id"
        );

        let currentPage = ''
        res.render('whishlist', { currentPage, userid, user, wishlist })
    } catch (err) {
        next(err)
    }
}

const addToWhishlist = async (req, res,next) => {
    try {
        const { userid } = req.session
        const { id } = req.query
        const userWhishlist = await whishlistModel.findOne({ userId: userid })

        if (userWhishlist) {
            const findProduct = await whishlistModel.findOne({
                userId: userid,
                "items.product_Id": new mongoose.Types.ObjectId(id),
            });
        
            if (findProduct) {

                await whishlistModel.findOneAndUpdate(
                    {
                        userId: userid,
                        "items.product_Id": new mongoose.Types.ObjectId(id),
                    },
                    { new: true }
                );
            } else {

                await whishlistModel.updateOne(
                    { userId: userid },
                    {
                        $push: {
                            items: {
                                product_Id: new mongoose.Types.ObjectId(id),
                            },
                        },
                    }
                );
            }
        } else {
            const makeWhishlist = new whishlistModel({


                userId: userid,
                items: [
                    {
                        product_Id: new mongoose.Types.ObjectId(id),
                    },
                ],
            });
            await makeWhishlist.save();
        }

    } catch (err) {
        next(err)
    }
}

const deleteFromWishlist = async (req, res,next) => {
    try {
        const { userid } = req.session;
        let { product_Id } = req.body;
        let productId = new mongoose.Types.ObjectId(product_Id);
        await whishlistModel.updateOne(
            { userId: userid },
            {
                $pull: { items: { product_Id: productId } },
            }
        );
        const wishList = await whishlistModel.findOne({ userId: userid });
        res.status(201).json({
            message: "success and modified",
            wishListLength: wishList.items.length
        });
    } catch (err) {
        next(err)
    }
}
const cancelOrder = async (req, res,next) => {
    try {
        const { orderId, cancelReason } = req.body;
        let status1 = "waiting for approval";
        const cancelOrder = await orderModel.updateOne(
            { _id: orderId },
            { $set: { status: status1, cancelReason: cancelReason } }
        );
        if (cancelOrder) {
            const orders = await orderModel.findById({ _id: orderId });
            for (let order of orders.items) {
                await productModel.updateOne(
                    { _id: order.product },
                    { $inc: { quantity: order.quantity } }
                );
            }
            res.status(201).json({
                message: "Successfully updated and modified",
                status: status1,
            });
        } else {
            res.status(400).json({ message: "Seems like an error" });
        }
    } catch (err) {
        next(err)
    }
};























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
    cancelOrder,
    updatePassword,
    lostPassEmailPage,
    forgetPassSendOtp,
    forgetPassOtpEnterPage,
    postForgetPassOtpVerify,
    updateNewPassword,
    loadWhishlist,
    addToWhishlist,
    deleteFromWishlist


}