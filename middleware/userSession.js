const User = require('../models/userModel')


const isLogin = async (req, res, next) => {
    try {

        if (req.session.userid) {
            next()
        } else {
            res.redirect('/login')
        }

    } catch (err){
  
    console.log(err.message);
    }
}


const isBlock = async (req, res, next) => {
    try {

        const user = await User.findById({ _id: req.session.user_id })
        if (user) {
            if (user.is_blocked === 0) {
                next()
            } else {
                req.session.destroy()
                res.redirect('/login')
            }
        } else {
            res.redirect('/login')
        }


    } catch (err) {
        console.log(err.message);
    }
}

const isLogout = async (req, res, next) => {
    try {

        if (req.session.userid) {
            res.redirect('/')
        } else {
            next()
        }

    } catch (err) {
        console.log(err.message);
    }
}

module.exports = {
    isLogin,
    isLogout,
    isBlock
}