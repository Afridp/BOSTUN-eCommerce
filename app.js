const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/BostonE-Commerce")
.then(()=>console.log("connected to database"))
.catch(()=>console.log("error..!! failed to connect database"))



const express = require('express');
const app = express();
const nocache = require("nocache")
const path = require("path")


// var createError = require('http-errors');
// const session = require("express-session")
// const userController = require("./controllers/userController")
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');
// const auth = require('./middleware/auth')


// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(cookieParser());

app.use(nocache())



const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');



app.use('/', userRouter);

app.use('/admin', adminRouter);












app.listen(3000,()=>{
    console.log("server running");
})



// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;
