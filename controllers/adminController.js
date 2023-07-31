const userModel = require('../models/userModel')
const bcrypt = require('bcrypt');
const { assign } = require('nodemailer/lib/shared');


const credentials = {
    adminEmail: "afridafriperingaden@gmail.com",
    adminPassword: "12345"
};

const loadLogin = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async (req, res) => {
    try {
        let { email, password } = req.body
        let { adminEmail, adminPassword } = credentials
        if (adminEmail === email && adminPassword === password) {
            res.render("index")

        } else {
            res.render('login', { message: "not a admin" })
        }
    } catch (error) {

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
        console.log("haai");
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
    loadLogin,
    loadDashboard,
    loadUsers,
    usersBlocked
}
