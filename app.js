const dotenv = require('dotenv')
dotenv.config()
const mongoose = require("mongoose")
mongoose.connect(process.env.MONGO)
  .then(() => console.log("connected to database"))
  .catch(() => console.log("error..!! failed to connect database"))

// const flash = require('connect-flash');
const express = require('express');
const app = express();
const session = require('express-session')
const nocache = require("nocache")
const path = require("path")
const flash = require('connect-flash')
// const moment = require('moment');

// var logger = require('morgan');
app.use(flash())
app.set('view engine', 'ejs')


// app.use(logger('dev'));  
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(cookieParser());
app.use(nocache())
app.use(
  session({
    secret: 'key',
    saveUninitialized: true,
    resave: true
  })
)
//   app.use(flash())

// Date format
const shortDateFormat = "MMM Do YY"

// Middle ware for moment date
// app.locals.moment = moment;
// app.locals.shortDateFormat = shortDateFormat;

const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');


app.use('/admin', adminRouter);

app.use('/', userRouter);

// app.use((req, res) => {
//   res.status(404).render("error404");
// });










app.listen(3000, () => {
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
