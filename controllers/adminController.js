const userModel = require('../models/userModel')
const dotenv = require('dotenv')
dotenv.config()



const credentials = {
    adminEmail: process.env.admin_email,
    adminPassword: process.env.admin_Password
};

const loadLogin = async (req, res) => {
    try {
        let { message } = req.session;

        if (req.session.adminSession) {

            res.locals.session = req.session.adminSession
            res.redirect('/admin/dashboard')
        } else {
            req.session.message = ""
            res.render('login', { message })

        }
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    try {
        let { email, password } = req.body
        let { adminEmail, adminPassword } = credentials
        console.log(adminEmail, adminPassword);
        if (adminEmail === email && adminPassword === password) {

            req.session.adminSession = adminEmail;

            res.redirect("/admin/dashboard")

        } else {
            req.session.message = "invalid admin details"
            res.render('login', { message })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async (req, res) => {
    try {
        res.render('index')
    } catch (error) {
        console.log(error.message);
    }
}

const loadLogout = async (req, res) => {
    try {
        req.session.adminSession = null;
        res.redirect("/admin");
    } catch (error) {
        res.redirect("/error500");
    }
}


const loadUsers = async (req, res) => {
    try {
        const users = await userModel.find({ is_verified: true });
        // console.log(users);
        res.render('users', { users: users });
    } catch (error) {
        console.log(error.message);
    }
}


const usersBlocked = async (req, res) => {
    try {

        const { userId } = req.body;

        const userToBlock = await userModel.findById({ _id: userId });

        if (userToBlock.is_blocked === false) {

            await userModel.findByIdAndUpdate(

                { _id: userId },
                { $set: { is_blocked: true } }

            );

            res.status(201).json({ message: true });

        } else {
            await userModel.findByIdAndUpdate(

                { _id: userId },
                { $set: { is_blocked: false } }
            )
            res.status(201).json({ message: false });
        }
    } catch (error) {
        console.log(error.message);
    }
}






module.exports = {
    verifyLogin,
    loadLogin,
    loadDashboard,
    loadLogout,
    loadUsers,
    usersBlocked
}
