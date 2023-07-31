const userModel = require('../models/userModel')
const catModel = require('../models/categoryModel')
const productModel = require('../models/productModel')
const dotenv =require('dotenv')
const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer")
const userOtpVerification = require('../models/userOtpVerification')
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
                user: email_user,
                pass: email_password
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

                        req.session.userId = UserOTPVerificationRecords[0].userId.toString();
                        await userModel.updateOne(
                            { _id: UserOTPVerificationRecords[0].userId },
                            { $set: { is_verified: true } }
                        )

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
        res.render('login')
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
                    res.render('login', { message: "email verification required" })
                } else {
                    // console.log("hello");
                    req.session.user_id = userData._id
                    res.redirect("/");
                }

            } else {
                res.render('login', { message: "Oops..username and password incorrect " })
            }
        } else {
            // console.log("hai");
            res.render('login', { message: "Oops.. User Is Not Registerd" })
        }
    } catch (error) {
        console.log(error.message)

    }
}

const homeLoad = async (req, res) => {
    try {
        const session = req.session.user_id
        const user = await userModel.findOne({ _id: session })
        // console.log(user);
        res.render('index', { session, user });
    } catch (error) {
        console.log(error.message);
    }
}
const shopLoad = async (req, res) => {
    try {
        const category = await catModel.find({list:true}) 
        const product = await productModel.find({list:true})  
        
        
        const session = req.session.user_id

        const user = await userModel.findOne({ _id: session, })

        res.render('shop',
         {  session, user,  
            category : category,
            products : product})
            console.log(product);
    } catch (error) {
        console.log(error.message);
    }
}

const showProductDetails = async(req,res)=>{
    try {
        const session = req.session.user_id

        const id = req.query.id

        console.log(id);

        const product = await productModel.findById({_id:id})
        console.log(product);
       
        res.render('productDetails',{session,product})

    } catch (error) {
        console.log( error.message);    
    }
}


module.exports = {
    homeLoad,
    shopLoad,
    loginLoad,
    verifyLogin,
    loadRegister,
    postRegister,
    emailVerificationPage,
    emailVerification,
    showProductDetails,

}