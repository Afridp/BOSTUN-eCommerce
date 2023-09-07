const isAdminLogin = async (req, res,next) => {
    try {
        if (req.session.adminSession) {
            next();
        } else {
            res.redirect("/admin");
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = isAdminLogin;
