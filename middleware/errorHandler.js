const errorHandler = (err, req, res, next) => {
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || "Something went wrong";
  
    res.status(errStatus).render("error500");
  };
  
  module.exports = errorHandler;