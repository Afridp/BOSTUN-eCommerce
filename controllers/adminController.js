const categoryModel = require('../models/categoryModel');
const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel')
const dotenv = require('dotenv')
dotenv.config()



const credentials = {
    adminEmail: process.env.admin_email,
    adminPassword: process.env.admin_password
};

const loadLogin = async (req, res, next) => {
    try {
        let { message } = req.session;

        if (req.session.adminSession) {

            res.locals.session = req.session.adminSession
            res.redirect('/admin/dashboard')
        } else {
            req.session.message = ''

            res.render('login', { message })

        }
    } catch (err) {
        next(err)
    }
}


const verifyLogin = async (req, res, next) => {
    try {
        let { email, password } = req.body
        let { adminEmail, adminPassword } = credentials
        console.log(adminEmail, adminPassword, "this is env");
        console.log(email, password, "this is body");
        if (adminEmail === email && adminPassword === password) {

            req.session.adminSession = adminEmail;

            res.redirect("/admin/dashboard")

        } else {
            req.session.message = "invalid admin details"
            res.redirect('/admin/')
        }
    } catch (err) {
        next(err)
    }
}
const loadDashboard = async (req, res, next) => {
    try {
        let usersData = [];
        let currentSalesYear = new Date(new Date().getFullYear(), 0, 1);
        let usersByYear = await userModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: currentSalesYear },
                    is_blocked: { $ne: true },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%m", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        for (let i = 1; i <= 12; i++) {
            let result = true;
            for (let j = 0; j < usersByYear.length; j++) {
                result = false;
                if (usersByYear[j]._id == i) {
                    usersData.push(usersByYear[j]);
                    break;
                } else {
                    result = true;
                }
            }
            if (result) usersData.push({ _id: i, count: 0 });
        }

        let userData = [];
        for (let i = 0; i < usersData.length; i++) {
            userData.push(usersData[i].count);
        }

        let sales = [];
        let salesByYear = await orderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: currentSalesYear },
                    status: { $ne: "cancelled" },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%m", date: "$createdAt" } },
                    total: { $sum: "$totalAmount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ])

        for (let i = 1; i <= 12; i++) {
            let result = true;
            for (let j = 0; j < salesByYear.length; j++) {
                result = false;
                if (salesByYear[j]._id == i) {
                    sales.push(salesByYear[j]);
                    break;
                } else {
                    result = true;
                }
            }
            if (result) sales.push({ _id: i, total: 0, count: 0 });
        }


        let salesData = [];
        for (let i = 0; i < sales.length; i++) {
            salesData.push(sales[i].total);
        }
        const profitMargin = 0.5;
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const latestOrders = await orderModel.find()
            .sort({ createdAt: -1 })
            .populate("user");

        const currentYearProfit = await orderModel.aggregate([
            {
                $match: {
                    status: "delivered",
                    $expr: { $eq: [{ $year: "$createdAt" }, currentYear] },
                },
            },
            {
                $group: {
                    _id: null,
                    profit: {
                        $sum: { $multiply: [profitMargin, "$totalAmount"] },
                    },
                },
            },
        ]);

        const revenue = await orderModel.aggregate([
            {
                $match: {
                    status: { $ne: "delivered" },
                },
            },
            { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
        ]);

        const monthlyEarning = await orderModel.aggregate([
            {
                $match: {
                    status: "delivered",
                    $expr: { $eq: [{ $month: "$createdAt" }, currentMonth] },
                },
            },
            { $group: { _id: null, earning: { $sum: "$totalAmount" } } },
        ]);

        const latestUsers = await userModel.find().sort({ createdAt: -1 }).limit(4);
        const pendingOrder = await orderModel.countDocuments({ status: "pending" });
        const placedOrder = await orderModel.countDocuments({ status: "placed" });
        const cancelledOrder = await orderModel.countDocuments({
            status: "cancelled",
        });
        const deliveredOrder = await orderModel.countDocuments({
            status: "delivered",
        });
        const countProduct = await productModel.countDocuments();
        const categoryCount = await categoryModel.countDocuments();
        res.render("index", {
            currentYearProfit,
            monthlyEarning,
            cancelledOrder,
            deliveredOrder,
            categoryCount,
            pendingOrder,
            countProduct,
            latestOrders,
            latestUsers,
            placedOrder,
            salesData,
            userData,
            revenue,
        });
    } catch (err) {
        next(err)
    }
};

const salesReport = async (req, res, next) => {
    try {
        const moment = require('moment')


        const firstOrder = await orderModel.find().sort({ createdAt: 1 })
        const lastOreder = await orderModel.find().sort({ createdAt: -1 })

        const salesReport = await orderModel.find({ status: "delivered" }).populate('user').sort({ createdAt: -1 })


        res.render('salesReport', {
            firstOrder: moment(firstOrder[0].createdAt).format("YYYY-MM-DD"),
            lastOrder: moment(lastOreder[0].createdAt).format("YYYY-MM-DD"),
            salesReport

        })
    } catch (err) {
        next(err)
    }
};

const datePicker = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.body
        const startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0);
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        const selectedDate = await orderModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDateObj,
                        $lte: endDateObj,
                    },
                    status: "delivered",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                },
            },
        ]);
        res.status(200).json({ selectedDate: selectedDate });
    } catch (err) {
        next(err)
    }
}


const loadLogout = async (req, res, next) => {
    try {
        req.session.adminSession = null;
        res.redirect("/admin");
    } catch (err) {
        next(err)
    }
}


const loadUsers = async (req, res, next) => {
    try {
        const users = await userModel.find({ is_verified: true });
        // console.log(users);
        res.render('users', { users: users });
    } catch (err) {
        next(err)
    }
}


const usersBlocked = async (req, res, next) => {
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
    } catch (err) {
        next(err)
    }
}






module.exports = {
    verifyLogin,
    loadLogin,
    loadDashboard,
    salesReport,
    datePicker,
    loadLogout,
    loadUsers,
    usersBlocked
}
