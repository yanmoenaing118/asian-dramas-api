const AppError = require("./../utils/appError");

const sendErrDev = (err, req, res) => {
  if (!req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).render("error", {
      error: err,
    });
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err,
    stack: err.stack,
  });
};

const sendErrProd = (err, req, res) => {
  if (!req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).render("error", {
      error: {
        status: err.status,
        message: err.message,
      },
    });
  }

  console.log("sendErrProd", err.name);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log("UNKNOWN Error occured");
    console.log(err);
    res.status(500).json({
      status: "fail",
      message: "Something went very wrong",
    });
  }
};

const handleDuplicateKeyErrorDB = (err) => {
  const message = `The drama with this name "${err.keyValue.title}" already exists. Try adding extra infromation such as released year or country`;
  return new AppError(message, 400);
};

const handleInvalidIdDB = (err) => {
  return new AppError(`Invalid ${err.kind}: ${err.stringValue}`, 400);
};

const handleInvalidInputDB = (err) => {
  const message = `${err.message.split(":")[2]}`;
  console.log(message);
  return new AppError(message, 400);
};

const handleJWTExpired = (err) =>
  new AppError("Your token has expired. Log in again to access", 401);

const handleJsonWebTokenError = (err) =>
  new AppError("Invalid token. Log in again!", 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 400;
  if (process.env.NODE_ENV === "development") {
    sendErrDev(err, req, res);
  } else {
    let error = { ...err };
    if (error.code === 11000) error = handleDuplicateKeyErrorDB(err);
    if (err.name === "CastError") error = handleInvalidIdDB(err);
    if (err.name === "ValidationError") error = handleInvalidInputDB(err);
    if (err.name === "TokenExpiredError") error = handleJWTExpired(err);
    if (err.name === "JsonWebTokenError") error = handleJsonWebTokenError(err);
    // console.log( error );
    sendErrProd(error, req, res);
  }
};
